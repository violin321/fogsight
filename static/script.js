let warningHideTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    const config = {
        apiBaseUrl: '',
        defaultLang: 'zh',
    };

    const translations = {
        heroTitle: { zh: "把概念变成可探索的动态 HTML 动画", en: "Turn Concepts into Exploratory HTML Animations" },
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
        recentConversations: { zh: "近期对话", en: "Recent Conversations" },
        recentHint: { zh: "快速继续最近的灵感", en: "Jump back into recent ideas" },
        howItWorksEyebrow: { zh: "工作方式", en: "How It Works" },
        howItWorksTitle: { zh: "工作方式", en: "How It Works" },
        howItWorksSummary: { zh: "从一个想法出发，几步就能得到可探索、可保存的动态动画页面。", en: "Start with an idea and turn it into an interactive animation you can explore and save in just a few steps." },
        workflowStep1Title: { zh: "输入概念", en: "Enter Your Concept" },
        workflowStep1Desc: { zh: "输入一个概念、问题、关键词，或你想讲清楚的主题。", en: "Type in a concept, question, keyword, or topic you want to explain clearly." },
        workflowStep2Title: { zh: "AI 分析", en: "AI Analysis" },
        workflowStep2Desc: { zh: "Fogsight 会拆解结构、识别重点，并组织适合动画表达的内容逻辑。", en: "Fogsight breaks down the structure, finds the key ideas, and organizes them into a story fit for animation." },
        workflowStep3Title: { zh: "生成动画", en: "Generate Animation" },
        workflowStep3Desc: { zh: "自动输出可直接预览的动态 HTML 动画，而不只是静态图示。", en: "Generate a dynamic HTML animation you can preview immediately, not just a static diagram." },
        workflowStep4Title: { zh: "探索与导出", en: "Explore & Export" },
        workflowStep4Desc: { zh: "继续对话优化版本，保存 HTML，或导出为视频用于分享与演示。", en: "Refine it through follow-up prompts, save the HTML, or export a video for sharing and presentations." },
        capabilitiesEyebrow: { zh: "适用场景", en: "Capabilities" },
        capabilitiesTitle: { zh: "它能做什么", en: "What It Can Do" },
        capabilitiesSummary: { zh: "把复杂概念转成更容易理解、展示和分享的动态 HTML 动画。", en: "Turn complex ideas into dynamic HTML animations that are easier to understand, present, and share." },
        capabilityScience: { zh: "科学原理", en: "Science Concepts" },
        capabilityMath: { zh: "数学公式", en: "Math Explanations" },
        capabilityAlgorithms: { zh: "算法流程", en: "Algorithms" },
        capabilityBusiness: { zh: "商业模型", en: "Business Models" },
        capabilityEducation: { zh: "教育主题", en: "Education Topics" },
        capabilityPresentation: { zh: "演示素材", en: "Presentation Visuals" },
        currentConversationLabel: { zh: "当前对话", en: "Current Chat" },
        noHistory: { zh: "暂无历史", en: "No recent conversations" },
        noRecentConversations: { zh: "暂无近期对话", en: "No recent conversations" },
        generatingConversationWarning: { zh: "当前正在生成动画，请等待完成后再切换或新建对话。", en: "Animation is currently being generated. Please wait until it finishes before switching or creating a new conversation." },
        newConversationDefault: { zh: "新对话", en: "New Conversation" },
        deleteConversation: { zh: "删除", en: "Delete" },
        renameConversation: { zh: "重命名", en: "Rename" },
        renameConversationPrompt: { zh: "请输入新的会话名称", en: "Enter a new conversation name" },
        deleteConversationConfirm: { zh: "确定删除这条对话吗？", en: "Delete this conversation?" },
        currentConversationUntitled: { zh: "未命名对话", en: "Untitled Conversation" },
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
            zh: "1\n点击开始后，会打开一个【黑色窗口】，请勿关闭\n2\n回到本窗口，在弹窗中选择【黑色窗口】并授权\n3\n点击【分享】后动画开始播放并录制\n4\n关闭窗口或点击【停止分享】结束录制\n5\n视频文件将自动下载",
            en: "1\nClick Start to open a black window. Do not close it.\n2\nReturn to this window, select the black window in the picker, and grant permission.\n3\nAfter clicking Share, the animation starts playing and recording.\n4\nClose the window or click Stop sharing to finish recording.\n5\nThe video file will download automatically."
        },
        exportVideoStart: { zh: "开始", en: "Start" },
        exportVideoShareStart: { zh: "开始共享并录制", en: "Start sharing and recording" },
        exportVideoUnsupported: {
            zh: "当前环境暂不支持浏览器录屏导出。请使用桌面版 Chrome / Edge，并确认页面为 HTTPS。",
            en: "This environment does not support browser screen recording export. Please use desktop Chrome / Edge and make sure the page is HTTPS."
        },
        exportVideoMobileUnsupported: {
            zh: "移动端暂不支持视频导出，请使用桌面版 Chrome / Edge；你仍可保存 HTML。",
            en: "Mobile video export is not supported yet. Please use desktop Chrome or Edge; you can still save the HTML."
        },
        exportVideoNoContent: { zh: "当前没有可导出的视频内容。", en: "There is no playable content to export right now." },
        exportVideoWindowBlocked: { zh: "播放窗口被浏览器拦截了，请允许弹窗后重试。", en: "The playback window was blocked. Please allow pop-ups and try again." },
        exportVideoPermissionCancelled: { zh: "你已取消录屏选择，未生成视频文件。", en: "Screen capture was cancelled. No video file was created." },
        exportVideoFailed: { zh: "视频导出失败，请重试。", en: "Video export failed. Please try again." },
        exportVideoRecording: { zh: "请在共享选择器中选择新打开的 Fogsight 播放窗口；停止共享后会自动下载 WebM。", en: "Select the newly opened Fogsight playback window in the share picker. The WebM download will start after you stop sharing." },
        exportVideoAlreadyRecording: { zh: "视频导出正在进行中，请先完成或停止当前屏幕共享。", en: "Video export is already in progress. Please finish or stop the current screen share first." },
        close: { zh: "关闭", en: "Close" },
        cancel: { zh: "取消", en: "Cancel" },
        saveSettings: { zh: "保存设置", en: "Save Settings" },
        testModel: { zh: "测试模型", en: "Test model" },
        modelSettings: { zh: "模型设置", en: "Settings" },
        modelSettingsTitle: { zh: "模型设置 / Model Settings", en: "Model Settings" },
        modelSettingsDescription: { zh: "查看并更新当前模型配置。API Key 不会回显；留空则保持不变。你可以先测试连接，再决定是否保存。", en: "Review and update the active model configuration. The API key is never shown; leave it blank to keep the current key. You can test the connection before saving." },
        modelSettingsLoading: { zh: "正在加载当前配置...", en: "Loading current configuration..." },
        modelSettingsCurrent: { zh: "当前：MODEL={model} · BASE_URL={baseUrl}", en: "Current: MODEL={model} · BASE_URL={baseUrl}" },
        modelSettingsApiKeyConfigured: { zh: "API Key 已配置", en: "API key configured" },
        modelSettingsApiKeyMissing: { zh: "API Key 未配置", en: "API key not configured" },
        modelSettingsLoadFailed: { zh: "加载模型设置失败，请稍后重试。", en: "Failed to load model settings. Please try again." },
        modelSettingsSaved: { zh: "模型设置已保存。", en: "Model settings saved." },
        modelSettingsSaveFailed: { zh: "保存模型设置失败，请检查输入后重试。", en: "Failed to save model settings. Please check the input and try again." },
        modelTestIdle: { zh: "未测试", en: "Not tested" },
        modelTestRunning: { zh: "测试中...", en: "Testing..." },
        modelTestSuccess: { zh: "测试成功", en: "Test passed" },
        modelTestFailed: { zh: "测试失败", en: "Test failed" },
        modelTestAvailable: { zh: "模型可用", en: "Model is available" },
        modelTestDetails: { zh: "查看详情", en: "View details" },
        modelTestDetailsTitleSuccess: { zh: "成功详情", en: "Success details" },
        modelTestDetailsTitleFailed: { zh: "错误详情", en: "Error details" },
        modelTestDetailsTitleIdle: { zh: "测试详情", en: "Test details" },
        modelTestNoDetails: { zh: "暂无详情", en: "No details yet" },
        modelTestRequestFailed: { zh: "模型测试失败，请检查配置后重试。", en: "Model test failed. Please check the configuration and try again." },
        modelRequiredWarning: { zh: "MODEL 不能为空。", en: "MODEL cannot be empty." },
        baseUrlRequiredWarning: { zh: "BASE_URL 不能为空。", en: "BASE_URL cannot be empty." },
        apiKeyPlaceholder: { zh: "留空则不修改 / Leave blank to keep current key", en: "Leave blank to keep current key" },
        errorMessage: { zh: "抱歉，服务出现了一点问题。请稍后重试。", en: "Sorry, something went wrong. Please try again later." },
        errorFetchFailed: { zh: "LLM服务不可用，请稍后再试", en: "LLM service is unavailable. Please try again later." },
        errorTooManyRequests: { zh: "今天已经使用太多，请明天再试", en: "Too many requests today. Please try again tomorrow." },
        errorLLMParseError: { zh: "返回的动画代码无法直接预览。", en: "The returned animation code could not be previewed directly." },
    };

    const IMPROVEMENT_INSTRUCTION = {
        zh: "请基于当前 HTML 版本进行优化：保留核心内容与叙事结构，提升视觉层次、动画流畅度、移动端适配、触控友好性，以及中英双语解说的清晰度。输出仍必须是完整单文件 HTML（含 CSS/JS/SVG），不要附加解释。",
        en: "Please improve the current HTML version while preserving the core content and narrative. Enhance visual hierarchy, animation smoothness, mobile responsiveness, touch friendliness, and the clarity of bilingual explanations. Return a complete single-file HTML document with CSS/JS/SVG only, with no extra explanation."
    };

    let currentLang = config.defaultLang;
    let modelSettingsState = {
        model: '',
        baseUrl: '',
        apiKeyConfigured: false,
        loaded: false,
        saving: false,
        testing: false,
        testStatus: 'idle',
        testMessage: '',
        testDetails: '',
        testDetailsOpen: false,
    };
    let isVideoExporting = false;
    let activeRecordingBlobUrl = null;
    const body = document.body;
    const initialForm = document.getElementById('initial-form');
    const initialInput = document.getElementById('initial-input');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatLog = document.getElementById('chat-log');
    const newChatButton = document.getElementById('new-chat-button');
    const sidebarNewChatButton = document.getElementById('sidebar-new-chat-button');
    const sidebarToggleButton = document.getElementById('sidebar-toggle-button');
    const closeSidebarButton = document.getElementById('close-sidebar-button');
    const recentConversationsList = document.getElementById('recent-conversations-list');
    const recentConversationsEmpty = document.getElementById('recent-conversations-empty');
    const initialRecentConversationsList = document.getElementById('initial-recent-conversations-list');
    const initialRecentConversationsEmpty = document.getElementById('initial-recent-conversations-empty');
    const currentChatTitle = document.getElementById('current-chat-title');
    const languageSwitcher = document.getElementById('language-switcher');
    const placeholderContainer = document.getElementById('animated-placeholder');
    const featureModal = document.getElementById('feature-modal');
    const modalActionButton = document.getElementById('modal-github-button');
    const modalCloseButton = document.getElementById('modal-close-button');
    const openSettingsButton = document.getElementById('open-settings-button');
    const chatSettingsButton = document.getElementById('chat-settings-button');
    const settingsModal = document.getElementById('settings-modal');
    const settingsForm = document.getElementById('settings-form');
    const settingsCloseButton = document.getElementById('settings-close-button');
    const settingsCancelButton = document.getElementById('settings-cancel-button');
    const settingsSaveButton = document.getElementById('settings-save-button');
    const settingsTestButton = document.getElementById('settings-test-button');
    const settingsModelInput = document.getElementById('settings-model-input');
    const settingsBaseUrlInput = document.getElementById('settings-base-url-input');
    const settingsApiKeyInput = document.getElementById('settings-api-key-input');
    const settingsApiKeyStatus = document.getElementById('settings-api-key-status');
    const settingsCurrentConfig = document.getElementById('settings-current-config');
    const settingsTestStatus = document.getElementById('settings-test-status');
    const settingsTestDetailsButton = document.getElementById('settings-test-details-button');
    const settingsTestDetails = document.getElementById('settings-test-details');
    const settingsTestDetailsTitle = document.getElementById('settings-test-details-title');
    const settingsTestDetailsBody = document.getElementById('settings-test-details-body');

    const templates = {
        user: document.getElementById('user-message-template'),
        status: document.getElementById('agent-status-template'),
        code: document.getElementById('agent-code-template'),
        player: document.getElementById('animation-player-template'),
        error: document.getElementById('agent-error-template'),
    };

    class LLMParseError extends Error {
        constructor(message, code = 'LLM_UNKNOWN_ERROR', diagnostics = '') {
            super(message);
            this.name = 'LLMParseError';
            this.code = code;
            this.diagnostics = diagnostics;
        }
    }

    const STORAGE_KEY = 'fogsight.conversations.v1';
    const MAX_RECENT_CONVERSATIONS = 15;

    let conversationHistory = [];
    let accumulatedCode = '';
    let placeholderInterval;
    let modalPrimaryAction = null;
    let placeholderIndex = 0;
    let recentConversations = [];
    let currentConversationId = null;
    let isGenerating = false;

    function generateConversationId() {
        return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function sanitizeConversationTitle(text, options = {}) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        const fallback = options.fallback || translations.currentConversationUntitled[currentLang];
        if (!normalized) return fallback;

        const cleaned = normalized
            .replace(/^(undefined|null|nan)$/i, '')
            .replace(/[\u0000-\u001F\u007F]+/g, '')
            .trim();

        if (!cleaned) return fallback;

        const letterOrDigitCount = (cleaned.match(/[\p{L}\p{N}]/gu) || []).length;
        if (cleaned.length <= 1 || letterOrDigitCount <= 1) return fallback;

        return cleaned;
    }

    function truncateTitle(text, maxLength = 30, options = {}) {
        const normalized = sanitizeConversationTitle(text, options);
        return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}…` : normalized;
    }

    function getConversationTitleFromMessages(messages = []) {
        const firstUserMessage = messages.find((message) => message.role === 'user' && message.content?.trim());
        return truncateTitle(firstUserMessage?.content || '', 30, {
            fallback: translations.newConversationDefault[currentLang],
        });
    }

    function sortRecentConversations(items = []) {
        return [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
    }

    function loadRecentConversations() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            recentConversations = sortRecentConversations(Array.isArray(parsed) ? parsed : []).slice(0, MAX_RECENT_CONVERSATIONS);
        } catch (error) {
            console.warn('Failed to load recent conversations:', error);
            recentConversations = [];
        }
    }

    function persistRecentConversations() {
        recentConversations = sortRecentConversations(recentConversations).slice(0, MAX_RECENT_CONVERSATIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentConversations));
    }

    function getCurrentConversation() {
        return recentConversations.find((item) => item.id === currentConversationId) || null;
    }

    function getRootTopic() {
        const firstUserMessage = conversationHistory.find((message) => message.role === 'user');
        return firstUserMessage?.content?.trim() || '';
    }

    function updateGenerationInteractivity() {
        const disableElement = (element, disabled) => {
            if (!element) return;
            if ('disabled' in element) element.disabled = disabled;
            element.setAttribute('aria-disabled', disabled ? 'true' : 'false');
            element.classList.toggle('is-disabled', disabled);
            if (disabled) {
                element.dataset.lockedReason = 'generating';
            } else {
                delete element.dataset.lockedReason;
            }
        };

        disableElement(newChatButton, isGenerating);
        disableElement(sidebarNewChatButton, isGenerating);
        disableElement(initialForm?.querySelector('button'), isGenerating);
        disableElement(chatForm?.querySelector('button'), isGenerating);

        recentConversationsList?.classList.toggle('is-disabled', isGenerating);
        initialRecentConversationsList?.classList.toggle('is-disabled', isGenerating);

        document.querySelectorAll('.recent-conversation-item, .initial-recent-conversation-card').forEach((item) => {
            item.classList.toggle('is-disabled', isGenerating);
            item.setAttribute('aria-disabled', isGenerating ? 'true' : 'false');
            if (isGenerating) {
                item.dataset.lockedReason = 'generating';
            } else {
                delete item.dataset.lockedReason;
            }
        });

        document.querySelectorAll('.recent-conversation-main, .recent-action-button').forEach((button) => {
            disableElement(button, isGenerating);
        });
    }

    function showGenerationLockedWarning() {
        showWarning(translations.generatingConversationWarning[currentLang]);
    }

    function guardConversationInteraction() {
        if (!isGenerating) return false;
        showGenerationLockedWarning();
        return true;
    }

    function updateCurrentChatTitle(title) {
        if (!currentChatTitle) return;
        const titleTextElement = currentChatTitle.querySelector('.current-chat-title-text');
        const titleMainElement = currentChatTitle.querySelector('.current-chat-title-main');
        const hasCurrentConversation = Boolean(currentConversationId || conversationHistory.length);
        const fallback = hasCurrentConversation
            ? translations.currentConversationUntitled[currentLang]
            : translations.newConversationDefault[currentLang];
        const safeTitle = truncateTitle(title, 30, { fallback });
        const shouldMuteTitle = !hasCurrentConversation && safeTitle === translations.newConversationDefault[currentLang];

        if (titleTextElement) {
            titleTextElement.textContent = safeTitle;
            titleTextElement.title = safeTitle;
        }

        currentChatTitle.dataset.state = shouldMuteTitle ? 'new' : 'active';
        currentChatTitle.title = shouldMuteTitle ? '' : safeTitle;

        if (titleMainElement) {
            titleMainElement.setAttribute('aria-hidden', shouldMuteTitle ? 'true' : 'false');
        }
    }

    function formatConversationTimestamp(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function ensureCurrentConversation(options = {}) {
        if (currentConversationId && getCurrentConversation()) return getCurrentConversation();
        const now = new Date().toISOString();
        const conversation = {
            id: generateConversationId(),
            title: sanitizeConversationTitle(options.title || getConversationTitleFromMessages(conversationHistory), {
                fallback: translations.newConversationDefault[currentLang],
            }),
            messages: Array.isArray(options.messages) ? options.messages : [...conversationHistory],
            createdAt: now,
            updatedAt: now,
        };
        recentConversations.unshift(conversation);
        currentConversationId = conversation.id;
        persistRecentConversations();
        renderRecentConversations();
        updateCurrentChatTitle(conversation.title);
        return conversation;
    }

    function saveCurrentConversation(options = {}) {
        const now = new Date().toISOString();
        const existing = getCurrentConversation();
        const messages = Array.isArray(options.messages) ? options.messages : [...conversationHistory];
        const title = sanitizeConversationTitle(options.title || getConversationTitleFromMessages(messages), {
            fallback: conversationHistory.length ? translations.currentConversationUntitled[currentLang] : translations.newConversationDefault[currentLang],
        });
        const conversation = existing || ensureCurrentConversation({ title, messages });
        conversation.messages = messages.map((message) => ({ ...message }));
        conversation.title = title || conversation.title || translations.currentConversationUntitled[currentLang];
        conversation.updatedAt = now;
        conversation.createdAt = conversation.createdAt || now;
        persistRecentConversations();
        renderRecentConversations();
        updateCurrentChatTitle(conversation.title);
        return conversation;
    }

    function renderRecentConversations() {
        if (!recentConversationsList || !recentConversationsEmpty) return;
        recentConversationsList.innerHTML = '';
        recentConversationsEmpty.style.display = recentConversations.length ? 'none' : 'block';

        recentConversations.forEach((conversation) => {
            const safeTitle = truncateTitle(conversation.title, 30, {
                fallback: translations.currentConversationUntitled[currentLang],
            });
            const item = document.createElement('div');
            item.className = `recent-conversation-item recent-ui-card${conversation.id === currentConversationId ? ' active' : ''}${isGenerating ? ' is-disabled' : ''}`;
            item.setAttribute('aria-disabled', isGenerating ? 'true' : 'false');

            const openButton = document.createElement('button');
            openButton.type = 'button';
            openButton.className = `recent-conversation-main${isGenerating ? ' is-disabled' : ''}`;
            openButton.innerHTML = `
                <div class="recent-conversation-badge-row">
                    <span class="recent-conversation-badge">${conversation.id === currentConversationId ? 'Live' : 'Saved'}</span>
                    <span class="recent-conversation-meta recent-conversation-meta-top">${formatConversationTimestamp(conversation.updatedAt)}</span>
                </div>
                <div class="recent-conversation-title">${escapeHtmlForAttribute(safeTitle)}</div>
                <div class="recent-conversation-meta recent-conversation-meta-bottom">${formatConversationTimestamp(conversation.updatedAt)}</div>
            `;
            openButton.addEventListener('click', () => restoreConversation(conversation.id));

            const actions = document.createElement('div');
            actions.className = 'recent-conversation-actions';

            const renameButton = document.createElement('button');
            renameButton.type = 'button';
            renameButton.className = `recent-action-button recent-action-button-rename${isGenerating ? ' is-disabled' : ''}`;
            renameButton.innerHTML = '<span class="recent-action-button-icon" aria-hidden="true">✎</span><span>' + translations.renameConversation[currentLang] + '</span>';
            renameButton.addEventListener('click', (event) => {
                event.stopPropagation();
                renameConversation(conversation.id);
            });

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = `recent-action-button delete recent-action-button-delete${isGenerating ? ' is-disabled' : ''}`;
            deleteButton.innerHTML = '<span class="recent-action-button-icon" aria-hidden="true">✕</span><span>' + translations.deleteConversation[currentLang] + '</span>';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                deleteConversation(conversation.id);
            });

            actions.append(renameButton, deleteButton);
            item.append(openButton, actions);
            recentConversationsList.appendChild(item);
        });

        renderInitialRecentConversations();
        updateGenerationInteractivity();
    }

    function renderInitialRecentConversations() {
        if (!initialRecentConversationsList || !initialRecentConversationsEmpty) return;
        const previewConversations = recentConversations.slice(0, 5);
        initialRecentConversationsList.innerHTML = '';
        initialRecentConversationsEmpty.style.display = previewConversations.length ? 'none' : 'block';

        previewConversations.forEach((conversation) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `initial-recent-conversation-card${isGenerating ? ' is-disabled' : ''}`;
            button.setAttribute('aria-disabled', isGenerating ? 'true' : 'false');
            const safeTitle = truncateTitle(conversation.title, 36, {
                fallback: translations.currentConversationUntitled[currentLang],
            });
            button.innerHTML = `
                <div class="recent-conversation-badge-row initial-recent-card-topline">
                    <span class="recent-conversation-badge">Recent</span>
                    <span class="recent-conversation-meta recent-conversation-meta-top">${formatConversationTimestamp(conversation.updatedAt)}</span>
                </div>
                <div class="recent-conversation-title">${escapeHtmlForAttribute(safeTitle)}</div>
                <div class="recent-conversation-meta recent-conversation-meta-bottom">${formatConversationTimestamp(conversation.updatedAt)}</div>
            `;
            button.addEventListener('click', () => restoreConversation(conversation.id));
            initialRecentConversationsList.appendChild(button);
        });
    }

    function clearChatLog() {
        chatLog.innerHTML = '';
        accumulatedCode = '';
    }

    function closeSidebar() {
        body.classList.remove('sidebar-open');
    }

    function openSidebar() {
        body.classList.add('sidebar-open');
    }

    function startNewConversation({ switchView = true } = {}) {
        if (guardConversationInteraction()) return;
        currentConversationId = null;
        conversationHistory = [];
        accumulatedCode = '';
        clearChatLog();
        updateCurrentChatTitle(translations.newConversationDefault[currentLang]);
        if (switchView) switchToChatView();
        chatInput.value = '';
        closeSidebar();
        renderRecentConversations();
    }

    function restoreConversation(conversationId) {
        if (guardConversationInteraction()) return;
        const conversation = recentConversations.find((item) => item.id === conversationId);
        if (!conversation) return;
        currentConversationId = conversation.id;
        conversationHistory = Array.isArray(conversation.messages) ? conversation.messages.map((message) => ({ ...message })) : [];
        clearChatLog();
        switchToChatView();
        conversationHistory.forEach((message) => {
            if (message.role === 'user') {
                appendUserMessage(message.content);
            } else if (message.role === 'assistant') {
                const htmlResult = extractHtmlDocument(message.content || '');
                if (htmlResult.html && isHtmlContentValid(htmlResult.html)) {
                    const codeBlockElement = appendCodeBlock();
                    replaceCodeBlockContent(codeBlockElement, htmlResult.html);
                    markCodeAsComplete(codeBlockElement);
                    appendAnimationPlayer(htmlResult.html, getRootTopic(), { sourceTopic: getRootTopic() });
                } else {
                    appendErrorMessage(translations.errorMessage[currentLang]);
                }
            }
        });
        updateCurrentChatTitle(conversation.title || getConversationTitleFromMessages(conversationHistory));
        renderRecentConversations();
        closeSidebar();
        scrollToBottom();
    }

    function deleteConversation(conversationId) {
        if (guardConversationInteraction()) return;
        const conversation = recentConversations.find((item) => item.id === conversationId);
        if (!conversation) return;
        const confirmed = window.confirm(translations.deleteConversationConfirm[currentLang]);
        if (!confirmed) return;
        recentConversations = recentConversations.filter((item) => item.id !== conversationId);
        if (currentConversationId === conversationId) {
            startNewConversation({ switchView: true });
        }
        persistRecentConversations();
        renderRecentConversations();
    }

    function renameConversation(conversationId) {
        if (guardConversationInteraction()) return;
        const conversation = recentConversations.find((item) => item.id === conversationId);
        if (!conversation) return;
        const nextTitle = window.prompt(translations.renameConversationPrompt[currentLang], conversation.title || '');
        if (nextTitle === null) return;
        conversation.title = truncateTitle(nextTitle, 30, {
            fallback: translations.currentConversationUntitled[currentLang],
        });
        conversation.updatedAt = new Date().toISOString();
        persistRecentConversations();
        if (currentConversationId === conversationId) updateCurrentChatTitle(conversation.title);
        renderRecentConversations();
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
            saveCurrentConversation();
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
        isGenerating = true;
        updateGenerationInteractivity();
        if (displayUserMessage) appendUserMessage(topic);
        const agentThinkingMessage = appendAgentStatus(statusMessage || translations.agentThinking[currentLang]);
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.classList.add('disabled');
        }
        accumulatedCode = '';
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

                        const extractionResult = extractHtmlDocument(accumulatedCode);
                        if (!extractionResult.html) {
                            console.warn('Failed to extract HTML from response:', extractionResult);
                            throw new LLMParseError(
                                'Unable to extract a complete HTML document from model output.',
                                'LLM_HTML_EXTRACTION_FAILED',
                                extractionResult.diagnostics,
                            );
                        }

                        accumulatedCode = extractionResult.html;

                        if (recordAssistantInConversation) {
                            conversationHistory.push({ role: 'assistant', content: accumulatedCode });
                            saveCurrentConversation();
                        }

                        if (!codeBlockElement) {
                            if (agentThinkingMessage) agentThinkingMessage.remove();
                            codeBlockElement = appendCodeBlock();
                        }
                        replaceCodeBlockContent(codeBlockElement, accumulatedCode);

                        const validationResult = validateHtmlContent(accumulatedCode);
                        if (!validationResult.valid) {
                            console.warn('Invalid HTML received:', validationResult);
                            throw new LLMParseError(
                                'Extracted HTML could not be parsed or had no visible body.',
                                'LLM_INVALID_HTML',
                                validationResult.diagnostics,
                            );
                        }

                        markCodeAsComplete(codeBlockElement);

                        try {
                            appendAnimationPlayer(accumulatedCode, topic, { sourceTopic });
                        } catch (err) {
                            console.error('appendAnimationPlayer failed:', err);
                            throw new LLMParseError('Animation rendering failed.', 'LLM_RENDER_FAILED', String(err?.message || err));
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

                    if (!token) continue;

                    if (!codeBlockElement) {
                        if (agentThinkingMessage) agentThinkingMessage.remove();
                        codeBlockElement = appendCodeBlock();
                    }
                    updateCodeBlock(codeBlockElement, token);
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
                const diagnosticText = error.diagnostics ? `\n\n诊断信息：${error.diagnostics}` : '';
                showWarning(`${translations.errorLLMParseError[currentLang]}${diagnosticText}`);
            } else {
                showWarning(translations.errorFetchFailed[currentLang]);
            }

            appendErrorMessage(translations.errorMessage[currentLang]);
        } finally {
            isGenerating = false;
            updateGenerationInteractivity();
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
        renderRecentConversations();
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
        scrollCodeBlockToBottom(codeElement);
    }

    function replaceCodeBlockContent(codeBlockElement, text) {
        const codeElement = codeBlockElement.querySelector('code');
        if (!codeElement) return;
        codeElement.textContent = text || '';
        scrollCodeBlockToBottom(codeElement);
    }

    function scrollCodeBlockToBottom(codeElement) {
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

    function stripLeadingCodeFenceLanguageMarker(htmlContent) {
        if (!htmlContent) return htmlContent;
        return htmlContent.replace(/^\s*(?:html|xml)\s*(?=<!doctype|<html|<head|<body|<svg|<main|<div|<section|<style|<script|<)/i, '');
    }

    function stripWrappingCodeFences(content) {
        if (!content) return content;
        let normalized = content.trim();
        normalized = normalized.replace(/^```(?:html)?\s*/i, '');
        normalized = normalized.replace(/\s*```\s*$/i, '');
        return normalized.trim();
    }

    function extractHtmlDocument(rawContent) {
        const source = String(rawContent || '').trim();
        if (!source) {
            return { html: '', diagnostics: '模型没有返回任何内容。' };
        }

        const candidates = [];
        const pushCandidate = (label, content) => {
            if (!content) return;
            const normalized = stripLeadingCodeFenceLanguageMarker(stripWrappingCodeFences(content).trim());
            if (!normalized) return;
            candidates.push({ label, content: normalized });
        };

        pushCandidate('raw', source);

        const fencedMatches = [...source.matchAll(/```(?:html)?\s*([\s\S]*?)```/gi)];
        fencedMatches.forEach((match, index) => pushCandidate(`fenced_${index + 1}`, match[1]));

        const htmlDocMatch = source.match(/<!DOCTYPE html>[\s\S]*?<\/html>/i) || source.match(/<html\b[\s\S]*?<\/html>/i);
        if (htmlDocMatch) pushCandidate('html_doc_match', htmlDocMatch[0]);

        const uniqueCandidates = [];
        const seen = new Set();
        for (const candidate of candidates) {
            if (seen.has(candidate.content)) continue;
            seen.add(candidate.content);
            uniqueCandidates.push(candidate);
        }

        for (const candidate of uniqueCandidates) {
            const validation = validateHtmlContent(candidate.content);
            if (validation.valid) {
                return { html: candidate.content, diagnostics: `已提取 ${candidate.label} 形式的 HTML。` };
            }
        }

        const preview = source.replace(/\s+/g, ' ').slice(0, 180);
        return {
            html: '',
            diagnostics: `未找到完整 HTML 文档；响应开头片段：${preview || '[empty]'}`,
        };
    }

    function escapeHtmlForAttribute(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function injectScrollablePreviewStyles(htmlContent) {
        const scrollFix = `<style id="fogsight-open-window-scroll-fix">
html, body {
    min-width: 100%;
    min-height: 100%;
    overflow: auto !important;
    overscroll-behavior: contain;
}
body {
    -webkit-overflow-scrolling: touch;
}
</style>`;
        if (/<\/head>/i.test(htmlContent)) {
            return htmlContent.replace(/<\/head>/i, `${scrollFix}</head>`);
        }
        return `${scrollFix}${htmlContent}`;
    }

    function renderHtmlIntoWindow(targetWindow, htmlContent, options = {}) {
        if (!targetWindow) return null;
        const content = options.scrollablePreview ? injectScrollablePreviewStyles(htmlContent) : htmlContent;
        targetWindow.document.open();
        targetWindow.document.write(content);
        targetWindow.document.close();
        return targetWindow;
    }

    function openHtmlPreviewWindow(htmlContent) {
        const previewWindow = window.open('about:blank', '_blank');
        if (!previewWindow) return null;
        return renderHtmlIntoWindow(previewWindow, htmlContent, { scrollablePreview: true });
    }

    function createHtmlBlobUrl(htmlContent, options = {}) {
        const content = options.scrollablePreview ? injectScrollablePreviewStyles(htmlContent) : htmlContent;
        return URL.createObjectURL(new Blob([content], { type: 'text/html' }));
    }

    function getApiBaseUrl(pathname = '') {
        return `${config.apiBaseUrl}${pathname}`;
    }

    function isLocalMetapiBaseUrl(baseUrl) {
        try {
            const parsed = new URL(String(baseUrl || '').trim());
            const host = parsed.hostname.toLowerCase();
            return ['127.0.0.1', 'localhost', 'host.docker.internal'].includes(host) && parsed.port === '4000';
        } catch (_) {
            return false;
        }
    }

    function normalizeReasoningModelName(model, baseUrl = '') {
        const normalized = String(model || '').trim();
        const match = normalized.match(/^(.*?)-(low|medium|high)$/i);
        if (!match) {
            return {
                requestedModel: normalized,
                apiModel: normalized,
                reasoningEffort: '',
                displayHint: normalized,
                routingMode: 'direct',
            };
        }

        const baseModel = (match[1] || '').trim();
        const reasoningEffort = (match[2] || '').toLowerCase().trim();
        const metapiRouting = isLocalMetapiBaseUrl(baseUrl);
        const metapiAlias = `${baseModel}(${reasoningEffort})`;
        return {
            requestedModel: normalized,
            apiModel: metapiRouting ? metapiAlias : baseModel,
            reasoningEffort,
            displayHint: metapiRouting ? metapiAlias : `${baseModel} + ${reasoningEffort}`,
            routingMode: metapiRouting ? 'metapi-suffix' : 'base-fallback',
        };
    }

    function formatModelSettingsCurrent(model, baseUrl) {
        const template = translations.modelSettingsCurrent[currentLang];
        return template
            .replace('{model}', model || '--')
            .replace('{baseUrl}', baseUrl || '--');
    }

    function summarizeModelTestMessage(message, options = {}) {
        const fallback = options.fallback || '';
        const maxLength = options.maxLength || 64;
        const normalized = String(message || '').replace(/\s+/g, ' ').trim();
        if (!normalized) return fallback;

        if (/^[\[{]/.test(normalized) || /"object"\s*:|"choices"\s*:|"output"\s*:/i.test(normalized)) {
            return fallback;
        }

        const truncated = normalized.length > maxLength
            ? `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
            : normalized;
        return truncated || fallback;
    }

    function buildModelTestDetails(result = {}) {
        const lines = [];
        if (result.requestedModel) lines.push(`requestedModel: ${result.requestedModel}`);
        if (result.apiModel) lines.push(`apiModel: ${result.apiModel}`);
        if (result.routingMode) lines.push(`routingMode: ${result.routingMode}`);
        if (result.reasoningEffort) lines.push(`reasoningEffort: ${result.reasoningEffort}`);
        if (result.message) {
            lines.push('');
            lines.push(`message: ${result.message}`);
        }
        if (result.errorDetail) {
            lines.push('');
            lines.push(`error: ${result.errorDetail}`);
        }
        return lines.join('\n').trim();
    }

    function toggleModelTestDetails(forceOpen) {
        if (!settingsTestDetails || !settingsTestDetailsButton || !settingsTestDetailsBody || !settingsTestDetailsTitle) return;
        const hasDetails = Boolean(String(modelSettingsState.testDetails || '').trim());
        const shouldOpen = Boolean(forceOpen) && hasDetails;
        modelSettingsState.testDetailsOpen = shouldOpen;
        settingsTestDetailsButton.hidden = !hasDetails;
        settingsTestDetailsButton.textContent = translations.modelTestDetails[currentLang];
        settingsTestDetailsButton.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        settingsTestDetails.hidden = !shouldOpen;
        settingsTestDetailsTitle.textContent = modelSettingsState.testStatus === 'failed'
            ? translations.modelTestDetailsTitleFailed[currentLang]
            : modelSettingsState.testStatus === 'success'
                ? translations.modelTestDetailsTitleSuccess[currentLang]
                : translations.modelTestDetailsTitleIdle[currentLang];
        settingsTestDetailsBody.textContent = hasDetails
            ? modelSettingsState.testDetails
            : translations.modelTestNoDetails[currentLang];
    }

    function renderModelTestState() {
        if (!settingsTestStatus || !settingsTestButton) return;

        const statusMap = {
            idle: { text: translations.modelTestIdle[currentLang], state: 'idle' },
            testing: { text: translations.modelTestRunning[currentLang], state: 'testing' },
            success: { text: translations.modelTestAvailable[currentLang], state: 'success' },
            failed: { text: translations.modelTestFailed[currentLang], state: 'failed' },
        };

        const currentStatus = statusMap[modelSettingsState.testStatus] || statusMap.idle;
        settingsTestStatus.textContent = currentStatus.text;
        settingsTestStatus.dataset.state = currentStatus.state;
        settingsTestStatus.title = currentStatus.text;
        settingsTestButton.disabled = modelSettingsState.testing || modelSettingsState.saving;
        settingsTestButton.dataset.loading = modelSettingsState.testing ? 'true' : 'false';
        settingsTestButton.textContent = modelSettingsState.testing
            ? translations.modelTestRunning[currentLang]
            : translations.testModel[currentLang];
        toggleModelTestDetails(modelSettingsState.testDetailsOpen);
    }

    function renderModelSettingsState() {
        if (!settingsCurrentConfig || !settingsApiKeyStatus) return;
        if (!modelSettingsState.loaded) {
            settingsCurrentConfig.textContent = translations.modelSettingsLoading[currentLang];
            settingsApiKeyStatus.textContent = 'API Key: --';
            settingsApiKeyStatus.dataset.configured = 'unknown';
            renderModelTestState();
            return;
        }

        settingsCurrentConfig.textContent = formatModelSettingsCurrent(modelSettingsState.model, modelSettingsState.baseUrl);
        settingsApiKeyStatus.textContent = modelSettingsState.apiKeyConfigured
            ? translations.modelSettingsApiKeyConfigured[currentLang]
            : translations.modelSettingsApiKeyMissing[currentLang];
        settingsApiKeyStatus.dataset.configured = modelSettingsState.apiKeyConfigured ? 'true' : 'false';
        renderModelTestState();
    }

    function setSettingsFormDisabled(disabled) {
        [settingsModelInput, settingsBaseUrlInput, settingsApiKeyInput, settingsCancelButton, settingsSaveButton].forEach((element) => {
            if (!element) return;
            element.disabled = disabled;
        });
        if (settingsSaveButton) {
            settingsSaveButton.dataset.loading = disabled && modelSettingsState.saving ? 'true' : 'false';
            settingsSaveButton.textContent = modelSettingsState.saving
                ? `${translations.saveSettings[currentLang]}...`
                : translations.saveSettings[currentLang];
        }
        if (settingsTestButton) {
            settingsTestButton.disabled = disabled || modelSettingsState.testing || modelSettingsState.saving;
        }
    }

    async function fetchModelSettings() {
        const response = await fetch(getApiBaseUrl('/settings/model'), { method: 'GET' });
        if (!response.ok) throw new Error(await parseErrorDetail(response));
        const data = await response.json();
        modelSettingsState = {
            model: data.model || '',
            baseUrl: data.baseUrl || '',
            apiKeyConfigured: Boolean(data.apiKeyConfigured),
            loaded: true,
            saving: false,
            testing: false,
            testStatus: 'idle',
            testMessage: '',
            testDetails: '',
            testDetailsOpen: false,
        };
        return modelSettingsState;
    }

    async function openSettingsModal() {
        if (!settingsModal) return;
        settingsModal.classList.add('visible');
        settingsModal.setAttribute('aria-hidden', 'false');
        settingsCurrentConfig.textContent = translations.modelSettingsLoading[currentLang];
        settingsApiKeyStatus.textContent = 'API Key: --';
        settingsApiKeyStatus.dataset.configured = 'unknown';
        settingsApiKeyInput.value = '';
        modelSettingsState.saving = false;
        modelSettingsState.testing = false;
        modelSettingsState.testStatus = 'idle';
        modelSettingsState.testMessage = '';
        modelSettingsState.testDetails = '';
        modelSettingsState.testDetailsOpen = false;
        renderModelTestState();
        setSettingsFormDisabled(true);

        try {
            const settings = await fetchModelSettings();
            settingsModelInput.value = settings.model;
            settingsBaseUrlInput.value = settings.baseUrl;
            settingsApiKeyInput.value = '';
            renderModelSettingsState();
        } catch (error) {
            console.error('Failed to fetch model settings:', error);
            showWarning(`${translations.modelSettingsLoadFailed[currentLang]} ${error?.message || ''}`.trim());
        } finally {
            setSettingsFormDisabled(false);
            settingsModelInput?.focus();
        }
    }

    function closeSettingsModal() {
        if (!settingsModal) return;
        settingsModal.classList.remove('visible');
        settingsModal.setAttribute('aria-hidden', 'true');
        settingsApiKeyInput.value = '';
        modelSettingsState.testing = false;
        modelSettingsState.testDetailsOpen = false;
        renderModelTestState();
    }

    async function handleSettingsTest() {
        const model = settingsModelInput.value.trim();
        const baseUrl = settingsBaseUrlInput.value.trim();
        const apiKey = settingsApiKeyInput.value.trim();
        const normalizedModel = normalizeReasoningModelName(model, baseUrl);

        if (!model) {
            showWarning(translations.modelRequiredWarning[currentLang]);
            settingsModelInput.focus();
            return;
        }
        if (!baseUrl) {
            showWarning(translations.baseUrlRequiredWarning[currentLang]);
            settingsBaseUrlInput.focus();
            return;
        }

        modelSettingsState.testing = true;
        modelSettingsState.testStatus = 'testing';
        modelSettingsState.testMessage = '';
        modelSettingsState.testDetails = normalizedModel.reasoningEffort
            ? buildModelTestDetails({
                requestedModel: normalizedModel.requestedModel,
                apiModel: normalizedModel.apiModel,
                routingMode: normalizedModel.routingMode,
                reasoningEffort: normalizedModel.reasoningEffort,
                message: normalizedModel.routingMode === 'metapi-suffix'
                    ? `将以 Metapi 路由模型 ${normalizedModel.apiModel} 测试。`
                    : `将以 ${normalizedModel.displayHint} 档测试。`,
            })
            : buildModelTestDetails({
                requestedModel: normalizedModel.requestedModel,
                apiModel: normalizedModel.apiModel,
                routingMode: normalizedModel.routingMode,
            });
        modelSettingsState.testDetailsOpen = false;
        renderModelTestState();

        try {
            const response = await fetch(getApiBaseUrl('/settings/model/test'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    baseUrl,
                    apiKey: apiKey || '',
                }),
            });

            if (!response.ok) throw new Error(await parseErrorDetail(response));
            const data = await response.json();
            const normalizedModelMeta = normalizeReasoningModelName(model, baseUrl);
            const normalizedModelName = data?.apiModel || normalizedModelMeta.apiModel || model;
            modelSettingsState.testStatus = 'success';
            modelSettingsState.testMessage = summarizeModelTestMessage(data?.message, {
                fallback: `模型可用：${normalizedModelName} 响应正常`,
            });
            modelSettingsState.testDetails = buildModelTestDetails({
                requestedModel: normalizedModelMeta.requestedModel,
                apiModel: data?.apiModel || normalizedModelMeta.apiModel,
                routingMode: data?.routingMode || normalizedModelMeta.routingMode,
                reasoningEffort: data?.reasoningEffort || normalizedModelMeta.reasoningEffort,
                message: data?.message || `模型可用：${normalizedModelName} 响应正常`,
            });
            modelSettingsState.testDetailsOpen = false;
        } catch (error) {
            console.error('Failed to test model settings:', error);
            modelSettingsState.testStatus = 'failed';
            modelSettingsState.testMessage = translations.modelTestRequestFailed[currentLang];
            modelSettingsState.testDetails = buildModelTestDetails({
                requestedModel: normalizedModel.requestedModel,
                apiModel: normalizedModel.apiModel,
                routingMode: normalizedModel.routingMode,
                reasoningEffort: normalizedModel.reasoningEffort,
                errorDetail: `${translations.modelTestRequestFailed[currentLang]} ${error?.message || ''}`.trim(),
            });
            modelSettingsState.testDetailsOpen = true;
        } finally {
            modelSettingsState.testing = false;
            renderModelTestState();
        }
    }

    async function handleSettingsSave(event) {
        event.preventDefault();
        const model = settingsModelInput.value.trim();
        const baseUrl = settingsBaseUrlInput.value.trim();
        const apiKey = settingsApiKeyInput.value.trim();

        if (!model) {
            showWarning(translations.modelRequiredWarning[currentLang]);
            settingsModelInput.focus();
            return;
        }
        if (!baseUrl) {
            showWarning(translations.baseUrlRequiredWarning[currentLang]);
            settingsBaseUrlInput.focus();
            return;
        }

        modelSettingsState.saving = true;
        setSettingsFormDisabled(true);
        try {
            const response = await fetch(getApiBaseUrl('/settings/model'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    baseUrl,
                    apiKey: apiKey || '',
                }),
            });

            if (!response.ok) throw new Error(await parseErrorDetail(response));
            const data = await response.json();
            modelSettingsState = {
                ...modelSettingsState,
                model: data.model || model,
                baseUrl: data.baseUrl || baseUrl,
                apiKeyConfigured: Boolean(data.apiKeyConfigured),
                loaded: true,
                saving: false,
            };
            renderModelSettingsState();
            settingsApiKeyInput.value = '';
            showWarning(`${translations.modelSettingsSaved[currentLang]} ${formatModelSettingsCurrent(modelSettingsState.model, modelSettingsState.baseUrl)}`);
            closeSettingsModal();
        } catch (error) {
            console.error('Failed to save model settings:', error);
            showWarning(`${translations.modelSettingsSaveFailed[currentLang]} ${error?.message || ''}`.trim());
        } finally {
            modelSettingsState.saving = false;
            setSettingsFormDisabled(false);
            renderModelTestState();
        }
    }

    async function parseErrorDetail(response) {
        try {
            const data = await response.json();
            if (typeof data?.detail === 'string') return data.detail;
            if (Array.isArray(data?.detail)) return data.detail.map(item => item?.msg || JSON.stringify(item)).join('; ');
            if (data?.detail) return JSON.stringify(data.detail);
        } catch (error) {
            // Ignore JSON parse errors and fall back to status text.
        }
        return `HTTP ${response.status}`;
    }

    async function exportVideoViaServer(htmlContent, topic) {
        const response = await fetch(getApiBaseUrl('/export-video'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html: htmlContent,
                topic: topic || 'animation',
                width: 854,
                height: 480,
                fps: 6,
                durationSec: 5,
            }),
        });

        if (!response.ok) {
            const detail = await parseErrorDetail(response);
            throw new Error(detail || translations.exportVideoFailed[currentLang]);
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
            throw new Error('服务端返回了空视频文件。');
        }

        const contentDisposition = response.headers.get('Content-Disposition') || '';
        const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
        const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
        const filename = decodeURIComponent((utf8Match && utf8Match[1]) || (plainMatch && plainMatch[1]) || `fogsight-export-${timestampForFilename()}.mp4`);
        downloadBlob(blob, filename);
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

    function buildRecordingHtml(htmlContent, topic) {
        const safeTitle = escapeHtmlForAttribute(topic?.trim() || 'Fogsight Export');
        const content = injectScrollablePreviewStyles(htmlContent);
        return `<!DOCTYPE html>
<html lang="${currentLang === 'zh' ? 'zh-CN' : 'en'}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Fogsight Recording - ${safeTitle}</title>
<style>
html, body { margin: 0; min-width: 100%; min-height: 100%; background: #000; }
body { overflow: auto; }
</style>
</head>
<body>
${content}
</body>
</html>`;
    }

    function openPlaybackWindow(htmlContent, topic) {
        const playbackWindow = window.open('', '_blank');
        if (!playbackWindow) return null;
        const recordingHtml = buildRecordingHtml(htmlContent, topic);
        playbackWindow.document.open();
        playbackWindow.document.write(recordingHtml);
        playbackWindow.document.close();
        try { playbackWindow.focus(); } catch (_) {}
        return playbackWindow;
    }

    function cleanupRecordingBlobUrl() {
        if (!activeRecordingBlobUrl) return;
        URL.revokeObjectURL(activeRecordingBlobUrl);
        activeRecordingBlobUrl = null;
    }

    function restartPlaybackWindow(playbackWindow, htmlContent, topic) {
        return playbackWindow && !playbackWindow.closed ? playbackWindow : openPlaybackWindow(htmlContent, topic);
    }

    function getSupportedRecordingMimeType() {
        const mimeTypes = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
        return mimeTypes.find(type => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) || '';
    }

    function isLikelyMobileOrSmallScreen() {
        const userAgent = navigator.userAgent || '';
        const userAgentData = navigator.userAgentData;
        const platform = (navigator.platform || '').toLowerCase();
        const uaPlatform = (userAgentData?.platform || '').toLowerCase();
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const isTouchMac = platform === 'macintel' && navigator.maxTouchPoints > 1;
        const isUaChMobile = userAgentData?.mobile === true;
        const isiPadOs = uaPlatform === 'ios' || isTouchMac;
        const isMobilePlatform = ['android', 'ios', 'ipados'].includes(uaPlatform)
            || /android|iphone|ipad|ipod/.test(platform);

        return mobileRegex.test(userAgent) || isUaChMobile || isMobilePlatform || isiPadOs;
    }

    function collectVideoExportDiagnostics() {
        const userAgentData = navigator.userAgentData;
        const mediaDevices = navigator.mediaDevices;
        return {
            isSecureContext: window.isSecureContext,
            protocol: window.location?.protocol || '',
            hasMediaDevices: typeof mediaDevices !== 'undefined',
            hasGetDisplayMedia: typeof mediaDevices?.getDisplayMedia === 'function',
            hasMediaRecorder: typeof MediaRecorder !== 'undefined',
            userAgent: navigator.userAgent || '',
            platform: navigator.platform || '',
            userAgentDataMobile: typeof userAgentData?.mobile === 'boolean' ? userAgentData.mobile : null,
            userAgentDataPlatform: userAgentData?.platform || '',
        };
    }

    function formatDiagnosticValue(value) {
        if (value === null || typeof value === 'undefined' || value === '') return 'n/a';
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch (error) {
                return String(value);
            }
        }
        return String(value);
    }

    function safeGetTrackDetails(track) {
        if (!track) {
            return {
                label: 'n/a',
                kind: 'n/a',
                readyState: 'n/a',
                muted: 'n/a',
                settings: 'n/a',
                capabilities: 'n/a',
            };
        }

        let settings = 'n/a';
        let capabilities = 'n/a';

        try {
            settings = typeof track.getSettings === 'function' ? track.getSettings() : 'n/a';
        } catch (error) {
            settings = `unavailable: ${error?.message || error}`;
        }

        try {
            capabilities = typeof track.getCapabilities === 'function' ? track.getCapabilities() : 'n/a';
        } catch (error) {
            capabilities = `unavailable: ${error?.message || error}`;
        }

        return {
            label: track.label || 'n/a',
            kind: track.kind || 'n/a',
            readyState: track.readyState || 'n/a',
            muted: typeof track.muted === 'boolean' ? track.muted : 'n/a',
            settings,
            capabilities,
        };
    }

    function formatVideoExportDiagnostics() {
        const diagnostics = collectVideoExportDiagnostics();

        return [
            `protocol=${formatDiagnosticValue(diagnostics.protocol)}`,
            `isSecureContext=${formatDiagnosticValue(diagnostics.isSecureContext)}`,
            `navigator.mediaDevices=${formatDiagnosticValue(diagnostics.hasMediaDevices)}`,
            `getDisplayMedia=${formatDiagnosticValue(diagnostics.hasGetDisplayMedia)}`,
            `MediaRecorder=${formatDiagnosticValue(diagnostics.hasMediaRecorder)}`,
            `platform=${formatDiagnosticValue(diagnostics.platform)}`,
            `userAgentData.mobile=${formatDiagnosticValue(diagnostics.userAgentDataMobile)}`,
            `userAgentData.platform=${formatDiagnosticValue(diagnostics.userAgentDataPlatform)}`,
            `UA=${formatDiagnosticValue(diagnostics.userAgent)}`,
        ].join('\n');
    }

    async function waitForLiveVideoTrack(stream, timeoutMs = 1200) {
        const startedAt = Date.now();
        while (Date.now() - startedAt <= timeoutMs) {
            const track = typeof stream?.getVideoTracks === 'function' ? stream.getVideoTracks()[0] : null;
            if (stream?.active && track && track.readyState === 'live') return track;
            await new Promise(resolve => setTimeout(resolve, 80));
        }
        return typeof stream?.getVideoTracks === 'function' ? stream.getVideoTracks()[0] : null;
    }

    function fitRecordingFrame(frame) {
        if (!frame) return;
        const applyFit = () => {
            try {
                const doc = frame.contentDocument;
                if (!doc || !doc.body || !doc.documentElement) return;
                const viewportWidth = frame.clientWidth || 1280;
                const viewportHeight = frame.clientHeight || 720;
                const html = doc.documentElement;
                const body = doc.body;

                html.style.overflow = 'hidden';
                body.style.overflow = 'hidden';
                body.style.transformOrigin = 'top left';
                body.style.margin = body.style.margin || '0';

                // Reset before measuring so repeated fits don't compound.
                body.style.transform = '';
                body.style.width = '';
                body.style.height = '';

                const contentWidth = Math.max(
                    html.scrollWidth,
                    body.scrollWidth,
                    body.offsetWidth,
                    viewportWidth,
                );
                const contentHeight = Math.max(
                    html.scrollHeight,
                    body.scrollHeight,
                    body.offsetHeight,
                    viewportHeight,
                );
                const scale = Math.min(viewportWidth / contentWidth, viewportHeight / contentHeight, 1);

                if (scale < 0.995) {
                    body.style.width = `${viewportWidth / scale}px`;
                    body.style.height = `${viewportHeight / scale}px`;
                    body.style.transform = `scale(${scale})`;
                    body.dataset.fogsightRecordingScale = String(scale);
                } else {
                    body.dataset.fogsightRecordingScale = '1';
                }
            } catch (error) {
                console.warn('Failed to fit recording frame:', error);
            }
        };

        frame.addEventListener('load', () => {
            requestAnimationFrame(() => {
                applyFit();
                setTimeout(applyFit, 250);
                setTimeout(applyFit, 1000);
            });
        }, { once: true });
    }

    function buildVideoExportFailureMessage(context = {}) {
        const {
            stage = 'unknown',
            error,
            eventError,
            mimeType,
            stream,
            recorder,
            note,
        } = context;
        const videoTrack = typeof stream?.getVideoTracks === 'function' ? stream.getVideoTracks()[0] : null;
        const trackDetails = safeGetTrackDetails(videoTrack);
        const eventErrorName = eventError?.name || eventError?.constructor?.name || 'n/a';
        const eventErrorMessage = eventError?.message || 'n/a';
        const diagnostics = collectVideoExportDiagnostics();
        const lines = [
            translations.exportVideoFailed[currentLang],
            `阶段=${stage}`,
            `error.name=${formatDiagnosticValue(error?.name)}`,
            `error.message=${formatDiagnosticValue(error?.message)}`,
            `event.error.name=${formatDiagnosticValue(eventErrorName)}`,
            `event.error.message=${formatDiagnosticValue(eventErrorMessage)}`,
            `mimeType=${formatDiagnosticValue(mimeType || 'video/webm')}`,
            `recorder.state=${formatDiagnosticValue(recorder?.state)}`,
            `protocol=${formatDiagnosticValue(diagnostics.protocol)}`,
            `isSecureContext=${formatDiagnosticValue(diagnostics.isSecureContext)}`,
        ];

        if (stream && videoTrack) {
            lines.push(
                `videoTrack.label=${formatDiagnosticValue(trackDetails.label)}`,
                `videoTrack.kind=${formatDiagnosticValue(trackDetails.kind)}`,
                `videoTrack.readyState=${formatDiagnosticValue(trackDetails.readyState)}`,
                `videoTrack.muted=${formatDiagnosticValue(trackDetails.muted)}`,
                `videoTrack.settings=${formatDiagnosticValue(trackDetails.settings)}`,
                `videoTrack.capabilities=${formatDiagnosticValue(trackDetails.capabilities)}`,
            );
        } else {
            lines.push('videoTrack=未取得；失败发生在 getDisplayMedia 阶段或录屏流尚未建立');
        }

        if (note) lines.push(`说明=${note}`);
        return lines.join('\n');
    }

    function buildVideoExportUnsupportedMessage() {
        return `${translations.exportVideoUnsupported[currentLang]}\n\n诊断信息：\n${formatVideoExportDiagnostics()}`;
    }

    function buildVideoExportInstructionHtml() {
        const steps = currentLang === 'zh'
            ? [
                '点击开始后，会打开一个【黑色窗口】，请勿关闭',
                '回到本窗口，在弹窗中选择【黑色窗口】并授权',
                '点击【分享】后动画开始播放并录制',
                '关闭窗口或点击【停止分享】结束录制',
                '视频文件将自动下载',
            ]
            : [
                'Click Start to open a black window. Do not close it.',
                'Return here, select the black window in the picker, and grant permission.',
                'After clicking Share, the animation starts playing and recording.',
                'Close the window or click Stop sharing to finish recording.',
                'The video file will download automatically.',
            ];
        return `<ol class="video-export-steps">${steps.map((step, index) => `
            <li><span class="video-export-step-number">${index + 1}</span><span>${step}</span></li>`).join('')}
        </ol>`;
    }

    function showVideoExportInstructionModal(onAction) {
        const paragraph = featureModal.querySelector('p');
        paragraph.innerHTML = buildVideoExportInstructionHtml();
        modalActionButton.textContent = translations.exportVideoStart[currentLang];
        modalActionButton.dataset.translateKey = '';
        modalPrimaryAction = typeof onAction === 'function' ? onAction : null;
        featureModal.classList.add('visible');
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
            const previewWindow = openHtmlPreviewWindow(htmlContent);
            if (!previewWindow) showWarning(translations.exportVideoWindowBlocked[currentLang]);
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
                recordAssistantInConversation: true,
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
                recordAssistantInConversation: true,
                statusMessage: translations.improving[currentLang],
            });
        });

        playerElement.querySelector('.export-video')?.addEventListener('click', () => {
            if (!htmlContent || !isHtmlContentValid(htmlContent)) {
                showWarning(translations.exportVideoNoContent[currentLang]);
                return;
            }

            showVideoExportInstructionModal(async () => {
                    featureModal.classList.remove('visible');

                    if (isVideoExporting) {
                        showWarning(translations.exportVideoAlreadyRecording[currentLang]);
                        return;
                    }

                    const isMobileDevice = isLikelyMobileOrSmallScreen();
                    const videoExportDiagnostics = collectVideoExportDiagnostics();
                    const supportsVideoExport = videoExportDiagnostics.hasGetDisplayMedia && videoExportDiagnostics.hasMediaRecorder;

                    if (isMobileDevice) {
                        showModalMessage(
                            translations.exportVideoMobileUnsupported[currentLang],
                            translations.close[currentLang],
                            () => featureModal.classList.remove('visible')
                        );
                        return;
                    }

                    if (!supportsVideoExport) {
                        console.warn('Video export unsupported diagnostics:', videoExportDiagnostics);
                        showModalMessage(
                            buildVideoExportUnsupportedMessage(),
                            translations.close[currentLang],
                            () => featureModal.classList.remove('visible')
                        );
                        return;
                    }

                    isVideoExporting = true;
                    const mimeType = getSupportedRecordingMimeType() || (MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm');
                    const playbackWindow = window.open('', '_blank', 'width=1280,height=720,left=100,top=100');
                    if (!playbackWindow) {
                        isVideoExporting = false;
                        showWarning(translations.exportVideoWindowBlocked[currentLang]);
                        return;
                    }

                    const captureKey = `fogsight-${Date.now()}-${Math.random().toString(36).slice(2)}`;
                    window.__fogsightCaptureResolvers = window.__fogsightCaptureResolvers || {};
                    const streamPromise = new Promise((resolve, reject) => {
                        window.__fogsightCaptureResolvers[captureKey] = { resolve, reject };
                    });

                    playbackWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Fogsight Recording</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; background: #000; color: #fff; font-family: system-ui, sans-serif; }
.waiting { width: 100%; height: 100%; display: flex; flex-direction: column; gap: 18px; align-items: center; justify-content: center; text-align: center; padding: 32px; }
button { appearance: none; border: 0; border-radius: 999px; padding: 12px 22px; font-size: 16px; font-weight: 700; cursor: pointer; background: #fff; color: #111; }
.hint { opacity: .78; max-width: 680px; line-height: 1.6; }
.error { color: #ffb4b4; white-space: pre-wrap; max-width: 760px; }
</style>
</head>
<body>
<iframe id="player" style="position:fixed;inset:0;width:100vw;height:100vh;border:0;background:#000;display:none;" sandbox="allow-scripts allow-same-origin" allow="autoplay"></iframe>
<div class="waiting" id="overlay">
  <h2>Fogsight Recording</h2>
  <p class="hint">请勿关闭此黑色窗口。请回到原窗口，在系统共享选择器中选择这个黑色窗口并点击“分享”。</p>
  <button id="start">等待录屏授权</button>
  <p id="status" class="hint"></p>
</div>
<script>
const key = ${JSON.stringify(captureKey)};
const statusEl = document.getElementById('status');
const startButton = document.getElementById('start');
async function requestCapture() {
  try {
    statusEl.textContent = '正在打开系统录屏选择器...';
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { width: 1280, height: 720 }, audio: false });
    if (!window.opener || !window.opener.__fogsightCaptureResolvers || !window.opener.__fogsightCaptureResolvers[key]) {
      throw new Error('主窗口连接已丢失，请回到主窗口重新导出。');
    }
    statusEl.textContent = '已授权，正在载入动画...';
    window.opener.__fogsightCaptureResolvers[key].resolve(stream);
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = '录屏选择失败：' + (error && (error.name + ': ' + error.message) || error);
    if (window.opener && window.opener.__fogsightCaptureResolvers && window.opener.__fogsightCaptureResolvers[key]) {
      window.opener.__fogsightCaptureResolvers[key].reject(error);
    }
  }
}
startButton.addEventListener('click', requestCapture);
setTimeout(() => {
  requestCapture().catch(() => {
    statusEl.textContent = '如果系统选择器没有自动弹出，请点击上方按钮手动开始。';
  });
}, 120);
</script>
</body>
</html>`);
                    playbackWindow.document.close();
                    try { playbackWindow.focus(); } catch (_) {}

                    let stream;
                    let recorder;
                    let animationBlobUrl;
                    let downloadBlobUrl;
                    try {
                        showWarning('请在新打开的 Fogsight Recording 窗口里点击“等待录屏授权”。');
                        stream = await streamPromise;
                        delete window.__fogsightCaptureResolvers[captureKey];

                        // Do not navigate the captured popup after getDisplayMedia.
                        // On macOS Edge, navigating the captured window can immediately end
                        // the video track. Keep the top document stable and render the
                        // animation inside an iframe instead.
                        const playerFrame = playbackWindow.document.getElementById('player');
                        const overlay = playbackWindow.document.getElementById('overlay');
                        if (!playerFrame) throw new Error('Recording iframe is missing.');
                        fitRecordingFrame(playerFrame);
                        playerFrame.srcdoc = htmlContent;
                        playerFrame.style.display = 'block';
                        if (overlay) overlay.style.display = 'none';
                        await new Promise(resolve => setTimeout(resolve, 1100));

                        const liveTrack = stream.getVideoTracks()[0];
                        if (!stream.active || !liveTrack || liveTrack.readyState !== 'live') {
                            throw new DOMException(
                                `Captured track ended before MediaRecorder.start. stream.active=${stream?.active}; videoTracks=${stream?.getVideoTracks?.().length || 0}; firstTrackState=${liveTrack?.readyState || 'missing'}`,
                                'InvalidStateError'
                            );
                        }

                        showWarning('录制已开始，关闭播放窗口或点击“停止共享”后会自动下载视频。');
                        const chunks = [];
                        recorder = new MediaRecorder(stream, { mimeType });

                        recorder.ondataavailable = (event) => {
                            if (event.data && event.data.size > 0) chunks.push(event.data);
                        };

                        recorder.onstop = () => {
                            isVideoExporting = false;
                            if (chunks.length === 0) {
                                showWarning(buildVideoExportFailureMessage({
                                    stage: 'MediaRecorder.onstop',
                                    mimeType,
                                    stream,
                                    recorder,
                                    note: '没有录到数据。请在系统屏幕共享选择器里选择 Fogsight Recording 窗口，并在动画播放期间保持共享，不要立即停止。',
                                }));
                                return;
                            }
                            const blob = new Blob(chunks, { type: mimeType });
                            downloadBlobUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = downloadBlobUrl;
                            a.download = `fogsight-export-${timestampForFilename()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            setTimeout(() => {
                                if (downloadBlobUrl) URL.revokeObjectURL(downloadBlobUrl);
                            }, 1000);
                            stream.getTracks().forEach(track => track.stop());
                            if (playbackWindow && !playbackWindow.closed) playbackWindow.close();
                            showWarning('视频导出成功。');
                        };

                        stream.getVideoTracks()[0].onended = () => {
                            if (recorder.state === 'recording') recorder.stop();
                        };

                        recorder.start();
                        const closeCheck = setInterval(() => {
                            if (playbackWindow.closed && recorder.state === 'recording') {
                                clearInterval(closeCheck);
                                recorder.stop();
                            }
                        }, 500);
                        setTimeout(() => {
                            clearInterval(closeCheck);
                            if (recorder.state === 'recording') recorder.stop();
                        }, 180000);
                    } catch (error) {
                        isVideoExporting = false;
                        delete window.__fogsightCaptureResolvers[captureKey];
                        console.error('Failed to record screen:', error);
                        if (animationBlobUrl) URL.revokeObjectURL(animationBlobUrl);
                        if (stream) stream.getTracks().forEach(track => track.stop());
                        if (playbackWindow && !playbackWindow.closed && !stream) {
                            // Keep popup visible if it contains the error message from its own getDisplayMedia call.
                        }
                        if (error?.name === 'NotAllowedError' || error?.name === 'AbortError') {
                            showWarning(translations.exportVideoPermissionCancelled[currentLang]);
                        } else {
                            showWarning(buildVideoExportFailureMessage({
                                stage: 'popup-owned-getDisplayMedia-record',
                                error,
                                mimeType,
                                stream,
                                recorder,
                                note: '录屏选择由弹出的 Fogsight Recording 窗口内按钮触发；授权后不会再跳转被捕获窗口，而是在同一窗口 iframe 中播放动画。若仍失败，请回传此诊断。',
                            }));
                        }
                    }
                }
            );
        });

        chatLog.appendChild(playerElement);
        scrollToBottom();
    }

    function validateHtmlContent(htmlContent) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const parseErrors = doc.querySelectorAll('parsererror');
        if (parseErrors.length > 0) {
            const message = parseErrors[0].textContent?.trim() || 'HTML parsererror';
            console.warn('HTML 解析失败：', message);
            return { valid: false, diagnostics: `HTML 解析失败：${message}` };
        }

        if (!doc.body || doc.body.innerHTML.trim() === '') {
            console.warn('HTML 内容为空');
            return { valid: false, diagnostics: 'HTML body 为空。' };
        }

        return { valid: true, diagnostics: 'HTML 校验通过。' };
    }

    function isHtmlContentValid(htmlContent) {
        return validateHtmlContent(htmlContent).valid;
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
        openSettingsButton?.setAttribute('aria-label', translations.modelSettings[lang]);
        chatSettingsButton?.setAttribute('aria-label', translations.modelSettings[lang]);
        renderRecentConversations();
        updateCurrentChatTitle(getCurrentConversation()?.title || (conversationHistory.length ? translations.currentConversationUntitled[lang] : translations.newConversationDefault[lang]));
        renderModelSettingsState();
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
        openSettingsButton?.setAttribute('aria-label', translations.modelSettings[currentLang]);
        chatSettingsButton?.setAttribute('aria-label', translations.modelSettings[currentLang]);

        newChatButton.addEventListener('click', () => startNewConversation({ switchView: true }));
        sidebarNewChatButton?.addEventListener('click', () => startNewConversation({ switchView: true }));
        sidebarToggleButton?.addEventListener('click', openSidebar);
        closeSidebarButton?.addEventListener('click', closeSidebar);
        languageSwitcher.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (target) setLanguage(target.dataset.lang);
        });

        function hideModal() {
            featureModal.classList.remove('visible');
            modalPrimaryAction = null;
        }

        modalCloseButton.addEventListener('click', hideModal);
        openSettingsButton?.addEventListener('click', openSettingsModal);
        chatSettingsButton?.addEventListener('click', openSettingsModal);
        settingsCloseButton?.addEventListener('click', closeSettingsModal);
        settingsCancelButton?.addEventListener('click', closeSettingsModal);
        settingsModal?.addEventListener('click', (event) => {
            if (event.target === settingsModal) closeSettingsModal();
        });
        settingsForm?.addEventListener('submit', handleSettingsSave);
        settingsTestButton?.addEventListener('click', handleSettingsTest);
        settingsTestDetailsButton?.addEventListener('click', () => {
            modelSettingsState.testDetailsOpen = !modelSettingsState.testDetailsOpen;
            toggleModelTestDetails(modelSettingsState.testDetailsOpen);
        });
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

        loadRecentConversations();
        renderRecentConversations();
        updateCurrentChatTitle(translations.newConversationDefault[initialLang]);
        setLanguage(initialLang);
        updateGenerationInteractivity();
    }

    init();
});

function showWarning(message) {
    const box = document.getElementById('warning-box');
    const overlay = document.getElementById('overlay');
    const text = document.getElementById('warning-message');
    if (!box || !overlay || !text) return;

    text.textContent = message;
    box.style.display = 'flex';
    overlay.style.display = 'block';

    if (warningHideTimer) clearTimeout(warningHideTimer);
    warningHideTimer = setTimeout(() => {
        hideWarning();
    }, 4200);
}

function hideWarning() {
    const box = document.getElementById('warning-box');
    const overlay = document.getElementById('overlay');
    if (warningHideTimer) {
        clearTimeout(warningHideTimer);
        warningHideTimer = null;
    }
    if (box) box.style.display = 'none';
    if (overlay) overlay.style.display = 'none';
}
