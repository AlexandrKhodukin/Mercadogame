// Вспомогательные функции

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU');
}

// Получить название категории
function getCategoryName(category) {
    const categories = {
        'account': 'cat_account',
        'currency': 'cat_currency',
        'service': 'cat_service',
        'other': 'cat_other'
    };
    const key = categories[category];
    return key ? t(key) : category;
}

// Получить инициалы из названия
function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

// Получить URL профиля продавца
function getSellerProfileUrl(sellerId) {
    const currentUser = getUser();
    if (currentUser && currentUser.id === sellerId) {
        return 'my-listings.html';
    }
    return `seller-profile.html?id=${sellerId}`;
}