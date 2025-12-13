// Система переводов (i18n)

// Словари переводов
const translations = {
    ru: {
        // Хедер
        'search_placeholder': 'Поиск по играм и объявлениям...',
        'login': 'Войти',
        'register': 'Регистрация',
        'my_profile': 'Мой профиль',
        'my_listings': 'Мои объявления',
        'my_messages': 'Мои сообщения',
        'create_listing': 'Создать объявление',
        'logout': 'Выйти',
        'language': 'Язык',
        'upload_avatar': 'Загрузить аватар',
        'delete_avatar': 'Удалить аватар',
        'avatar_info': 'Поддерживаемые форматы: JPG, PNG, WEBP. Максимальный размер: 5 МБ. Изображение будет автоматически обрезано до квадрата.',

        // Главная страница
        'games_catalog': 'Каталог игр',
        'select_game': 'Выберите игру для просмотра объявлений',
        'loading': 'Загрузка',
        'loading_games': 'Загрузка игр',
        'active_listings': 'активных объявлений',
        'categories': 'категорий',
        'category': 'Категория',
        'all_categories': 'Все категории',
        'cat_account': 'Аккаунты',
        'cat_currency': 'Валюта',
        'cat_service': 'Услуги',
        'cat_other': 'Другое',

        // Страница объявлений
        'filters': 'Фильтры',
        'sort_by': 'Сортировка',
        'price_from': 'Цена от',
        'price_to': 'до',
        'apply': 'Применить',
        'reset': 'Сбросить',
        'back_to_catalog': 'Назад к каталогу',
        'back_to_listings': 'Назад к объявлениям',
        'back_to_main': 'Вернуться на главную',
        'no_listings': 'Объявлений не найдено',
        'server': 'Сервер',
        'name': 'Название',
        'title': 'Название',
        'description': 'Описание',
        'price': 'Цена',
        'actions': 'Действия',
        'game': 'Игра',
        'short_description': 'Краткое описание',
        'full_description': 'Полное описание',
        'published_date': 'Дата публикации',
        'seller': 'Продавец',
        'contact_seller': 'Написать продавцу',

        // Кнопки
        'view_details': 'Подробнее',
        'edit': 'Редактировать',
        'delete': 'Удалить',
        'sell': 'Продать',
        'sell_accounts': 'Продать аккаунты',
        'sell_currency': 'Продать валюту',
        'sell_services': 'Продать услуги',
        'sell_other': 'Продать другое',
        'sold': 'Продано',

        // Мои объявления
        'my_listings_title': 'Мои объявления',
        'manage_listings': 'Управление вашими объявлениями',
        'no_my_listings': 'У вас пока нет объявлений',
        'create_first_listing': 'Создайте свое первое объявление',

        // Логин и регистрация
        'login_title': 'Вход',
        'login_subtitle': 'Войдите в свой аккаунт',
        'username': 'Имя пользователя',
        'password': 'Пароль',
        'enter_username': 'Введите имя пользователя',
        'enter_password': 'Введите пароль',
        'login_button': 'Войти',
        'or': 'или',
        'no_account': 'Нет аккаунта?',
        'register_link': 'Зарегистрироваться',
        'register_title': 'Регистрация',
        'register_subtitle': 'Создайте новый аккаунт',
        'email': 'Email',
        'enter_email': 'Введите email',
        'confirm_password': 'Подтвердите пароль',
        'enter_confirm_password': 'Введите пароль еще раз',
        'register_button': 'Зарегистрироваться',
        'have_account': 'Уже есть аккаунт?',
        'login_link': 'Войти',
        'username_hint': 'От 3 до 20 символов',
        'password_hint': 'Минимум 4 символа',
        'google_login': 'Войти через Google',
        'google_register': 'Зарегистрироваться через Google',

        // Создание объявления
        'create_listing_title': 'Создать объявление',
        'edit_listing_title': 'Редактировать объявление',
        'save': 'Сохранить',
        'cancel': 'Отмена',
        'select_game_label': 'Выберите игру',
        'select_game_placeholder': 'Выберите игру',
        'select_server': 'Выберите сервер',
        'select_server_placeholder': 'Выберите сервер',
        'select_category': 'Категория',
        'select_category_placeholder': 'Выберите категорию',
        'listing_title_label': 'Название объявления',
        'listing_title_placeholder': 'Например: Аккаунт 80 lvl с редкими предметами',
        'short_desc_label': 'Краткое описание',
        'short_desc_placeholder': 'Кратко опишите товар',
        'full_desc_label': 'Полное описание',
        'full_desc_placeholder': 'Подробное описание товара',
        'price_label': 'Цена (₽)',
        'price_placeholder': 'Введите цену',
        'create_button': 'Создать объявление',
        'cancel': 'Отмена',

        // Профиль продавца
        'seller_profile': 'Профиль продавца',
        'seller_listings': 'Объявления продавца',
        'contact': 'Связаться',
        'no_listings': 'Нет объявлений',

        // Сообщения и чат
        'messages': 'Сообщения',
        'send': 'Отправить',
        'write_message': 'Напишите сообщение...',
        'no_messages': 'Сообщений пока нет',
        'select_conversation': 'Выберите диалог',
        'select_conversation_text': 'Выберите диалог из списка слева',
        'error': 'Ошибка',
        'success': 'Успешно',
        'confirm_delete': 'Вы уверены, что хотите удалить это объявление?',
        'listing_deleted': 'Объявление удалено',
        'listing_sold': 'Объявление отмечено как проданное',
        'auth_required_title': 'Требуется авторизация',
        'auth_required_text': 'Чтобы создать объявление, нужно войти в аккаунт',
        'no_servers': 'Нет доступных серверов',
        'server_load_error': 'Ошибка загрузки серверов',
        'publishing': 'Публикуем...',
        'listing_created_success': 'Объявление успешно создано! Перенаправление...',
        'listing_create_error': 'Ошибка при создании объявления',
        'connection_error': 'Ошибка соединения с сервером',
        'back_link': 'Назад',
        'seller_id_missing': 'ID продавца не указан',
        'seller_not_found': 'Продавец не найден',
        'seller_not_found_text': 'Пользователь не существует',
        'loading_error': 'Ошибка загрузки',
        'profile_load_error': 'Не удалось загрузить данные профиля продавца',
        'seller_no_listings': 'У этого продавца пока нет объявлений',
        'member_since': 'На сайте с',
        'contact_feature_coming_soon': 'Функция отправки сообщения продавцу {username} будет добавлена позже',
        'listing_nominative_singular': 'объявление',
        'listing_genitive_singular': 'объявления',
        'listing_genitive_plural': 'объявлений',
        'listing_singular': 'anúncio',
        'listing_plural': 'anúncios',
    },
    'pt-br': {
        // Header
        'search_placeholder': 'Pesquisar jogos e anúncios...',
        'login': 'Entrar',
        'register': 'Registrar',
        'my_profile': 'Meu perfil',
        'my_listings': 'Meus anúncios',
        'my_messages': 'Minhas mensagens',
        'create_listing': 'Criar anúncio',
        'logout': 'Sair',
        'language': 'Idioma',
        'upload_avatar': 'Carregar avatar',
        'delete_avatar': 'Excluir avatar',
        'avatar_info': 'Formatos suportados: JPG, PNG, WEBP. Tamanho máximo: 5 MB. A imagem será cortada automaticamente em um quadrado.',

        // Página principal
        'games_catalog': 'Catálogo de jogos',
        'select_game': 'Selecione um jogo para ver os anúncios',
        'loading': 'Carregando',
        'loading_games': 'Carregando jogos',
        'active_listings': 'anúncios ativos',
        'categories': 'categorias',
        'category': 'Categoria',
        'all_categories': 'Todas as categorias',
        'cat_account': 'Contas',
        'cat_currency': 'Moeda',
        'cat_service': 'Serviços',
        'cat_other': 'Outros',

        // Página de anúncios
        'filters': 'Filtros',
        'sort_by': 'Ordenar por',
        'price_from': 'Preço de',
        'price_to': 'até',
        'apply': 'Aplicar',
        'reset': 'Redefinir',
        'back_to_catalog': 'Voltar ao catálogo',
        'back_to_listings': 'Voltar aos anúncios',
        'back_to_main': 'Voltar à página principal',
        'no_listings': 'Nenhum anúncio encontrado',
        'server': 'Servidor',
        'name': 'Nome',
        'title': 'Título',
        'description': 'Descrição',
        'price': 'Preço',
        'actions': 'Ações',
        'game': 'Jogo',
        'short_description': 'Descrição breve',
        'full_description': 'Descrição completa',
        'published_date': 'Data de publicação',
        'seller': 'Vendedor',
        'contact_seller': 'Mensagem ao vendedor',

        // Botões
        'view_details': 'Ver detalhes',
        'edit': 'Editar',
        'delete': 'Excluir',
        'sell': 'Vender',
        'sell_accounts': 'Vender contas',
        'sell_currency': 'Vender moeda',
        'sell_services': 'Vender serviços',
        'sell_other': 'Vender outros',
        'sold': 'Vendido',

        // Meus anúncios
        'my_listings_title': 'Meus anúncios',
        'manage_listings': 'Gerenciar seus anúncios',
        'no_my_listings': 'Você ainda não tem anúncios',
        'create_first_listing': 'Crie seu primeiro anúncio',

        // Login e registro
        'login_title': 'Entrar',
        'login_subtitle': 'Entre na sua conta',
        'username': 'Nome de usuário',
        'password': 'Senha',
        'enter_username': 'Digite o nome de usuário',
        'enter_password': 'Digite a senha',
        'login_button': 'Entrar',
        'or': 'ou',
        'no_account': 'Não tem conta?',
        'register_link': 'Registrar-se',
        'register_title': 'Registro',
        'register_subtitle': 'Crie uma nova conta',
        'email': 'Email',
        'enter_email': 'Digite o email',
        'confirm_password': 'Confirmar senha',
        'enter_confirm_password': 'Digite a senha novamente',
        'register_button': 'Registrar-se',
        'have_account': 'Já tem conta?',
        'login_link': 'Entrar',
        'username_hint': 'De 3 a 20 caracteres',
        'password_hint': 'Mínimo 4 caracteres',
        'google_login': 'Entrar com Google',
        'google_register': 'Registrar com Google',

        // Criar anúncio
        'create_listing_title': 'Criar anúncio',
        'edit_listing_title': 'Editar anúncio',
        'save': 'Salvar',
        'cancel': 'Cancelar',
        'select_game_label': 'Selecione o jogo',
        'select_game_placeholder': 'Selecione o jogo',
        'select_server': 'Selecione o servidor',
        'select_server_placeholder': 'Selecione o servidor',
        'select_category': 'Categoria',
        'select_category_placeholder': 'Selecione a categoria',
        'listing_title_label': 'Título do anúncio',
        'listing_title_placeholder': 'Por exemplo: Conta nível 80 com itens raros',
        'short_desc_label': 'Descrição breve',
        'short_desc_placeholder': 'Descreva brevemente o produto',
        'full_desc_label': 'Descrição completa',
        'full_desc_placeholder': 'Descrição detalhada do produto',
        'price_label': 'Preço (R$)',
        'price_placeholder': 'Digite o preço',
        'create_button': 'Criar anúncio',
        'cancel': 'Cancelar',

        // Perfil do vendedor
        'seller_profile': 'Perfil do vendedor',
        'seller_listings': 'Anúncios do vendedor',
        'contact': 'Contato',
        'no_listings': 'Sem anúncios',

        // Mensagens e chat
        'messages': 'Mensagens',
        'send': 'Enviar',
        'write_message': 'Escreva uma mensagem...',
        'no_messages': 'Ainda não há mensagens',
        'select_conversation': 'Selecione uma conversa',
        'select_conversation_text': 'Selecione uma conversa da lista à esquerda',
        'error': 'Erro',
        'success': 'Sucesso',
        'confirm_delete': 'Tem certeza de que deseja excluir este anúncio?',
        'listing_deleted': 'Anúncio excluído',
        'listing_sold': 'Anúncio marcado como vendido',
        'auth_required_title': 'Autenticação necessária',
        'auth_required_text': 'Para criar um anúncio, você precisa fazer login',
        'no_servers': 'Nenhum servidor disponível',
        'server_load_error': 'Erro ao carregar servidores',
        'publishing': 'Publicando...',
        'listing_created_success': 'Anúncio criado com sucesso! Redirecionando...',
        'listing_create_error': 'Erro ao criar anúncio',
        'connection_error': 'Erro de conexão com o servidor',
        'back_link': 'Voltar',
        'seller_id_missing': 'ID do vendedor não especificado',
        'seller_not_found': 'Vendedor não encontrado',
        'seller_not_found_text': 'Usuário não existe',
        'loading_error': 'Erro ao carregar',
        'profile_load_error': 'Não foi possível carregar os dados do perfil do vendedor',
        'seller_no_listings': 'Este vendedor ainda não tem anúncios',
        'member_since': 'Membro desde',
        'contact_feature_coming_soon': 'A função de enviar mensagem ao vendedor {username} será adicionada em breve',
        'listing_nominative_singular': 'anúncio',
        'listing_genitive_singular': 'anúncios',
        'listing_genitive_plural': 'anúncios',
        'listing_singular': 'anúncio',
        'listing_plural': 'anúncios',
    }
};

// Получить текущий язык
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'ru';
}

// Установить язык
function setLanguage(lang) {
    if (!translations[lang]) {
        console.error('Language not supported:', lang);
        return;
    }

    localStorage.setItem('language', lang);

    // Обновляем все элементы с data-i18n атрибутом
    updateTranslations();

    // Обновляем плейсхолдеры
    updatePlaceholders();

    // Обновляем язык в HTML теге
    document.documentElement.lang = lang === 'pt-br' ? 'pt-BR' : lang;
}

// Изменить язык (вызывается из UI)
function changeLanguage(lang) {
    if (!translations[lang]) {
        console.error('Language not supported:', lang);
        return;
    }

    // Сохраняем язык
    localStorage.setItem('language', lang);

    // Обновляем язык в HTML теге
    document.documentElement.lang = lang === 'pt-br' ? 'pt-BR' : lang;

    // Обновляем все переводы
    updateTranslations();
    updatePlaceholders();

    // Обновляем кнопку языка
    updateLanguageButton(lang);

    // Вызываем callback если определен (для обновления динамического контента)
    if (typeof window.onLanguageChange === 'function') {
        window.onLanguageChange(lang);
    }

    // Закрываем dropdown
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }
}

// Обновить кнопку языка
function updateLanguageButton(lang) {
    const button = document.querySelector('.language-button');
    if (button) {
        button.textContent = lang === 'ru' ? '🇷🇺' : '🇧🇷';
    }

    // Обновить активный пункт в dropdown
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
    });

    const activeOption = document.querySelector(`.language-option[onclick*="${lang}"]`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
}

// Получить перевод по ключу
function t(key) {
    const lang = getCurrentLanguage();
    return translations[lang]?.[key] || translations['ru'][key] || key;
}

// Обновить все переводы на странице
function updateTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
}

// Обновить все плейсхолдеры
function updatePlaceholders() {
    const elements = document.querySelectorAll('[data-i18n-placeholder]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
}

// Инициализация i18n при загрузке страницы
function initI18n() {
    const lang = getCurrentLanguage();
    document.documentElement.lang = lang === 'pt-br' ? 'pt-BR' : lang;

    // Обновляем все переводы
    updateTranslations();
    updatePlaceholders();
}

// Запускаем инициализацию при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}
