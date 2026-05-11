import asyncio
import json
import os
import shutil
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import AsyncGenerator, List, Optional
from uuid import uuid4

import pytz
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel, Field
from starlette.background import BackgroundTask

try:
    import google.generativeai as genai
except ModuleNotFoundError:
    from google import genai

try:
    from playwright.async_api import TimeoutError as PlaywrightTimeoutError
    from playwright.async_api import async_playwright
except ModuleNotFoundError:
    async_playwright = None
    PlaywrightTimeoutError = TimeoutError

# -----------------------------------------------------------------------
# 0. 配置
# -----------------------------------------------------------------------
shanghai_tz = pytz.timezone("Asia/Shanghai")

credentials = json.load(open("credentials.json"))
API_KEY = credentials["API_KEY"]
BASE_URL = credentials.get("BASE_URL", "")
MODEL = credentials.get("MODEL", "gemini-2.5-pro")

if API_KEY.startswith("sk-"):
    extra_headers = {}
    if "openrouter.ai" in BASE_URL.lower():
        extra_headers = {
            "HTTP-Referer": "https://github.com/fogsightai/fogsight",
            "X-Title": "Fogsight - AI Animation Generator"
        }

    client = AsyncOpenAI(
        api_key=API_KEY,
        base_url=BASE_URL,
        default_headers=extra_headers
    )
    USE_GEMINI = False
else:
    os.environ["GEMINI_API_KEY"] = API_KEY
    gemini_client = genai.Client()
    USE_GEMINI = True

if API_KEY.startswith("sk-REPLACE_ME"):
    raise RuntimeError("请在环境变量里配置 API_KEY")

templates = Jinja2Templates(directory="templates")

RESPONSIVE_HTML_PROMPT = """
你是顶级的信息可视化导演、动画设计师和前端创意工程师。你的任务是生成一个完整、可直接运行的单文件 HTML，用动画讲清楚用户主题。

硬性输出规则（必须严格遵守）：
1. 默认直接输出原始 HTML 文档本体，不要包 Markdown，不要加解释、前言、总结、注释说明、项目符号、标题或任何围栏外文字。
2. 输出内容必须且只能是一个完整 HTML 文档：从 <!DOCTYPE html> 或 <html 开始，并以 </html> 结束。
3. 不要输出多个代码块、多个候选版本、片段式 HTML、伪代码、JSON、Markdown、``` 之外的围栏混排。
4. 如果你无法避免使用 fenced code block，那么整个回答也必须只包含唯一一个 ```html ... ``` 代码块，且代码块内部第一行就从 <!DOCTYPE html> 或 <html 开始；围栏外不得有任何字符。
5. 不要省略代码，不要使用“以下是代码”“下面是 HTML”“...”“省略其余部分”等文字。
6. HTML 内必须自包含所需的 CSS / JS / SVG，不依赖额外本地文件。
7. 内容要直接自动播放，不要添加“开始”“下一步”“重新播放”等交互按钮。

内容与表现要求：
1. 围绕主题讲清一个完整的小知识点或过程，兼顾知识准确性、叙事节奏与视觉吸引力。
2. 画面精美、有设计感，使用和谐耐看的浅色系或高可读配色，并提供中英双语关键说明 / 字幕。
3. 动画应像一个正在播放的短视频，具有明确的镜头推进、状态变化或步骤演进，而不是静态排版。
4. 文字说明要简洁清晰，避免堆砌；图形、旁白式字幕和场景变化要互相配合。

响应式与跨屏适配要求（必须满足）：
1. 必须同时适配桌面端与移动端，默认就是 responsive layout。
2. 使用 <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">。
3. 优先使用 width: 100vw / min(100vw, ...)、height: 100vh / 100dvh / min(100vh, ...)、百分比、flex、grid、aspect-ratio 等自适应布局。
4. 严禁把主舞台或关键元素写死为固定 1920x1080、2560x1440 等不可缩放画布；如需设定理想比例，请用容器自适应方案。
5. 广泛使用 clamp()、min()、max()、vmin、vmax、vw、vh，并配合 media queries 处理窄屏、横屏、9:16、16:9 等场景。
6. 移动端必须触控友好：字号、边距、按钮/可点击控件（若存在浏览器默认控件）不能过小；文本、图形、字幕不能溢出屏幕。
7. 在窄屏手机、竖屏 9:16、常见桌面 16:9 下，动画主体都应尽量完整可看，不能依赖超宽画布边缘信息。
8. 不要在 html/body 上全局锁死 overflow: hidden；如果内容可能超过视口，必须允许页面或主容器滚动，保证新窗口预览可上下滑动。
9. 避免绝对定位导致遮挡、穿模、字幕压住主体；层级、留白与安全边距要稳健。

工程质量要求：
1. 动画和样式应尽量流畅，避免明显卡顿或过度复杂的 DOM。
2. 若使用 SVG / Canvas / CSS 动画，请保证结构清晰、性能可接受。
3. 代码应可在现代桌面 Chrome / Edge / Safari 以及移动端浏览器中直接打开运行。
4. 不要输出空白页；确保 body 中有可见内容，动画能自动开始。
""".strip()

EXPORT_DEFAULT_WIDTH = 854
EXPORT_DEFAULT_HEIGHT = 480
EXPORT_DEFAULT_FPS = 6
EXPORT_DEFAULT_DURATION_SEC = 5
EXPORT_MIN_WIDTH = 320
EXPORT_MAX_WIDTH = 1280
EXPORT_MIN_HEIGHT = 240
EXPORT_MAX_HEIGHT = 1280
EXPORT_MIN_FPS = 6
EXPORT_MAX_FPS = 15
EXPORT_MIN_DURATION_SEC = 2
EXPORT_MAX_DURATION_SEC = 10
EXPORT_TIMEOUT_SEC = 90
EXPORT_MAX_HTML_CHARS = 250_000
CHROMIUM_EXECUTABLE_CANDIDATES = (
    os.environ.get("PLAYWRIGHT_CHROMIUM_PATH", ""),
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
)

# -----------------------------------------------------------------------
# 1. FastAPI 初始化
# -----------------------------------------------------------------------
app = FastAPI(title="AI Animation Backend", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")


class ChatRequest(BaseModel):
    topic: str
    history: Optional[List[dict]] = None


class ExportVideoRequest(BaseModel):
    html: str = Field(..., min_length=1, max_length=EXPORT_MAX_HTML_CHARS)
    topic: str = Field(default="animation", min_length=1, max_length=120)
    durationSec: Optional[int] = Field(default=EXPORT_DEFAULT_DURATION_SEC)
    width: Optional[int] = Field(default=EXPORT_DEFAULT_WIDTH)
    height: Optional[int] = Field(default=EXPORT_DEFAULT_HEIGHT)
    fps: Optional[int] = Field(default=EXPORT_DEFAULT_FPS)


# -----------------------------------------------------------------------
# 2. 核心：流式生成器
# -----------------------------------------------------------------------
def generate_prompt(topic: str) -> str:
    return (
        f"{RESPONSIVE_HTML_PROMPT}\n\n"
        f"当前主题：{topic}\n"
        "请直接返回最终 HTML 文档本体；不要附加任何解释。"
    )


def clamp(value: int, minimum: int, maximum: int) -> int:
    return max(minimum, min(value, maximum))


def sanitize_filename(value: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in ("-", "_") else "_" for ch in value.strip())
    safe = safe.strip("_")
    return safe[:60] or "animation"


def cleanup_temp_dir(path: str) -> None:
    shutil.rmtree(path, ignore_errors=True)


def get_chromium_executable_path() -> Optional[str]:
    for candidate in CHROMIUM_EXECUTABLE_CANDIDATES:
        if candidate and os.path.exists(candidate):
            return candidate
    return None


async def llm_event_stream(
    topic: str,
    history: Optional[List[dict]] = None,
    model: str = None,
) -> AsyncGenerator[str, None]:
    history = history or []

    if model is None:
        model = MODEL

    system_prompt = generate_prompt(topic)

    if USE_GEMINI:
        try:
            prompt_parts = [system_prompt]
            if history:
                history_text = "\n".join(
                    [f"{msg['role']}: {msg['content']}" for msg in history if msg.get('content')]
                )
                if history_text:
                    prompt_parts.insert(0, history_text)
            full_prompt = "\n\n".join(prompt_parts)

            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: gemini_client.models.generate_content(
                    model=model,
                    contents=full_prompt
                )
            )

            text = response.text
            chunk_size = 50

            for i in range(0, len(text), chunk_size):
                chunk = text[i:i + chunk_size]
                payload = json.dumps({"token": chunk}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.05)

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return
    else:
        messages = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": topic},
        ]

        try:
            response = await client.chat.completions.create(
                model=model,
                messages=messages,
                stream=True,
                temperature=0.8,
            )
        except OpenAIError as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        async for chunk in response:
            token = chunk.choices[0].delta.content or ""
            if token:
                payload = json.dumps({"token": token}, ensure_ascii=False)
                yield f"data: {payload}\n\n"
                await asyncio.sleep(0.001)

    yield 'data: {"event":"[DONE]"}\n\n'


async def render_video_export(payload: ExportVideoRequest) -> tuple[str, str, str]:
    if async_playwright is None:
        raise HTTPException(status_code=500, detail="服务端未安装 Playwright，暂时无法导出视频。")

    html = payload.html.strip()
    if not html:
        raise HTTPException(status_code=400, detail="html 不能为空。")
    if len(html) > EXPORT_MAX_HTML_CHARS:
        raise HTTPException(status_code=400, detail=f"html 过大，最多允许 {EXPORT_MAX_HTML_CHARS} 个字符。")

    width = clamp(payload.width or EXPORT_DEFAULT_WIDTH, EXPORT_MIN_WIDTH, EXPORT_MAX_WIDTH)
    height = clamp(payload.height or EXPORT_DEFAULT_HEIGHT, EXPORT_MIN_HEIGHT, EXPORT_MAX_HEIGHT)
    fps = clamp(payload.fps or EXPORT_DEFAULT_FPS, EXPORT_MIN_FPS, EXPORT_MAX_FPS)
    duration_sec = clamp(payload.durationSec or EXPORT_DEFAULT_DURATION_SEC, EXPORT_MIN_DURATION_SEC, EXPORT_MAX_DURATION_SEC)
    frame_count = max(1, fps * duration_sec)

    if shutil.which("ffmpeg") is None:
        raise HTTPException(status_code=500, detail="服务端缺少 ffmpeg，暂时无法导出视频。")

    chromium_executable = get_chromium_executable_path()
    if chromium_executable is None:
        raise HTTPException(status_code=500, detail="服务端缺少 Chromium 可执行文件，暂时无法导出视频。")

    temp_dir = tempfile.mkdtemp(prefix="fogsight-export-")
    frames_dir = Path(temp_dir) / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    output_path = Path(temp_dir) / "output.mp4"
    page = None
    browser = None

    async def block_external_requests(route):
        request = route.request
        url = request.url
        if url.startswith(("http://", "https://")):
            await route.abort()
            return
        await route.continue_()

    try:
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                executable_path=chromium_executable,
                headless=True,
                args=[
                    "--disable-background-networking",
                    "--disable-extensions",
                    "--disable-sync",
                    "--metrics-recording-only",
                    "--mute-audio",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--disable-default-apps",
                    "--disable-component-update",
                    "--disable-domain-reliability",
                ],
            )
            context = await browser.new_context(
                viewport={"width": width, "height": height},
                screen={"width": width, "height": height},
                device_scale_factor=1,
                java_script_enabled=True,
                bypass_csp=False,
                ignore_https_errors=True,
            )
            await context.route("**/*", block_external_requests)
            page = await context.new_page()
            await page.add_init_script(
                """
                (() => {
                  const blocked = () => Promise.reject(new Error('External network access is disabled during video export.'));
                  window.fetch = blocked;
                  const OriginalXHR = window.XMLHttpRequest;
                  window.XMLHttpRequest = function() {
                    const xhr = new OriginalXHR();
                    xhr.open = function() { throw new Error('XMLHttpRequest is disabled during video export.'); };
                    return xhr;
                  };
                  const OriginalWebSocket = window.WebSocket;
                  window.WebSocket = function() { throw new Error('WebSocket is disabled during video export.'); };
                  if (OriginalWebSocket) window.WebSocket.prototype = OriginalWebSocket.prototype;
                })();
                """
            )
            await page.set_content(html, wait_until="load", timeout=15_000)
            await page.wait_for_timeout(800)

            frame_interval_ms = max(1, int(1000 / fps))
            for index in range(frame_count):
                frame_path = frames_dir / f"frame-{index:04d}.png"
                await page.screenshot(path=str(frame_path), type="png")
                if index < frame_count - 1:
                    await page.wait_for_timeout(frame_interval_ms)

            ffmpeg_command = [
                "ffmpeg",
                "-y",
                "-framerate",
                str(fps),
                "-i",
                str(frames_dir / "frame-%04d.png"),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                str(output_path),
            ]
            completed = await asyncio.to_thread(
                subprocess.run,
                ffmpeg_command,
                check=False,
                capture_output=True,
                text=True,
            )
            if completed.returncode != 0:
                stderr = (completed.stderr or completed.stdout or "ffmpeg failed").strip()
                raise HTTPException(status_code=500, detail=f"ffmpeg 合成失败：{stderr[:1200]}")

            if not output_path.exists() or output_path.stat().st_size <= 0:
                raise HTTPException(status_code=500, detail="视频导出失败：输出文件为空。")

            return temp_dir, str(output_path), sanitize_filename(payload.topic)
    except PlaywrightTimeoutError:
        cleanup_temp_dir(temp_dir)
        raise HTTPException(status_code=504, detail="服务端渲染超时，请缩短动画复杂度后重试。")
    except HTTPException:
        cleanup_temp_dir(temp_dir)
        raise
    except Exception as exc:
        cleanup_temp_dir(temp_dir)
        raise HTTPException(status_code=500, detail=f"服务端渲染失败：{str(exc)[:1200]}") from exc
    finally:
        if page is not None:
            try:
                await page.close()
            except Exception:
                pass
        if browser is not None:
            try:
                await browser.close()
            except Exception:
                pass


# -----------------------------------------------------------------------
# 3. 路由
# -----------------------------------------------------------------------
@app.post("/generate")
async def generate(
    chat_request: ChatRequest,
    request: Request,
):
    accumulated_response = ""

    async def event_generator():
        nonlocal accumulated_response
        try:
            async for chunk in llm_event_stream(chat_request.topic, chat_request.history):
                accumulated_response += chunk
                if await request.is_disconnected():
                    break
                yield chunk
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    async def wrapped_stream():
        async for chunk in event_generator():
            yield chunk

    headers = {
        "Cache-Control": "no-store",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(wrapped_stream(), headers=headers)


@app.post("/export-video")
async def export_video(payload: ExportVideoRequest):
    try:
        temp_dir, output_path, safe_topic = await asyncio.wait_for(
            render_video_export(payload),
            timeout=EXPORT_TIMEOUT_SEC,
        )
    except asyncio.TimeoutError as exc:
        raise HTTPException(status_code=504, detail="服务端视频导出超时，请稍后重试或降低内容复杂度。") from exc

    return FileResponse(
        path=output_path,
        media_type="video/mp4",
        filename=f"{safe_topic}-{uuid4().hex[:8]}.mp4",
        background=BackgroundTask(cleanup_temp_dir, temp_dir),
    )


@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "time": datetime.now(shanghai_tz).strftime("%Y%m%d%H%M%S")
        }
    )


# -----------------------------------------------------------------------
# 4. 本地启动命令
# -----------------------------------------------------------------------
# uvicorn app:app --reload --host 0.0.0.0 --port 8000

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
