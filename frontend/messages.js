
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
let currentConversation = null;
let currentUser = null;
let refreshInterval = null;

async function init() {
    const token = getToken();
    currentUser = getUser();
    if (!token || !currentUser) {
        notify.error("Необходимо войти в систему");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }
    loadConversations();
    
    // Проверяем, есть ли ID диалога в URL
    const conversationId = getUrlParameter("conversation");
    if (conversationId) {
        await selectConversation(parseInt(conversationId));
    }
    
    refreshInterval = setInterval(() => {
        loadConversations();
        if (currentConversation) loadMessages(currentConversation.id);
    }, 5000);
}

async function loadConversations() {
    try {
        const token = getToken();
        const conversations = await API.getConversations(token);
        displayConversations(conversations);
    } catch (error) {
        console.error("Ошибка загрузки диалогов:", error);
    }
}

function displayConversations(conversations) {
    const container = document.getElementById("conversations-container");
    if (conversations.length === 0) {
        container.innerHTML = "<div class='empty-state'><p>У вас пока нет сообщений</p></div>";
        return;
    }
    container.innerHTML = conversations.map(conv => {
        const otherUser = conv.buyer === currentUser.id ? conv.seller_name : conv.buyer_name;
        const lastMsg = conv.last_message;
        const unreadCount = conv.unread_count || 0;
        const timeAgo = lastMsg ? formatTimeAgo(new Date(lastMsg.created_at)) : "";
        const preview = lastMsg ? lastMsg.text.substring(0, 50) : "Нет сообщений";
        return `<div class="conversation-item ${currentConversation && currentConversation.id === conv.id ? "active" : ""}" onclick="selectConversation(${conv.id})">
            <div class="conversation-user">
                <div class="conversation-avatar">${otherUser.charAt(0).toUpperCase()}</div>
                <div class="conversation-info">
                    <div class="conversation-name">${otherUser}</div>
                    <div class="conversation-listing">${conv.listing_title} - R$ ${conv.listing_price}</div>
                </div>
            </div>
            <div class="conversation-last-message">${preview}</div>
            <div class="conversation-time">${timeAgo}</div>
            ${unreadCount > 0 ? `<div class="conversation-unread">${unreadCount}</div>` : ""}
        </div>`;
    }).join("");
}

async function selectConversation(id) {
    try {
        const token = getToken();
        const conversation = await API.getConversation(id, token);
        currentConversation = conversation;
        displayChat(conversation);
        await API.markAsRead(id, token);
        loadConversations();

        // Обновить счетчик непрочитанных в хедере
        if (typeof window.updateUnreadCount === 'function') {
            window.updateUnreadCount();
        }

        // Для мобильных: скрыть список и показать чат
        showChat();
    } catch (error) {
        console.error("Ошибка загрузки диалога:", error);
        notify.error("Не удалось загрузить диалог");
    }
}

// Функция для показа чата (мобильные)
function showChat() {
    const chatContainer = document.getElementById('chat-container');
    const conversationsList = document.getElementById('conversations-list');
    chatContainer.classList.add('active');
    conversationsList.classList.add('hidden');
}

// Функция для возврата к списку диалогов (мобильные)
function backToConversations() {
    const chatContainer = document.getElementById('chat-container');
    const conversationsList = document.getElementById('conversations-list');
    chatContainer.classList.remove('active');
    conversationsList.classList.remove('hidden');
}

function displayChat(conversation) {
    const otherUser = conversation.buyer === currentUser.id ? conversation.seller_name : conversation.buyer_name;
    const chatContainer = document.getElementById("chat-container");
    const backText = typeof t === 'function' ? t('back_link') : 'Назад';
    const sendText = typeof t === 'function' ? t('send') : 'Отправить';
    const placeholderText = typeof t === 'function' ? t('write_message') : 'Напишите сообщение...';
    chatContainer.innerHTML = `<div class="chat-header">
            <button class="back-button" onclick="backToConversations()">
                ← <span data-i18n="back_link">${backText}</span>
            </button>
            <div class="chat-user-info">
                <div class="conversation-avatar">${otherUser.charAt(0).toUpperCase()}</div>
                <div><h3>${otherUser}</h3>
                    <div style="font-size:14px;color:#6b7280">${conversation.listing_title} - <span style="color:#10b981">₽ ${conversation.listing_price}</span></div>
                </div>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <form class="input-form" onsubmit="sendMessage(event)">
                <textarea id="message-input" placeholder="${placeholderText}" data-i18n-placeholder="write_message" rows="1"></textarea>
                <button type="submit" class="send-btn" data-i18n="send">${sendText}</button>
            </form>
        </div>`;
    displayMessages(conversation.messages);
    scrollToBottom();
}

function displayMessages(messages) {
    const container = document.getElementById("chat-messages");
    if (!messages || messages.length === 0) {
        const noMessagesText = typeof t === 'function' ? t('no_messages') : 'Сообщений пока нет';
        container.innerHTML = `<div class='empty-state'><p data-i18n="no_messages">${noMessagesText}</p></div>`;
        return;
    }
    container.innerHTML = messages.map(msg => {
        const isOwn = msg.sender === currentUser.id;
        const time = formatTime(new Date(msg.created_at));
        const avatar = msg.sender_name.charAt(0).toUpperCase();
        return `<div class="message ${isOwn ? "own" : ""}">
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-time">${time}</div>
            </div>
        </div>`;
    }).join("");
}

async function loadMessages(conversationId) {
    try {
        const token = getToken();
        const conversation = await API.getConversation(conversationId, token);
        if (currentConversation && currentConversation.id === conversationId) {
            displayMessages(conversation.messages);
        }
    } catch (error) {
        console.error("Ошибка обновления сообщений:", error);
    }
}

async function sendMessage(event) {
    event.preventDefault();
    const input = document.getElementById("message-input");
    const text = input.value.trim();
    if (!text || !currentConversation) return;
    try {
        const token = getToken();
        const { response, data } = await API.sendMessage(currentConversation.id, text, token);
        if (response.ok) {
            input.value = "";
            await selectConversation(currentConversation.id);
            scrollToBottom();
        } else {
            notify.error("Не удалось отправить сообщение");
        }
    } catch (error) {
        console.error("Ошибка отправки:", error);
        notify.error("Ошибка отправки сообщения");
    }
}

function scrollToBottom() {
    setTimeout(() => {
        const container = document.getElementById("chat-messages");
        if (container) container.scrollTop = container.scrollHeight;
    }, 100);
}

function formatTime(date) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "только что";
    if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

window.addEventListener("beforeunload", () => {
    if (refreshInterval) clearInterval(refreshInterval);
});

checkAuth();
init();
