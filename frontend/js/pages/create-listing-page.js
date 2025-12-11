/**
 * Модуль страницы создания объявления (create-listing.html)
 * Отвечает за форму создания нового объявления
 */

/**
 * Проверяет авторизацию и показывает форму или сообщение о необходимости входа
 * @returns {boolean} true если пользователь авторизован
 */
function checkAuthForPage() {
    const token = getToken();
    const formContainer = document.getElementById('form-container');

    if (!token) {
        formContainer.innerHTML = `
            <div class="auth-required">
                <h2 data-i18n="auth_required_title">Требуется авторизация</h2>
                <p data-i18n="auth_required_text">Чтобы создать объявление, нужно войти в аккаунт</p>
                <div class="auth-buttons">
                    <a href="login.html" class="btn btn-primary" data-i18n="login">Войти</a>
                    <a href="register.html" class="btn btn-secondary" data-i18n="register">Регистрация</a>
                </div>
            </div>
        `;
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }
        return false;
    }

    return true;
}

/**
 * Загружает серверы для выбранной игры
 * @param {number} gameId - ID игры
 */
async function loadServersForGame(gameId) {
    const select = document.getElementById('server_number');
    select.innerHTML = `<option value="">${t('select_server_placeholder')}</option>`;

    if (!gameId) {
        select.disabled = true;
        return;
    }

    try {
        const servers = await API.getGameServers(gameId);

        if (servers.length === 0) {
            select.innerHTML = `<option value="">${t('no_servers')}</option>`;
            select.disabled = true;
            return;
        }

        select.disabled = false;
        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = server.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки серверов:', error);
        select.innerHTML = `<option value="">${t('server_load_error')}</option>`;
        select.disabled = true;
    }
}

/**
 * Загружает список игр для выпадающего списка
 */
async function loadGames() {
    try {
        const games = await API.getGames();

        const select = document.getElementById('game');
        games.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            select.appendChild(option);
        });

        // После загрузки игр заполняем форму из URL параметров
        autofillFromUrl();
    } catch (error) {
        notify.error('Ошибка при загрузке игр');
    }
}

/**
 * Автозаполнение формы из URL параметров (game и category)
 */
function autofillFromUrl() {
    // Получаем параметры из URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('game');
    const category = urlParams.get('category');

    // Автозаполняем игру, если указана
    if (gameId) {
        const gameSelect = document.getElementById('game');
        gameSelect.value = gameId;

        // Загружаем серверы для выбранной игры
        loadServersForGame(gameId);

        // Подсвечиваем, что поле было автозаполнено
        gameSelect.style.borderColor = '#4CAF50';
        setTimeout(() => {
            gameSelect.style.borderColor = '';
        }, 2000);
    }

    // Автозаполняем категорию, если указана
    if (category) {
        const categorySelect = document.getElementById('category');
        categorySelect.value = category;

        // Подсвечиваем, что поле было автозаполнено
        categorySelect.style.borderColor = '#4CAF50';
        setTimeout(() => {
            categorySelect.style.borderColor = '';
        }, 2000);
    }
}

/**
 * Инициализация обработчиков событий
 */
function initEventHandlers() {
    // Обработчик изменения игры
    document.getElementById('game').addEventListener('change', async (e) => {
        await loadServersForGame(e.target.value);
    });

    // Обработчик отправки формы
    document.getElementById('listing-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const token = getToken();
        const submitBtn = document.getElementById('submit-btn');

        const serverValue = document.getElementById('server_number').value;
        const data = {
            game: document.getElementById('game').value,
            category: document.getElementById('category').value,
            server: serverValue ? serverValue : null,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            price: parseFloat(document.getElementById('price').value)
        };

        submitBtn.disabled = true;
        submitBtn.textContent = t('publishing');

        try {
            const { response } = await API.createListing(data, token);

            if (response.ok) {
                notify.success(t('listing_created_success'));
                document.getElementById('listing-form').reset();

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                const errorData = await response.json();
                notify.error(errorData.error || t('listing_create_error'));
                submitBtn.disabled = false;
                submitBtn.textContent = t('create_button');
            }
        } catch (error) {
            notify.error(t('connection_error'));
            submitBtn.disabled = false;
            submitBtn.textContent = t('create_button');
        }
    });
}

/**
 * Инициализация страницы
 */
function initPage() {
    // Проверка авторизации для шапки
    checkAuth();

    // Проверяем авторизацию для страницы и загружаем игры если авторизован
    if (checkAuthForPage()) {
        initEventHandlers();
        loadGames();
    }
}

// Экспортируем для использования в HTML (если потребуется)
window.CreateListingPage = {
    init: initPage
};

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
