// Глобальный поиск по всему сайту

/**
 * Генерирует HTML для аватара продавца
 * @param {string|null} avatarUrl - URL аватара или null
 * @param {string} className - CSS класс для аватара
 * @returns {string} HTML для аватара
 */
function getSellerAvatarHtml(avatarUrl, className = "seller-avatar") {
    if (avatarUrl) {
        return `<div class="${className}"><img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;
    }
    return `<div class="${className}">👤</div>`;
}

// Глобальная функция поиска
async function globalSearch(searchText) {
    if (!searchText || searchText.length < 2) {
        // Если запрос пустой или слишком короткий, показываем результаты по умолчанию
        restoreDefaultView();
        return;
    }

    try {
        // Загружаем все данные если их нет
        if (!window.allGames) {
            window.allGames = await API.getGames();
        }
        if (!window.allListingsGlobal) {
            window.allListingsGlobal = await API.getListings();
        }

        const lowerSearch = searchText.toLowerCase();

        // Поиск по играм
        const foundGames = window.allGames.filter(game =>
            game.name.toLowerCase().includes(lowerSearch)
        );

        // Поиск по объявлениям (название, описание, ник продавца)
        const foundListings = window.allListingsGlobal.filter(listing =>
            listing.title.toLowerCase().includes(lowerSearch) ||
            listing.description.toLowerCase().includes(lowerSearch) ||
            listing.seller_name.toLowerCase().includes(lowerSearch)
        );

        // Показываем результаты поиска
        displaySearchResults(searchText, foundGames, foundListings);

    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

// Восстановление стандартного вида
function restoreDefaultView() {
    const searchResults = document.getElementById('global-search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }

    const mainContent = document.querySelector('.container');
    if (mainContent) {
        mainContent.style.display = 'block';
    }

    const path = window.location.pathname;
    const isIndexPage = path.includes('index.html') || path.endsWith('/');
    const isListingsPage = path.includes('listings.html');

    // Восстанавливаем данные на текущей странице
    if (isIndexPage && window.allGames && window.displayGames) {
        window.displayGames(window.allGames);
    } else if (isListingsPage && typeof window.filterListingsWithCategory === 'function') {
        window.filterListingsWithCategory('');
    }
}

// Отображение результатов поиска
function displaySearchResults(searchText, games, listings) {
    let searchResultsContainer = document.getElementById('global-search-results');

    // Создаем контейнер если его нет
    if (!searchResultsContainer) {
        searchResultsContainer = document.createElement('div');
        searchResultsContainer.id = 'global-search-results';
        searchResultsContainer.className = 'container';
        searchResultsContainer.style.cssText = `
            display: none;
        `;
        document.body.appendChild(searchResultsContainer);
    }

    // Скрываем основной контент
    const mainContent = document.querySelector('.container:not(#global-search-results)');
    if (mainContent) {
        mainContent.style.display = 'none';
    }

    searchResultsContainer.style.display = 'block';

    // Формируем HTML результатов
    let html = `
        <div style="margin-bottom: 30px;">
            <h1 class="section-title" style="text-align: left;">
                Результаты поиска: "${searchText}"
            </h1>
            <p class="section-subtitle" style="text-align: left;">
                Найдено: ${games.length} игр(ы) и ${listings.length} объявлени(я/й)
            </p>
        </div>
    `;

    // Игры
    if (games.length > 0) {
        html += `
            <div style="margin-bottom: 40px;">
                <h3 style="color: #ff6b35; font-size: 22px; margin-bottom: 20px; font-weight: 700;">🎮 Игры</h3>
                <div class="search-games-grid">
        `;

        games.forEach(game => {
            const initials = getInitials(game.name);
            html += `
                <a href="listings.html?game=${game.id}" class="search-game-card">
                    <div class="search-game-icon">${initials}</div>
                    <div class="search-game-name">${game.name}</div>
                </a>
            `;
        });

        html += `</div></div>`;
    }

    // Объявления
    if (listings.length > 0) {
        html += `
            <div style="margin-bottom: 40px;">
                <h3 style="color: #ff6b35; font-size: 22px; margin-bottom: 20px; font-weight: 700;">📋 Объявления</h3>

                <!-- Шапка таблицы -->
                <div class="listings-header">
                    <div class="header-cell" data-i18n="server">Сервер</div>
                    <div class="header-cell" data-i18n="title">Наименование</div>
                    <div class="header-cell" data-i18n="description">Описание</div>
                    <div class="header-cell" data-i18n="seller">Продавец</div>
                    <div class="header-cell" style="text-align: right;">
                        <span data-i18n="price">Цена</span>
                    </div>
                </div>

                <!-- Список объявлений -->
                <div class="listings">
        `;

        listings.forEach(listing => {
            const categoryName = getCategoryName(listing.category);
            const sellerProfileUrl = getSellerProfileUrl(listing.seller);

            html += `
                <div class="listing-card" onclick="window.location.href='listing-detail.html?id=${listing.id}'">
                    <div class="listing-server">${listing.server_name || 'Без сервера'}</div>
                    <div class="listing-info">
                        <h3 class="listing-title">${listing.title}</h3>
                        <div class="listing-category-badge">${categoryName}</div>
                    </div>
                    <p class="listing-description">${listing.description}</p>
                    <a href="${sellerProfileUrl}" class="listing-seller-section" onclick="event.stopPropagation();">
                        ${getSellerAvatarHtml(listing.seller_avatar)}
                        <span class="listing-seller-name">${listing.seller_name}</span>
                    </a>
                    <div class="listing-price-section">
                        <div class="listing-price">₽ ${parseFloat(listing.price).toFixed(2)}</div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    // Если ничего не найдено
    if (games.length === 0 && listings.length === 0) {
        html += `
            <div style="text-align: center; padding: 80px 20px;">
                <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;">🔍</div>
                <div style="color: #9ca3af; font-size: 18px;">Ничего не найдено по запросу "${searchText}"</div>
            </div>
        `;
    }

    searchResultsContainer.innerHTML = html;

    // Обновляем переводы после добавления элементов
    if (typeof updateTranslations === 'function') {
        updateTranslations();
    }
}

// Инициализация поиска
function initSearch() {
    const searchInput = document.getElementById('header-search');
    if (!searchInput) return;

    // Задержка для оптимизации (debounce)
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            globalSearch(e.target.value.trim());
        }, 300); // 300мс задержка
    });
}

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});
