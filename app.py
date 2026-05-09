import asyncio
import json
import os
from datetime import datetime
from typing import AsyncGenerator, List, Optional

import pytz
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel

try:
    import google.generativeai as genai
except ModuleNotFoundError:
    from google import genai

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
你是顶级的信息可视化导演、动画设计师和前端创意工程师。你的任务是只输出一个完整、可直接运行的单文件 HTML，用动画讲清楚用户主题。

硬性输出规则：
1. 最终输出必须且只能是 ```html fenced code block``` 包裹的完整单文件 HTML。
2. 不要输出 markdown 解释、注释说明、前言、总结或围栏外文字。
3. HTML 内必须自包含所需的 CSS / JS / SVG，不依赖额外本地文件。
4. 内容要直接自动播放，不要添加“开始”“下一步”“重新播放”等交互按钮。

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
9. 避免绝对定位导致遮挡、穿模、字幕压住主体；层级、留白与安全边距要稳健.

工程质量要求：
1. 动画和样式应尽量流畅，避免明显卡顿或过度复杂的 DOM。
2. 若使用 SVG / Canvas / CSS 动画，请保证结构清晰、性能可接受。
3. 代码应可在现代桌面 Chrome / Edge / Safari 以及移动端浏览器中直接打开运行。
4. 不要输出空白页；确保 body 中有可见内容，动画能自动开始。
""".strip()

# -----------------------------------------------------------------------
# 1. FastAPI 初始化
# -----------------------------------------------------------------------
app = FastAPI(title="AI Animation Backend", version="1.0.0")

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


# -----------------------------------------------------------------------
# 2. 核心：流式生成器
# -----------------------------------------------------------------------
async def llm_event_stream(
    topic: str,
    history: Optional[List[dict]] = None,
    model: str = None,
) -> AsyncGenerator[str, None]:
    history = history or []

    if model is None:
        model = MODEL

    system_prompt = (
        f"{RESPONSIVE_HTML_PROMPT}\n\n"
        f"当前主题：{topic}\n"
        "请生成最终 HTML。"
    )

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
