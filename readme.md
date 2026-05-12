# Fogsight (雾象) [**English**](./readme_en.md) | [**中文**](./readme.md)


<p align="center">
  <img src="https://github.com/hamutama/caimaopics/raw/main/fogsight/logos/fogsight_logo_white_bg.png"
       alt="Fogsight Logo"
       width="300">
</p>



**雾象是一款由大型语言模型（LLM）驱动的动画引擎 agent 。用户输入抽象概念或词语，雾象会将其转化为高水平的生动动画。**

将雾象部署在本地后，您只需输入词语，点击生成，便可得到动画。

您也可以直接访问网站 fogsight.ai 直接使用，免部署在线生成动画

<p align="center">
  <img  width="550" alt="UI" src="https://github.com/user-attachments/assets/71f1574e-bf26-4869-aa16-925e1c2276a7" />
</p>


我们设计了易用的语言用户界面（Language User Interface），用户也可以**进一步轻松编辑或改进生成动画，做到言出法随**。

雾象，意为 **“在模糊智能中的具象”**。*雾象是 WaytoAGI 开源计划项目成员。 WaytoAGI， 让更多人因 AI 而强大*

## 自用增强说明 / Fork enhancements

> 本仓库是 [`violin321/fogsight`](https://github.com/violin321/fogsight) 的自用增强版 fork，保留上游版权与许可证声明，不改变原项目的归属关系。

这个 fork 主要补充了便于个人工作流使用的交互与导出能力，当前重点包括：

- **官网式浏览器视频导出**：对齐 Fogsight 官方导出流程，通过 `getDisplayMedia` + `MediaRecorder` 打开 Recording 黑色窗口、授权屏幕共享并自动下载视频；优先导出 MP4，必要时回退 WebM。
- **近期对话**：使用浏览器 `localStorage` 保存最近会话，支持首页/侧栏查看、恢复、重命名、删除，并在生成中锁定切换避免状态错乱。
- **首页与工作区 UI 优化**：新增“工作方式 / 它能做什么 / 近期对话”的官网式介绍区，统一桌面与移动端的顶部按钮、品牌 logo、模型设置入口和工作区响应式布局。
- **模型设置与连通性测试**：可在前端更新 `MODEL` / `BASE_URL` / `API_KEY`，测试结果使用短状态 + 详情面板展示，避免长错误撑爆布局。
- **Metapi reasoning 路由兼容**：在本机 Metapi 场景下，可将 `gpt-5.5-high` / `gpt-5.5-medium` / `gpt-5.5-low` 自动映射到 `gpt-5.5(high)` / `gpt-5.5(medium)` / `gpt-5.5(low)`。
- **Regenerate**：基于原始 topic 重新生成新版本，便于回到初始意图重做。
- **Improve this version**：基于当前 HTML 结果继续优化视觉层次、动效、移动端适配和解释清晰度。
- **若干可用性修复**：包括 Open in new window 的滚动修复、fenced code 中 `html` 标记清理、更强的响应式 prompt 引导、录制窗口适配缩放、近期对话 UI、模型设置弹窗、iPad/iPhone 响应式适配和移动端 header 优化。

### 建议使用流程

1. 输入主题并生成动画。
2. 如果结果方向不对，使用 **Regenerate** 基于原始 topic 重开一版。
3. 如果结果可用但还不够好，使用 **Improve this version** 在当前 HTML 基础上继续优化。
4. 需要录屏交付时，在桌面版浏览器中使用 **导出视频**，按弹窗指引选择黑色 Recording 窗口并在完成后停止共享下载视频。
5. 后续可在首页或侧栏的 **近期对话** 中恢复、重命名或删除历史会话。

### 已知限制

- 视频导出优先使用 **MP4**，浏览器不支持时回退 WebM。
- 暂不包含音频导出。
- 仅支持桌面浏览器，移动端不支持视频导出。
- 首次录制需要浏览器屏幕共享授权。
- 录制清晰度、码率与稳定性依赖浏览器实现和本机性能。
- 近期对话保存在当前浏览器 `localStorage`，清理浏览器数据或更换设备后不会同步。

### 模型设置（UI）

当前 fork 已提供前端 **模型设置 / Model Settings** 弹窗，可直接在页面内查看和更新运行时模型配置：

- 可修改 `MODEL`、`BASE_URL`、`API_KEY`。
- 前端会通过 `GET /settings/model` 读取当前 `MODEL` 与 `BASE_URL`，并仅显示 **API Key 是否已配置**，**不会回显已有 key 内容**。
- 保存时会调用 `POST /settings/model`；如果 `API_KEY` 输入框留空，则**保留当前旧 key**，不会被空值覆盖。
- 可使用 **测试模型** 按钮调用 `POST /settings/model/test`，先验证当前输入的模型配置是否可连通，再决定是否保存。
- 测试结果以短状态展示（如“模型可用 / 测试失败”），详细 `apiModel`、路由模式、错误信息会放在详情面板中，避免长错误信息撑开界面。
- 对本机 Metapi 网关做了 reasoning 档位兼容：`gpt-5.5-high` / `medium` / `low` 会在请求时映射为 Metapi 的 `gpt-5.5(high)` / `gpt-5.5(medium)` / `gpt-5.5(low)` 路由。

适合以下场景：
- 在同一套部署里快速切换不同模型或网关。
- 临时替换 API Key 而不希望在页面里泄露旧 key。
- 修改配置前先测试连接，避免保存后才发现不可用。

### 安全与部署提示

- **不要提交 `credentials.json`**，请仅在本地或受控环境保存 API 密钥。
- 模型设置接口会把运行时配置写入本地受控配置文件（优先使用 `data/credentials.local.json` 覆盖初始 `credentials.json`）；请确保这些文件只存在于受控环境，并做好文件权限控制。
- 如果要部署到公网，务必自行增加认证、限流或前置网关保护；应用本身**没有账号系统**，直接暴露会有滥用风险。

### 许可证提醒

上游项目采用 **CC BY-NC-ND 4.0**。本 fork 仅用于自用改造与说明补充；如需商用、公开分发或传播衍生版本，请先认真评估许可证限制，必要时联系上游获得授权。

## 动画示例

以下为 Fogsight AI 生成的动画示例，点击以跳转并查看


<table>
  <tr>
    <td align="center">
      <a href="https://www.bilibili.com/video/BV1PXgKzBEyN">
        <img src="https://github.com/hamutama/caimaopics/raw/main/fogsight/thumbnails/entropy_increase_thumbnail.png" width="350"><br>
        <strong>The Law of Increasing Entropy (Physics)</strong><br>
        <strong>熵增定律 (物理学)</strong><br>
        <em>输入: 熵增定律</em>
      </a>
    </td>
    <td align="center">
      <a href="https://www.bilibili.com/video/BV1yXgKzqE42">
        <img src="https://github.com/hamutama/caimaopics/raw/main/fogsight/thumbnails/euler_formula_thumbnail.png" width="350"><br>
        <strong>Euler's Polyhedron Formula (Mathematics)</strong><br>
        <strong>欧拉多面体定理 (数学)</strong><br>
        <em>输入: 欧拉定理</em>
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://www.bilibili.com/video/BV1sQgKzMEox">
        <img src="https://github.com/hamutama/caimaopics/raw/main/fogsight/thumbnails/bubble_sort_thumbnail.png" width="350"><br>
        <strong>Bubble Sort (Computer Science)</strong><br>
        <strong>冒泡排序 (计算机科学)</strong><br>
        <em>输入: 冒泡排序</em>
      </a>
    </td>
    <td align="center">
      <a href="https://www.bilibili.com/video/BV1yQgKzMEo6">
        <img src="https://github.com/hamutama/caimaopics/raw/main/fogsight/thumbnails/affordance_thumbnail.png" width="350"><br>
        <strong>Affordance (Design)</strong><br>
        <strong>可供性 (设计学)</strong><br>
        <em>输入: affordance in design</em>
      </a>
    </td>
  </tr>
</table>

## 核心功能

* **概念即影像**: 输入一个主题，Fogsight 将为您生成一部叙事完整的高水平动画，包含双语旁白与电影级的视觉质感。
* **智能编排**: Fogsight 的核心是其强大的LLM驱动的编排能力。从旁白、视觉元素到动态效果，AI 将自动完成整个创作流程，一气呵成。
* **语言用户界面 (LUI)**: 通过与 AI 的多轮对话，您可以对动画进行精准调优和迭代，直至达到您心中最理想的艺术效果。
* **重新生成与当前版本优化**: 可基于原始 topic 重新生成，也可直接围绕当前 HTML 版本继续做视觉、动效与解释层面的增强。
* **近期对话**: 在浏览器本地保存最近会话，支持恢复、重命名、删除，方便继续打磨旧灵感。
* **浏览器端视频导出**: 在桌面 Chrome / Edge 中可通过官网式浏览器录屏链路优先导出 MP4，适合快速交付预览或演示。

## 快速上手

### 环境要求

* Python 3.10+
* 一个现代网络浏览器 (如 Chrome, Firefox, Edge)
* 大语言模型的 API 密钥。我们仅推荐您使用 Google Gemini 2.5。

### 安装与运行

1. **克隆代码仓库:**
   ```bash
   git clone https://github.com/fogsightai/fogsight.git
   cd fogsight
   ```

2. **安装依赖:**

   ```bash
   pip install -r requirements.txt
   ```

3. **配置初始模型参数（首次启动前）:**

   ```bash
   cp demo-credentials.json credentials.json
   # 复制 demo-credentials.json 为 credentials.json
   # 编辑 credentials.json，填入 API_KEY、BASE_URL 和 MODEL
   ```

   常见示例：

   ```json
   {
     "API_KEY": "你的 Gemini 密钥",
     "BASE_URL": "",
     "MODEL": "gemini-2.5-pro"
   }
   ```

   ```json
   {
     "API_KEY": "sk-or-v1-你的 OpenRouter 密钥",
     "BASE_URL": "https://openrouter.ai/api/v1",
     "MODEL": "anthropic/claude-sonnet-4"
   }
   ```

4. **一键启动:**

   ```bash
   python start_fogsight.py
   # 运行 start_fogsight.py 脚本
   # 它将自动启动后端服务并在浏览器中自动打开 http://127.0.0.1:8000
   ```

5. **开始创作！**
   在页面中输入一个主题（例如"冒泡排序"），然后等待结果生成。

6. **按需使用模型设置 UI：**
   - 打开页面中的 **模型设置 / Model Settings**。
   - 查看当前 `MODEL` / `BASE_URL`，以及 API Key 是否已配置。
   - 如需更换模型或网关，修改后可先点 **测试模型** 验证连通性。
   - 保存时如果 `API_KEY` 留空，会继续沿用旧 key，不会清空。

7. **生成后继续操作：**
   - 需要重开一版：使用 **Regenerate**。
   - 需要在当前成果上继续打磨：使用 **Improve this version**。
   - 需要导出录屏：在桌面 Chrome / Edge 中使用视频导出并按指引选择黑色 Recording 窗口。
   - 需要继续旧任务：从首页或侧栏的 **近期对话** 恢复历史会话。

### Docker 方式运行

如果您更喜欢使用 Docker，可以按照以下步骤：

1. **确保 Docker 已安装:**
   请确保您的系统已安装 Docker 和 docker-compose。

2. **克隆代码仓库:**
   ```bash
   git clone https://github.com/fogsightai/fogsight.git
   cd fogsight
   ```

3. **配置API密钥:**
   ```bash
   cp demo-credentials.json credentials.json
   # 编辑 credentials.json 文件，填入您的 API_KEY、BASE_URL 和 MODEL

   # 使用 OpenRouter 的配置示例：
   # {
   #   "API_KEY": "sk-or-v1-您的OpenRouter密钥",
   #   "BASE_URL": "https://openrouter.ai/api/v1",
   #   "MODEL": "anthropic/claude-sonnet-4"
   # }

   # 使用 Gemini 的配置示例：
   # {
   #   "API_KEY": "您的Gemini密钥",
   #   "BASE_URL": "",
   #   "MODEL": "gemini-2.5-pro"
   # }
   ```

4. **使用 Docker Compose 启动:**
   ```bash
   # 使用默认端口 8000
   docker-compose up -d

   # 或者指定自定义端口（例如 3000）
   HOST_PORT=3000 docker-compose up -d
   ```

   如果 Docker 镜像无法拉取，可以尝试使用代理，或者使用镜像的国内源。

5. **访问应用:**
   打开浏览器访问 `http://localhost:8000`（或您指定的端口）

6. **在页面中调整模型配置（可选）:**
   - 首次启动后可在前端 **模型设置** 弹窗中调整 `MODEL`、`BASE_URL`、`API_KEY`。
   - `API_KEY` 不会在界面中回显；若留空保存，则保持当前旧 key。
   - 建议保存前先点击 **测试模型** 验证连接。
   - 如果连接本机 Metapi，可直接填写 `gpt-5.5-high` / `gpt-5.5-medium` / `gpt-5.5-low`，应用会自动映射到 Metapi 的括号式 reasoning 路由。

7. **停止服务:**
   ```bash
   docker-compose down
   ```


## 联系我们/加入群聊

请访问[此链接](https://fogsightai.feishu.cn/wiki/WvODwyUr1iSAe0kEyKfcpqvynGc?from=from_copylink)联系我们或加入交流群。

## Contributors

### 高校

* [@taited](https://taited.github.io/) - 香港中文大学（深圳） 博士生
* [@yjydya](https://github.com/ydyjya) - 南洋理工大学 博士生
* [@zhichzhang](https://github.com/zhichzhang) - 南加州大学 硕士生

### WaytoAGI 社区

* [@richkatchen 陈财猫](https://okjk.co/enodyA) - WaytoAGI 社区成员
* [@shuyan-5200](https://github.com/shuyan-5200) - WaytoAGI 社区成员
* [@kk](https://okjk.co/zC8myE) - WaytoAGI 社区成员

### Index Future Lab

* [何淋 (@Lin he)](https://github.com/zerohe2001)

### AI 探索家

* [黄小刀 (@Xiaodao Huang)](https://okjk.co/CkFav6)

### 独立开发者与 AI 艺术家

* [@Lixin Cai 蔡李鑫](https://github.com/Lixin-Cai)
* [王如玥 (@Ruyue Wang)](https://github.com/Moonywang)
* [@Jack-the-Builder](https://github.com/Jack-the-Builder)
* [@xiayurain95](https://github.com/xiayurain95)


## 开源许可

本项目基于 [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-Hans) 协议发布，
禁止商业用途及修改衍生。若您计划在商业环境中使用，请与我们联系。

