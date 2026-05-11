import asyncio
import json
import os
import re
import shutil
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, List, Optional
from uuid import uuid4

import pytz
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel, Field, field_validator
from starlette.background import BackgroundTask

try:
    import google.generativeai as legacy_genai
except ModuleNotFoundError:
    legacy_genai = None

try:
    from google import genai as google_genai
except ModuleNotFoundError:
    google_genai = None

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
APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
CREDENTIALS_PATH = APP_DIR / "credentials.json"
CREDENTIALS_OVERLAY_PATH = DATA_DIR / "credentials.local.json"
CREDENTIALS_FILE_MODE = 0o600


def get_writable_credentials_path() -> Path:
    """Return the path where runtime credential changes are saved.

    The default credentials.json is often mounted read-only, so we write to a
    local overlay file that takes precedence when present.
    """
    return CREDENTIALS_OVERLAY_PATH


def ensure_credentials_file_mode() -> None:
    try:
        os.chmod(get_writable_credentials_path(), CREDENTIALS_FILE_MODE)
    except OSError:
        pass


class RuntimeCredentials(BaseModel):
    api_key: str = Field(alias="API_KEY")
    base_url: str = Field(default="", alias="BASE_URL")
    model: str = Field(default="gemini-2.5-pro", alias="MODEL")

    model_config = {"populate_by_name": True}

    @field_validator("api_key", "base_url", "model", mode="before")
    @classmethod
    def normalize_string(cls, value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()

    def to_storage_dict(self) -> dict[str, str]:
        return {
            "API_KEY": self.api_key,
            "BASE_URL": self.base_url,
            "MODEL": self.model,
        }


class ModelSettingsUpdateRequest(BaseModel):
    baseUrl: str
    model: str
    apiKey: Optional[str] = None

    @field_validator("baseUrl", "model", mode="before")
    @classmethod
    def normalize_required_string(cls, value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()

    @field_validator("apiKey", mode="before")
    @classmethod
    def normalize_optional_api_key(cls, value: Any) -> Optional[str]:
        if value is None:
            return None
        return str(value).strip()


class ModelSettingsTestRequest(BaseModel):
    baseUrl: str
    model: str
    apiKey: Optional[str] = None

    @field_validator("baseUrl", "model", mode="before")
    @classmethod
    def normalize_required_string(cls, value: Any) -> str:
        if value is None:
            return ""
        return str(value).strip()

    @field_validator("apiKey", mode="before")
    @classmethod
    def normalize_optional_api_key(cls, value: Any) -> Optional[str]:
        if value is None:
            return None
        return str(value).strip()


class ChatRequest(BaseModel):
    topic: str
    history: Optional[List[dict]] = None


class ExportVideoRequest(BaseModel):
    html: str = Field(..., min_length=1, max_length=250_000)
    topic: str = Field(default="animation", min_length=1, max_length=120)
    durationSec: Optional[int] = Field(default=5)
    width: Optional[int] = Field(default=854)
    height: Optional[int] = Field(default=480)
    fps: Optional[int] = Field(default=6)


credentials_lock = asyncio.Lock()


def load_runtime_credentials() -> RuntimeCredentials:
    overlay = CREDENTIALS_OVERLAY_PATH
    primary = overlay if overlay.exists() else CREDENTIALS_PATH
    if not primary.exists():
        raise RuntimeError(f"credentials.json 不存在：{CREDENTIALS_PATH}")

    with primary.open("r", encoding="utf-8") as file:
        raw = json.load(file)

    credentials = RuntimeCredentials.model_validate(raw)
    if not credentials.api_key:
        raise RuntimeError("请先配置 API_KEY")
    return credentials


async def save_runtime_credentials(payload: ModelSettingsUpdateRequest) -> RuntimeCredentials:
    if not payload.model:
        raise HTTPException(status_code=400, detail="model 不能为空。")
    if not payload.baseUrl:
        raise HTTPException(status_code=400, detail="baseUrl 不能为空。")

    async with credentials_lock:
        current = load_runtime_credentials()
        next_credentials = RuntimeCredentials(
            API_KEY=current.api_key if payload.apiKey in (None, "") else payload.apiKey,
            BASE_URL=payload.baseUrl,
            MODEL=payload.model,
        )

        dest = get_writable_credentials_path()
        dest.parent.mkdir(parents=True, exist_ok=True)
        temp_path = dest.parent / f"credentials.tmp-{uuid4().hex}"
        try:
            with temp_path.open("w", encoding="utf-8") as file:
                json.dump(next_credentials.to_storage_dict(), file, ensure_ascii=False, indent=2)
                file.write("\n")
                file.flush()
                os.fsync(file.fileno())
            os.chmod(temp_path, CREDENTIALS_FILE_MODE)
            os.replace(temp_path, dest)
            ensure_credentials_file_mode()
        finally:
            if temp_path.exists():
                temp_path.unlink(missing_ok=True)

    return next_credentials


def build_openai_client(credentials: RuntimeCredentials) -> AsyncOpenAI:
    extra_headers = {}
    if credentials.base_url and "openrouter.ai" in credentials.base_url.lower():
        extra_headers = {
            "HTTP-Referer": "https://github.com/fogsightai/fogsight",
            "X-Title": "Fogsight - AI Animation Generator",
        }

    client_kwargs: dict[str, Any] = {
        "api_key": credentials.api_key,
        "default_headers": extra_headers,
    }
    if credentials.base_url:
        client_kwargs["base_url"] = credentials.base_url
    return AsyncOpenAI(**client_kwargs)


def should_use_openai_compatible(credentials: RuntimeCredentials) -> bool:
    return credentials.api_key.startswith("sk-")


def mask_secret(value: str) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}***{value[-4:]}"


def redact_sensitive_text(text: str, secrets: Optional[list[str]] = None) -> str:
    redacted = str(text or "")
    for secret in secrets or []:
        secret = (secret or "").strip()
        if secret:
            redacted = redacted.replace(secret, mask_secret(secret))

    redacted = re.sub(r"Bearer\s+[A-Za-z0-9_\-\.]+", "Bearer ***", redacted, flags=re.IGNORECASE)
    redacted = re.sub(r"sk-[A-Za-z0-9_\-]+", "sk-***", redacted)
    redacted = re.sub(r"(?i)(api[_\s-]*key\s*[:=]\s*)([^\s,;]+)", r"\1***", redacted)
    return redacted[:500]


async def run_model_test(credentials: RuntimeCredentials) -> Dict[str, Any]:
    model = (credentials.model or "").strip()
    if not model:
        raise HTTPException(status_code=400, detail="model 不能为空。")
    if not credentials.base_url and should_use_openai_compatible(credentials):
        raise HTTPException(status_code=400, detail="baseUrl 不能为空。")
    if not credentials.api_key:
        raise HTTPException(status_code=400, detail="请先配置 API_KEY。")

    prompt_messages = [
        {"role": "system", "content": "Reply with exactly: OK"},
        {"role": "user", "content": "Ping"},
    ]

    try:
        if should_use_openai_compatible(credentials):
            client = build_openai_client(credentials)
            response = await asyncio.wait_for(
                client.chat.completions.create(
                    model=model,
                    messages=prompt_messages,
                    max_tokens=8,
                    temperature=0,
                ),
                timeout=20,
            )
            reply = ((response.choices[0].message.content if response.choices else "") or "").strip()
        else:
            if google_genai is not None:
                os.environ["GEMINI_API_KEY"] = credentials.api_key
                gemini_client = google_genai.Client()
                response = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: gemini_client.models.generate_content(
                            model=model,
                            contents="Reply with exactly: OK",
                        ),
                    ),
                    timeout=20,
                )
                reply = (getattr(response, "text", "") or "").strip()
            elif legacy_genai is not None:
                response = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda: (
                            legacy_genai.configure(api_key=credentials.api_key),
                            legacy_genai.GenerativeModel(model).generate_content("Reply with exactly: OK"),
                        )[1],
                    ),
                    timeout=20,
                )
                reply = (getattr(response, "text", "") or "").strip()
            else:
                raise RuntimeError("Gemini SDK 未安装，无法使用当前 API_KEY 配置。")

        safe_reply = redact_sensitive_text(reply, [credentials.api_key]).strip()
        message = f"模型可用：{safe_reply}" if safe_reply else "模型可用。"
        return {"ok": True, "model": model, "message": message}
    except HTTPException:
        raise
    except asyncio.TimeoutError as exc:
        raise HTTPException(status_code=504, detail="模型测试超时，请检查服务地址或稍后重试。") from exc
    except OpenAIError as exc:
        raise HTTPException(status_code=400, detail=redact_sensitive_text(str(exc), [credentials.api_key])) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=redact_sensitive_text(str(exc), [credentials.api_key])) from exc


INITIAL_CREDENTIALS = load_runtime_credentials()
if INITIAL_CREDENTIALS.api_key.startswith("sk-REPLACE_ME"):
    raise RuntimeError("请在环境变量里配置 API_KEY")
ensure_credentials_file_mode()

templates = Jinja2Templates(directory=str(APP_DIR / "templates"))

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
app.mount("/static", StaticFiles(directory=str(APP_DIR / "static")), name="static")


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
    credentials = load_runtime_credentials()
    model = (model or credentials.model or "").strip()
    if not model:
        raise RuntimeError("MODEL 未配置。")

    system_prompt = generate_prompt(topic)

    if should_use_openai_compatible(credentials):
        client = build_openai_client(credentials)
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
    else:
        if google_genai is not None:
            os.environ["GEMINI_API_KEY"] = credentials.api_key
            gemini_client = google_genai.Client()
            generate_content = lambda: gemini_client.models.generate_content(
                model=model,
                contents=full_prompt,
            )
        elif legacy_genai is not None:
            legacy_genai.configure(api_key=credentials.api_key)
            generate_content = lambda: legacy_genai.GenerativeModel(model).generate_content(full_prompt)
        else:
            raise RuntimeError("Gemini SDK 未安装，无法使用当前 API_KEY 配置。")

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
                generate_content,
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
@app.get("/settings/model")
async def get_model_settings():
    credentials = load_runtime_credentials()
    return JSONResponse(
        {
            "baseUrl": credentials.base_url,
            "model": credentials.model,
            "apiKeyConfigured": bool(credentials.api_key),
        }
    )


@app.post("/settings/model")
async def update_model_settings(payload: ModelSettingsUpdateRequest):
    credentials = await save_runtime_credentials(payload)
    return JSONResponse(
        {
            "ok": True,
            "baseUrl": credentials.base_url,
            "model": credentials.model,
            "apiKeyConfigured": bool(credentials.api_key),
        }
    )


@app.post("/settings/model/test")
async def test_model_settings(payload: ModelSettingsTestRequest):
    current = load_runtime_credentials()
    credentials = RuntimeCredentials(
        API_KEY=current.api_key if payload.apiKey in (None, "") else payload.apiKey,
        BASE_URL=payload.baseUrl,
        MODEL=payload.model,
    )
    result = await run_model_test(credentials)
    return JSONResponse(result)


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
            "time": datetime.now(shanghai_tz).strftime("%Y%m%d%H%M%S"),
        },
    )


# -----------------------------------------------------------------------
# 4. 本地启动命令
# -----------------------------------------------------------------------
# uvicorn app:app --reload --host 0.0.0.0 --port 8000

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
