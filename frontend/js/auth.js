// Функции авторизации

// Получить токен
function getToken() {
    return localStorage.getItem('token');
}

// Получить пользователя
function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Сохранить токен и пользователя
function saveAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

// Выход
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Переключение выпадающего меню пользователя
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('active');

    // Закрыть меню языков
    const langDropdown = document.getElementById('language-dropdown');
    if (langDropdown) {
        langDropdown.classList.remove('active');
    }
}

// Переключение выпадающего меню языков
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('language-dropdown');
    dropdown.classList.toggle('active');

    // Закрыть меню пользователя
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.classList.remove('active');
    }
}

// Переключение мобильного меню (гамбургер)
function toggleMobileMenu() {
    const dropdown = document.getElementById('mobile-menu-dropdown');
    dropdown.classList.toggle('active');

    // Закрыть другие меню
    const userDropdown = document.getElementById('user-dropdown');
    const langDropdown = document.getElementById('language-dropdown');
    if (userDropdown) userDropdown.classList.remove('active');
    if (langDropdown) langDropdown.classList.remove('active');
}

// Закрытие меню при клике вне его
document.addEventListener('click', (e) => {
    const userDropdown = document.getElementById('user-dropdown');
    const userAvatar = document.querySelector('.user-avatar');
    const langDropdown = document.getElementById('language-dropdown');
    const langButton = document.querySelector('.language-button');
    const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');

    // Закрыть меню пользователя
    if (userDropdown && !userDropdown.contains(e.target) && e.target !== userAvatar) {
        userDropdown.classList.remove('active');
    }

    // Закрыть меню языков
    if (langDropdown && !langDropdown.contains(e.target) && e.target !== langButton) {
        langDropdown.classList.remove('active');
    }

    // Закрыть мобильное меню
    if (mobileMenuDropdown && !mobileMenuDropdown.contains(e.target) &&
        !e.target.closest('.mobile-menu-button')) {
        mobileMenuDropdown.classList.remove('active');
    }
});

// Получить выпадающий список переключения языка
function getLanguageSwitcher() {
    const currentLang = getCurrentLanguage();
    const currentFlag = currentLang === 'ru' ? '🇷🇺' : '🇧🇷';

    return `
        <div class="language-switcher">
            <div class="language-button" onclick="toggleLanguageDropdown()" title="Выбрать язык / Selecionar idioma">
                ${currentFlag}
            </div>
            <div id="language-dropdown" class="language-dropdown">
                <button
                    class="language-option ${currentLang === 'ru' ? 'active' : ''}"
                    onclick="changeLanguage('ru')"
                >
                    <span class="flag">🇷🇺</span>
                    <span>Русский</span>
                </button>
                <button
                    class="language-option ${currentLang === 'pt-br' ? 'active' : ''}"
                    onclick="changeLanguage('pt-br')"
                >
                    <span class="flag">🇧🇷</span>
                    <span>Português (Brasil)</span>
                </button>
            </div>
        </div>
    `;
}

// Обновить количество непрочитанных сообщений
async function updateUnreadCount() {
    const token = getToken();
    if (!token) return;

    try {
        const unreadCount = await API.getUnreadCount(token);
        const badge = document.getElementById('unread-badge');

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка обновления непрочитанных сообщений:', error);
    }
}

// Проверка авторизации для шапки
function checkAuth() {
    const token = getToken();
    const user = getUser();
    const authButtons = document.getElementById('auth-buttons');

    if (!authButtons) return;

    const languageSwitcher = getLanguageSwitcher();
    const currentLang = getCurrentLanguage();
    const currentFlag = currentLang === 'ru' ? '🇷🇺' : '🇧🇷';

    if (token && user) {
        // Для авторизованных: показываем переключатель языка и аватар
        const avatarContent = user.avatar
            ? `<img src="${user.avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; pointer-events: none;">`
            : '👤';

        authButtons.innerHTML = `
            ${languageSwitcher}
            <div class="user-avatar-container">
                <div class="user-avatar" onclick="toggleUserDropdown()">${avatarContent}</div>
                <div id="unread-badge" class="unread-badge" style="display: none;">0</div>
                <div id="user-dropdown" class="user-dropdown">
                    <a href="profile.html" class="dropdown-item" data-i18n="my_profile">Мой профиль</a>
                    <a href="my-listings.html" class="dropdown-item" data-i18n="my_listings">Мои объявления</a>
                    <a href="create-listing.html" class="dropdown-item" data-i18n="create_listing">Создать объявление</a>
                    <a href="messages.html" class="dropdown-item" data-i18n="my_messages">Мои сообщения</a>
                    <div class="dropdown-divider"></div>
                    <div style="padding: 8px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; display: none;" class="mobile-language-label" data-i18n="language">Язык</div>
                    <button
                        class="dropdown-item mobile-language-option ${currentLang === 'ru' ? 'active' : ''}"
                        onclick="changeLanguage('ru')"
                        style="display: none;"
                    >
                        🇷🇺 Русский
                    </button>
                    <button
                        class="dropdown-item mobile-language-option ${currentLang === 'pt-br' ? 'active' : ''}"
                        onclick="changeLanguage('pt-br')"
                        style="display: none;"
                    >
                        🇧🇷 Português (Brasil)
                    </button>
                    <div class="dropdown-divider mobile-language-divider" style="display: none;"></div>
                    <button onclick="logout()" class="dropdown-item" data-i18n="logout">Выйти</button>
                </div>
            </div>
        `;

        // Обновить счетчик непрочитанных сообщений
        updateUnreadCount();

        // Обновлять каждые 30 секунд
        if (!window.unreadCountInterval) {
            window.unreadCountInterval = setInterval(updateUnreadCount, 30000);
        }
    } else {
        // Для неавторизованных: показываем обычные кнопки и гамбургер-меню для мобильных
        authButtons.innerHTML = `
            ${languageSwitcher}
            <a href="login.html" class="btn btn-secondary" data-i18n="login">Войти</a>
            <a href="register.html" class="btn btn-primary" data-i18n="register">Регистрация</a>
            <div style="position: relative;">
                <button class="mobile-menu-button" onclick="toggleMobileMenu()">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div id="mobile-menu-dropdown" class="mobile-menu-dropdown">
                    <a href="login.html" class="mobile-menu-item" data-i18n="login">Войти</a>
                    <a href="register.html" class="mobile-menu-item" data-i18n="register">Регистрация</a>
                    <div class="mobile-menu-divider"></div>
                    <div style="padding: 8px 16px; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase;" data-i18n="language">Язык</div>
                    <button
                        class="mobile-menu-item ${currentLang === 'ru' ? 'active' : ''}"
                        onclick="changeLanguage('ru')"
                    >
                        🇷🇺 Русский
                    </button>
                    <button
                        class="mobile-menu-item ${currentLang === 'pt-br' ? 'active' : ''}"
                        onclick="changeLanguage('pt-br')"
                    >
                        🇧🇷 Português (Brasil)
                    </button>
                </div>
            </div>
        `;
    }

    // Обновляем переводы после добавления элементов
    if (typeof updateTranslations === 'function') {
        updateTranslations();
    }
}

// Требуется авторизация (для защищенных страниц)
function requireAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Обработка OAuth callback (получение токена из URL)
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('user_id');
    const username = urlParams.get('username');

    if (token && userId) {
        // Сохраняем токен
        localStorage.setItem('token', token);

        // Получаем полные данные пользователя с сервера
        fetch(`/api/users/${userId}/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then(response => response.json())
        .then(user => {
            // Сохраняем полные данные пользователя
            localStorage.setItem('user', JSON.stringify(user));

            // Показываем уведомление
            if (typeof notify !== 'undefined') {
                notify.success('Вы успешно вошли через Google!');
            }

            // Очищаем URL от параметров и перезагружаем страницу
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload();
        })
        .catch(error => {
            console.error('Ошибка получения данных пользователя:', error);

            // Если не удалось получить данные, сохраняем минимальные данные
            const userData = {
                id: userId,
                username: username || `user_${userId}`
            };
            localStorage.setItem('user', JSON.stringify(userData));

            // Очищаем URL от параметров и перезагружаем страницу
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.reload();
        });
    }
}

// Вызываем обработчик при загрузке страницы
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleOAuthCallback);
} else {
    handleOAuthCallback();
}

// Экспорт функции для использования в других скриптах
window.updateUnreadCount = updateUnreadCount;