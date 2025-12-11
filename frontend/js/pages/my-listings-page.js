/**
 * Модуль страницы "Мои объявления" (my-listings.html)
 * Управление личными объявлениями пользователя (просмотр, редактирование, удаление)
 */

// Проверка авторизации
const token = getToken();

if (!token) {
    window.location.href = 'login.html';
}

// Кеш загруженных игр
let allGames = [];

/**
 * Загружает список доступных игр
 */
async function loadGames() {
    allGames = await API.getGames();
}

/**
 * Загружает и отображает объявления текущего пользователя
 */
async function loadMyListings() {
    try {
        const listings = await API.getMyListings(token);
        const container = document.getElementById('listings');
        container.innerHTML = '';

        if (listings.length === 0) {
            container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">📦</div>
                    <div>У вас пока нет объявлений</div>
                </div>
            `;
            return;
        }

        // Группируем объявления по играм
        const listingsByGame = {};
        listings.forEach(listing => {
            if (!listingsByGame[listing.game_name]) {
                listingsByGame[listing.game_name] = [];
            }
            listingsByGame[listing.game_name].push(listing);
        });

        // Создаем HTML для каждой группы игр
        Object.keys(listingsByGame).forEach(gameName => {
            const gameListings = listingsByGame[gameName];

            // Создаем контейнер группы
            const gameGroup = document.createElement('div');
            gameGroup.className = 'game-group';

            // Заголовок группы
            const groupTitle = document.createElement('h3');
            groupTitle.className = 'game-group-title';
            groupTitle.innerHTML = `
                ${gameName}
            `;
            gameGroup.appendChild(groupTitle);

            // Сетка объявлений
            const grid = document.createElement('div');
            grid.className = 'listings-grid';

            gameListings.forEach(listing => {
                const createdDate = new Date(listing.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                });

                const card = document.createElement('div');
                card.className = 'listing-card';
                card.innerHTML = `
                    <div class="listing-card-title">${listing.title}</div>
                    <div class="listing-card-description">${listing.description}</div>
                    <div class="listing-card-footer">
                        <div class="listing-card-price-date">
                            <div class="listing-card-price">₽ ${parseFloat(listing.price).toFixed(2)}</div>
                            <div class="listing-card-date">${createdDate}</div>
                        </div>
                        <div class="listing-actions">
                        <button class="btn btn-edit" onclick="editListing(${listing.id}); event.stopPropagation();">
                            <span data-i18n="edit">Редактировать</span>
                        </button>
                        <button class="btn btn-delete" onclick="deleteListing(${listing.id}); event.stopPropagation();">
                            <span data-i18n="delete">Удалить</span>
                        </button>
                        </div>
                    </div>
                `;

                // Добавляем клик для перехода к детальному просмотру
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('button')) {
                        window.location.href = `listing-detail.html?id=${listing.id}`;
                    }
                });

                grid.appendChild(card);
            });

            gameGroup.appendChild(grid);
            container.appendChild(gameGroup);
        });

        // Применяем переводы к динамически добавленным элементам
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }

    } catch (error) {
        document.getElementById('listings').innerHTML =
            '<div class="empty">Ошибка загрузки</div>';
    }
}

/**
 * Открывает модальное окно редактирования объявления
 * @param {number} id - ID объявления
 */
async function editListing(id) {
    try {
        const listings = await API.getListings();
        const listing = listings.find(l => l.id === id);

        if (!listing) return;

        document.getElementById('edit-id').value = listing.id;
        document.getElementById('edit-title').value = listing.title;
        document.getElementById('edit-description').value = listing.description;
        document.getElementById('edit-price').value = listing.price;
        document.getElementById('edit-category').value = listing.category;

        const gameSelect = document.getElementById('edit-game');
        gameSelect.innerHTML = '';
        allGames.forEach(game => {
            const option = document.createElement('option');
            option.value = game.id;
            option.textContent = game.name;
            if (game.id === listing.game) {
                option.selected = true;
            }
            gameSelect.appendChild(option);
        });

        // Загружаем серверы для выбранной игры
        await loadServersForEditModal(listing.game, listing.server);

        document.getElementById('edit-modal').style.display = 'flex';

        // Применяем переводы к модальному окну
        if (typeof updateTranslations === 'function') {
            updateTranslations();
        }

    } catch (error) {
        notify.error('Ошибка при загрузке данных');
    }
}

/**
 * Загружает серверы для выбранной игры в модальное окно редактирования
 * @param {number} gameId - ID игры
 * @param {number} selectedServerId - ID выбранного сервера (опционально)
 */
async function loadServersForEditModal(gameId, selectedServerId) {
    const serverSelect = document.getElementById('edit-server');
    serverSelect.innerHTML = '<option value="">Выберите сервер...</option>';

    if (!gameId) {
        serverSelect.disabled = true;
        return;
    }

    try {
        const servers = await API.getGameServers(gameId);

        if (servers.length === 0) {
            serverSelect.innerHTML = '<option value="">Нет доступных серверов</option>';
            serverSelect.disabled = true;
            return;
        }

        serverSelect.disabled = false;
        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = server.name;
            if (server.id === selectedServerId) {
                option.selected = true;
            }
            serverSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки серверов:', error);
        serverSelect.innerHTML = '<option value="">Ошибка загрузки серверов</option>';
        serverSelect.disabled = true;
    }
}

/**
 * Закрывает модальное окно редактирования
 */
function closeModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

/**
 * Удаляет объявление после подтверждения
 * @param {number} id - ID объявления
 */
async function deleteListing(id) {
    if (!confirm('Вы уверены что хотите удалить это объявление?')) {
        return;
    }

    try {
        const response = await API.deleteListing(id, token);

        if (response.ok || response.status === 204) {
            notify.success('Объявление удалено!');
            loadMyListings();
        } else {
            notify.error('Ошибка при удалении');
        }
    } catch (error) {
        notify.error('Ошибка соединения');
    }
}

/**
 * Инициализация обработчиков событий
 */
function initEventHandlers() {
    // Обработчик изменения игры в модальном окне редактирования
    document.getElementById('edit-game').addEventListener('change', async (e) => {
        await loadServersForEditModal(e.target.value, null);
    });

    // Обработчик отправки формы редактирования
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('edit-id').value;
        const data = {
            game: document.getElementById('edit-game').value,
            category: document.getElementById('edit-category').value,
            server: document.getElementById('edit-server').value,
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            price: document.getElementById('edit-price').value
        };

        try {
            const { response } = await API.updateListing(id, data, token);

            if (response.ok) {
                notify.success('Объявление обновлено!');
                closeModal();
                loadMyListings();
            } else {
                notify.error('Ошибка при обновлении');
            }
        } catch (error) {
            notify.error('Ошибка соединения');
        }
    });
}

/**
 * Инициализация страницы
 */
function initPage() {
    checkAuth();
    initEventHandlers();
    loadGames().then(() => loadMyListings());
}

// Экспортируем функции для использования в HTML
window.MyListingsPage = {
    editListing,
    deleteListing,
    closeModal,
    init: initPage
};

// Экспортируем функции глобально для совместимости с onclick в HTML
window.editListing = editListing;
window.deleteListing = deleteListing;
window.closeModal = closeModal;

// Автоматическая инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
