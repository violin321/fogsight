document.addEventListener('DOMContentLoaded', () => {
    const config = {
        apiBaseUrl: '',
        defaultLang: 'zh',
    };

    const translations = {
        heroTitle: { zh: "在此赋予概念以生命，转瞬之间", en: "Bring Concepts to Life Here" },
        startCreatingTitle: { zh: "开始创作", en: "Start Creating" },
        githubrepo: { zh: "Github 开源仓库", en: "Fogsight Github Repo" },
        officialWebsite: { zh: "通向 AGI 之路社区", en: "WaytoAGI Open Source Community" },
        groupChat: { zh: "联系我们/加入交流群", en: "Contact Us" },
        placeholders: {
            zh: ["微积分的几何原理", "冒泡排序", "热寂", "黑洞是如何形成的"],
            en: ["What is Heat Death?", "How are black holes formed?", "What is Bubble Sort?"]
        },
        newChat: { zh: "新对话", en: "New Chat" },
        newChatTitle: { zh: "新对话", en: "New Chat" },
        chatPlaceholder: {
            zh: "AI 生成结果具有随机性，您可在此输入修改意见",
            en: "Results are random. Enter your modifications here for adjustments."
        },
        sendTitle: { zh: "发送", en: "Send" },
        agentThinking: { zh: "Fogsight Agent 正在进行思考与规划，请稍后。这可能需要数十秒至数分钟...", en: "Fogsight Agent is thinking and planning, please wait..." },
        regenerating: { zh: "正在基于原始主题重新生成新版本...", en: "Regenerating a fresh version from the original topic..." },
        improving: { zh: "正在基于当前版本进行优化...", en: "Improving the current version..." },
        generatingCode: { zh: "生成代码中...", en: "Generating code..." },
        codeComplete: { zh: "代码已完成", en: "Code generated" },
        openInNewWindow: { zh: "在新窗口中打开", en: "Open in new window" },
        saveAsHTML: { zh: "保存为 HTML", en: "Save as HTML" },
        exportAsVideo: { zh: "导出为视频", en: "Export as Video" },
        regenerate: { zh: "重新生成", en: "Regenerate" },
        improveVersion: { zh: "基于此版本优化", en: "Improve this version" },
        exportVideoInstructions: {
            zh: "仅支持桌面浏览器。点击开始录制后，会打开一个黑色播放窗口。请在系统共享选择器中选择刚打开的 Fogsight recording window/tab；停止共享后会自动下载 WebM。",
            en: "Desktop browsers only. After you start recording, a black playback window will open. In the screen-share picker, choose the newly opened Fogsight recording window/tab. When you stop sharing, a WebM file will download automatically."
        },
        exportVideoStart: { zh: "开始录制", en: "Start recording" },
        exportVideoUnsupported: { zh: "当前浏览器不支持屏幕录制或 MediaRecorder，请改用最新版桌面 Chrome / Edge。", en: "This browser does not support screen capture or MediaRecorder. Please use a recent desktop Chrome or Edge." },
        exportVideoMobileUnsupported: {
            zh: "移动端暂不支持视频导出，请使用桌面版 Chrome / Edge；你仍可保存 HTML。\n\nMobile video export is not supported yet. Please use desktop Chrome or Edge; you can still save the HTML.",
            en: "移动端暂不支持视频导出，请使用桌面版 Chrome / Edge；你仍可保存 HTML。\n\nMobile video export is not supported yet. Please use desktop Chrome or Edge; you can still save the HTML."
        },
        exportVideoNoContent: { zh: "当前没有可导出的视频内容。", en: "There is no playable content to export right now." },
        exportVideoWindowBlocked: { zh: "播放窗口被浏览器拦截了，请允许弹窗后重试。", en: "The playback window was blocked. Please allow pop-ups and try again." },
        exportVideoPermissionCancelled: { zh: "你已取消录屏选择，未生成视频文件。", en: "Screen capture was cancelled. No video file was created." },
        exportVideoFailed: { zh: "录屏导出失败，请重试。", en: "Video export failed. Please try again." },
        exportVideoRecording: { zh: "请在共享选择器中选择新打开的 Fogsight 播放窗口；停止共享后会自动下载 WebM。", en: "Select the newly opened Fogsight playback window in the share picker. The WebM download will start after you stop sharing." },
        close: { zh: "关闭", en: "Close" },
        errorMessage: { zh: "抱歉，服务出现了一点问题。请稍后重试。", en: "Sorry, something went wrong. Please try again later." },
        errorFetchFailed: { zh: "LLM服务不可用，请稍后再试", en: "LLM service is unavailable. Please try again later." },
        errorTooManyRequests: { zh: "今天已经使用太多，请明天再试", en: "Too many requests today. Please try again tomorrow." },
        errorLLMParseError: { zh: "返回的动画代码解析失败，请调整提示词重新生成。", en: "Failed to parse the returned animation code. Please adjust your prompt and try again." },
    };

    const IMPROVEMENT_INSTRUCTION = {
        zh: "请基于当前 HTML 版本进行优化：保留核心内容与叙事结构，提升视觉层次、动画流畅度、移动端适配、触控友好性，以及中英双语解说的清晰度。输出仍必须是完整单文件 HTML（含 CSS/JS/SVG），不要附加解释。",
        en: "Please improve the current HTML version while preserving the core content and narrative. Enhance visual hierarchy, animation smoothness, mobile responsiveness, touch friendliness, and the clarity of bilingual explanations. Return a complete single-file HTML document with CSS/JS/SVG only, with no extra explanation."
    };

    let currentLang = config.defaultLang;
    const body = document.body;
    const initialForm = document.getElementById('initial-form');
    const initialInput = document.getElementById('initial-input');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatLog = document.getElementById('chat-log');
    const newChatButton = document.getElementById('new-chat-button');
    const languageSwitcher = document.getElementById('language-switcher');
    const placeholderContainer = document.getElementById('animated-placeholder');
    const featureModal = document.getElementById('feature-modal');
    const modalActionButton = document.getElementById('modal-github-button');
    const modalCloseButton = document.getElementById('modal-close-button');

    const templates = {
        user: document.getElementById('user-message-template'),
        status: document.getElementById('agent-status-template'),
        code: document.getElementById('agent-code-template'),
        player: document.getElementById('animation-player-template'),
        error: document.getElementById('agent-error-template'),
    };

    class LLMParseError extends Error {
        constructor(message, code = 'LLM_UNKNOWN_ERROR') {
            super(message);
            this.name = 'LLMParseError';
            this.code = code;
        }
    }

    let conversationHistory = [];
    let accumulatedCode = '';
    let placeholderInterval;
    let modalPrimaryAction = null;
    let placeholderIndex = 0;

    function getRootTopic() {
        const firstUserMessage = conversationHistory.find((message) => message.role === 'user');
        return firstUserMessage?.content?.trim() || '';
    }

    function createGenerationContext(topic, overrides = {}) {
        return {
            topic,
            sourceTopic: overrides.sourceTopic || getRootTopic() || topic,
            requestHistory: Array.isArray(overrides.requestHistory) ? overrides.requestHistory : conversationHistory,
            displayUserMessage: overrides.displayUserMessage ?? true,
            addUserMessageToConversation: overrides.addUserMessageToConversation ?? true,
            recordAssistantInConversation: overrides.recordAssistantInConversation ?? true,
            statusMessage: overrides.statusMessage || translations.agentThinking[currentLang],
        };
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const isInitial = e.currentTarget.id === 'initial-form';
        const submitButton = isInitial
            ? initialForm?.querySelector('button')
            : chatForm?.querySelector('button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
        }
        const input = isInitial ? initialInput : chatInput;
        const topic = input.value.trim();
        if (!topic) return;

        if (isInitial) switchToChatView();

        const generationContext = createGenerationContext(topic);
        if (generationContext.addUserMessageToConversation) {
            conversationHistory.push({ role: 'user', content: topic });
        }
        startGeneration(generationContext);
        input.value = '';
        if (isInitial) placeholderContainer?.classList?.remove('hidden');
    }

    async function startGeneration(generationContextOrTopic, overrides = {}) {
        const generationContext = typeof generationContextOrTopic === 'string'
            ? createGenerationContext(generationContextOrTopic, overrides)
            : generationContextOrTopic;

        const {
            topic,
            sourceTopic,
            requestHistory,
            displayUserMessage,
            recordAssistantInConversation,
            statusMessage,
        } = generationContext;

        console.log('Getting generation from backend.');
        if (displayUserMessage) appendUserMessage(topic);
        const agentThinkingMessage = appendAgentStatus(statusMessage || translations.agentThinking[currentLang]);
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
        }
        accumulatedCode = '';
        let inCodeBlock = false;
        let codeBlockElement = null;

        try {
            const response = await fetch(`${config.apiBaseUrl}/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, history: requestHistory })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;

                    const jsonStr = line.substring(6);
                    if (jsonStr.includes('[DONE]')) {
                        console.log('Streaming complete');
                        if (recordAssistantInConversation) {
                            conversationHistory.push({ role: 'assistant', content: accumulatedCode });
                        }

                        if (!codeBlockElement) {
                            console.warn('No code block element created. Full response:', accumulatedCode);
                            throw new LLMParseError('LLM did not return a complete code block.');
                        }

                        if (!isHtmlContentValid(accumulatedCode)) {
                            console.warn('Invalid HTML received:\n', accumulatedCode);
                            throw new LLMParseError('Invalid HTML content received.');
                        }

                        markCodeAsComplete(codeBlockElement);

                        try {
                            if (accumulatedCode) {
                                appendAnimationPlayer(accumulatedCode, topic, { sourceTopic });
                            }
                        } catch (err) {
                            console.error('appendAnimationPlayer failed:', err);
                            throw new LLMParseError('Animation rendering failed.');
                        }
                        scrollToBottom();
                        return;
                    }

                    let data;
                    try {
                        data = JSON.parse(jsonStr);
                    } catch (err) {
                        console.error('Failed to parse JSON:', jsonStr);
                        throw new LLMParseError('Invalid response format from server.');
                    }

                    if (data.error) {
                        throw new LLMParseError(data.error);
                    }
                    const token = data.token || '';

                    if (!inCodeBlock && token.includes('```')) {
                        inCodeBlock = true;
                        if (agentThinkingMessage) agentThinkingMessage.remove();
                        codeBlockElement = appendCodeBlock();
                        const contentAfterMarker = token.substring(token.indexOf('```') + 3).replace(/^html\n/, '');
                        updateCodeBlock(codeBlockElement, contentAfterMarker);
                    } else if (inCodeBlock) {
                        if (token.includes('```')) {
                            inCodeBlock = false;
                            const contentBeforeMarker = token.substring(0, token.indexOf('```'));
                            updateCodeBlock(codeBlockElement, contentBeforeMarker);
                        } else {
                            updateCodeBlock(codeBlockElement, token);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Streaming failed:', error);
            if (agentThinkingMessage) agentThinkingMessage.remove();

            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                showWarning(translations.errorFetchFailed[currentLang]);
            } else if (error.message.includes('status: 429')) {
                showWarning(translations.errorTooManyRequests[currentLang]);
            } else if (error instanceof LLMParseError) {
                showWarning(translations.errorLLMParseError[currentLang]);
            } else {
                showWarning(translations.errorFetchFailed[currentLang]);
            }

            appendErrorMessage(translations.errorMessage[currentLang]);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('disabled');
            }
        }
    }

    function switchToChatView() {
        body.classList.remove('show-initial-view');
        body.classList.add('show-chat-view');
        languageSwitcher.style.display = 'none';
        document.getElementById('logo-chat').style.display = 'block';
    }

    function appendFromTemplate(template, text) {
        const node = template.content.cloneNode(true);
        const element = node.firstElementChild;
        if (text) element.innerHTML = element.innerHTML.replace('${text}', text);
        element.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.dataset.translateKey;
            const translation = translations[key]?.[currentLang];
            if (translation) el.textContent = translation;
        });
        chatLog.appendChild(element);
        scrollToBottom();
        return element;
    }

    const appendUserMessage = (text) => appendFromTemplate(templates.user, text);
    const appendAgentStatus = (text) => appendFromTemplate(templates.status, text);
    const appendErrorMessage = (text) => appendFromTemplate(templates.error, text);
    const appendCodeBlock = () => appendFromTemplate(templates.code);

    function updateCodeBlock(codeBlockElement, text) {
        const codeElement = codeBlockElement.querySelector('code');
        if (!text || !codeElement) return;
        const span = document.createElement('span');
        span.textContent = text;
        codeElement.appendChild(span);
        accumulatedCode += text;

        const codeContent = codeElement.closest('.code-content');
        if (codeContent) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    codeContent.scrollTop = codeContent.scrollHeight;
                });
            });
        }
    }

    function markCodeAsComplete(codeBlockElement) {
        codeBlockElement.querySelector('[data-translate-key="generatingCode"]').textContent = translations.codeComplete[currentLang];
        codeBlockElement.querySelector('.code-details').removeAttribute('open');
    }

    function escapeHtmlForAttribute(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;');
    }

    function createHtmlBlobUrl(htmlContent) {
        return URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }));
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function timestampForFilename() {
        const now = new Date();
        const pad = (value) => String(value).padStart(2, '0');
        return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    }

    function renderPlaybackWindow(playbackWindow, htmlContent, topic) {
        const safeTitle = topic?.trim() || 'Fogsight Export';
        const wrappedHtml = `<!DOCTYPE html>
<html lang="${currentLang === 'zh' ? 'zh-CN' : 'en'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Fogsight Recording - ${safeTitle}</title>
<style>
html, body { margin: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
body { display: flex; align-items: center; justify-content: center; font-family: Inter, system-ui, sans-serif; color: #fff; }
.iframe-shell { width: 100vw; height: 100vh; border: 0; background: #000; }
.noscript { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; text-align: center; }
</style>
</head>
<body>
<iframe class="iframe-shell" sandbox="allow-scripts allow-same-origin" allow="autoplay" srcdoc="${escapeHtmlForAttribute(htmlContent)}"></iframe>
<noscript><div class="noscript">JavaScript is required to preview this export.</div></noscript>
</body>
</html>`;

        playbackWindow.document.open();
        playbackWindow.document.write(wrappedHtml);
        playbackWindow.document.close();
        return playbackWindow;
    }

    function openPlaybackWindow(htmlContent, topic) {
        const playbackWindow = window.open('', '_blank');
        if (!playbackWindow) return null;
        return renderPlaybackWindow(playbackWindow, htmlContent, topic);
    }

    function restartPlaybackWindow(playbackWindow, htmlContent, topic) {
        if (!playbackWindow || playbackWindow.closed) return openPlaybackWindow(htmlContent, topic);
        return renderPlaybackWindow(playbackWindow, htmlContent, topic);
    }

    function getSupportedRecordingMimeType() {
        const mimeTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
        return mimeTypes.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || '';
    }

    function isLikelyMobileOrSmallScreen() {
        const userAgent = navigator.userAgent || '';
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
        const smallViewport = window.matchMedia?.('(max-width: 900px)').matches;
        return mobileRegex.test(userAgent) || Boolean(coarsePointer) || Boolean(smallViewport);
    }

    function showModalMessage(message, buttonText, onAction) {
        featureModal.querySelector('p').textContent = message;
        modalActionButton.textContent = buttonText;
        modalActionButton.dataset.translateKey = '';
        modalPrimaryAction = typeof onAction === 'function' ? onAction : null;
        featureModal.classList.add('visible');
    }

    function buildImproveHistory(sourceTopic, htmlContent) {
        const history = [];
        if (sourceTopic) history.push({ role: 'user', content: sourceTopic });
        history.push({ role: 'assistant', content: htmlContent });
        return history;
    }

    function appendAnimationPlayer(htmlContent, topic, options = {}) {
        console.log('Appending animation player with topic:', topic);
        const sourceTopic = options.sourceTopic || getRootTopic() || topic;
        const node = templates.player.content.cloneNode(true);
        const playerElement = node.firstElementChild;
        playerElement.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.dataset.translateKey;
            el.textContent = translations[key]?.[currentLang] || el.textContent;
        });
        const iframe = playerElement.querySelector('.animation-iframe');
        iframe.srcdoc = htmlContent;

        playerElement.querySelector('.open-new-window').addEventListener('click', () => {
            const url = createHtmlBlobUrl(htmlContent);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        });

        playerElement.querySelector('.save-html').addEventListener('click', () => {
            downloadBlob(new Blob([htmlContent], { type: 'text/html' }), `${topic.replace(/\s/g, '_') || 'animation'}.html`);
        });

        playerElement.querySelector('.regenerate')?.addEventListener('click', () => {
            startGeneration({
                topic: sourceTopic,
                sourceTopic,
                requestHistory: [],
                displayUserMessage: false,
                addUserMessageToConversation: false,
                recordAssistantInConversation: false,
                statusMessage: translations.regenerating[currentLang],
            });
        });

        playerElement.querySelector('.improve-version')?.addEventListener('click', () => {
            const improveInstruction = IMPROVEMENT_INSTRUCTION[currentLang];
            startGeneration({
                topic: improveInstruction,
                sourceTopic,
                requestHistory: buildImproveHistory(sourceTopic, htmlContent),
                displayUserMessage: false,
                addUserMessageToConversation: false,
                recordAssistantInConversation: false,
                statusMessage: translations.improving[currentLang],
            });
        });

        playerElement.querySelector('.export-video')?.addEventListener('click', () => {
            if (!htmlContent || !isHtmlContentValid(htmlContent)) {
                showWarning(translations.exportVideoNoContent[currentLang]);
                return;
            }

            if (isLikelyMobileOrSmallScreen() || !navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === 'undefined') {
                showModalMessage(
                    translations.exportVideoMobileUnsupported[currentLang],
                    translations.close[currentLang],
                    () => featureModal.classList.remove('visible')
                );
                return;
            }

            showModalMessage(
                translations.exportVideoInstructions[currentLang],
                translations.exportVideoStart[currentLang],
                async () => {
                    featureModal.classList.remove('visible');

                    const mimeType = getSupportedRecordingMimeType();
                    const playbackWindow = openPlaybackWindow(htmlContent, topic);
                    if (!playbackWindow) {
                        showWarning(translations.exportVideoWindowBlocked[currentLang]);
                        return;
                    }

                    try {
                        showWarning(translations.exportVideoRecording[currentLang]);
                        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                        const chunks = [];
                        const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
                        let stopped = false;

                        const stopAndDownload = () => {
                            if (stopped) return;
                            stopped = true;
                            if (recorder.state !== 'inactive') recorder.stop();
                        };

                        recorder.ondataavailable = (event) => {
                            if (event.data && event.data.size > 0) chunks.push(event.data);
                        };

                        recorder.onerror = () => {
                            showWarning(translations.exportVideoFailed[currentLang]);
                        };

                        recorder.onstop = () => {
                            stream.getTracks().forEach(track => track.stop());
                            if (chunks.length === 0) {
                                showWarning(translations.exportVideoFailed[currentLang]);
                                return;
                            }
                            const blob = new Blob(chunks, { type: mimeType || 'video/webm' });
                            downloadBlob(blob, `fogsight-export-${timestampForFilename()}.webm`);
                        };

                        stream.getVideoTracks().forEach(track => {
                            track.addEventListener('ended', stopAndDownload, { once: true });
                        });

                        restartPlaybackWindow(playbackWindow, htmlContent, topic);
                        recorder.start(1000);
                    } catch (error) {
                        if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
                            showWarning(translations.exportVideoPermissionCancelled[currentLang]);
                        } else {
                            console.error('Video export failed:', error);
                            showWarning(translations.exportVideoFailed[currentLang]);
                        }
                        if (playbackWindow && !playbackWindow.closed) playbackWindow.close();
                    }
                }
            );
        });

        chatLog.appendChild(playerElement);
        scrollToBottom();
    }

    function isHtmlContentValid(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const parseErrors = doc.querySelectorAll('parsererror');
        if (parseErrors.length > 0) {
            console.warn('HTML 解析失败：', parseErrors[0].textContent);
            return false;
        }

        if (!doc.body || doc.body.innerHTML.trim() === '') {
            console.warn('HTML 内容为空');
            return false;
        }

        return true;
    }

    const scrollToBottom = () => chatLog.scrollTo({ top: chatLog.scrollHeight, behavior: 'smooth' });

    function setNextPlaceholder() {
        const placeholderTexts = translations.placeholders[currentLang];
        const newSpan = document.createElement('span');
        newSpan.textContent = placeholderTexts[placeholderIndex];
        placeholderContainer.innerHTML = '';
        placeholderContainer.appendChild(newSpan);
        placeholderIndex = (placeholderIndex + 1) % placeholderTexts.length;
    }

    function startPlaceholderAnimation() {
        if (placeholderInterval) clearInterval(placeholderInterval);
        const placeholderTexts = translations.placeholders[currentLang];
        if (placeholderTexts && placeholderTexts.length > 0) {
            placeholderIndex = 0;
            setNextPlaceholder();
            placeholderInterval = setInterval(setNextPlaceholder, 4000);
        }
    }

    function setLanguage(lang) {
        if (!['zh', 'en'].includes(lang)) return;
        currentLang = lang;
        document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.dataset.translateKey;
            const translation = translations[key]?.[lang];
            if (!translation) return;
            if (el.hasAttribute('placeholder')) el.placeholder = translation;
            else if (el.hasAttribute('title')) el.title = translation;
            else el.textContent = translation;
        });
        languageSwitcher.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        startPlaceholderAnimation();
        localStorage.setItem('preferredLanguage', lang);
    }

    function init() {
        initialInput.addEventListener('input', () => {
            placeholderContainer.classList.toggle('hidden', initialInput.value.length > 0);
        });
        initialInput.addEventListener('focus', () => clearInterval(placeholderInterval));
        initialInput.addEventListener('blur', () => {
            if (initialInput.value.length === 0) startPlaceholderAnimation();
        });

        initialForm.addEventListener('submit', handleFormSubmit);
        chatForm.addEventListener('submit', handleFormSubmit);
        newChatButton.addEventListener('click', () => location.reload());
        languageSwitcher.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (target) setLanguage(target.dataset.lang);
        });

        function hideModal() {
            featureModal.classList.remove('visible');
            modalPrimaryAction = null;
        }

        modalCloseButton.addEventListener('click', hideModal);
        featureModal.addEventListener('click', (e) => {
            if (e.target === featureModal) hideModal();
        });

        modalActionButton.addEventListener('click', () => {
            const action = modalPrimaryAction;
            if (!action) {
                hideModal();
                return;
            }
            Promise.resolve(action()).catch((error) => {
                console.error('Modal action failed:', error);
                showWarning(translations.exportVideoFailed[currentLang]);
            }).finally(() => {
                modalPrimaryAction = null;
            });
        });

        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = navigator.language?.toLowerCase() || '';

        let initialLang = 'en';
        if (['zh', 'en'].includes(savedLang)) {
            initialLang = savedLang;
        } else if (browserLang.startsWith('zh')) {
            initialLang = 'zh';
        } else if (browserLang.startsWith('en')) {
            initialLang = 'en';
        }

        setLanguage(initialLang);
    }

    init();
});

function showWarning(message) {
    const box = document.getElementById('warning-box');
    const overlay = document.getElementById('overlay');
    const text = document.getElementById('warning-message');
    text.textContent = message;
    box.style.display = 'flex';
    overlay.style.display = 'block';

    setTimeout(() => {
        hideWarning();
    }, 10000);
}

function hideWarning() {
    document.getElementById('warning-box').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}
