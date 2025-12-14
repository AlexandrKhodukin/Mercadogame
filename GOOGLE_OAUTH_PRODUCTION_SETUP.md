# Настройка Google OAuth для продакшена

## 1. Настройка Authorized Redirect URIs в Google Cloud Console

Перейдите в Google Cloud Console и добавьте следующие Authorized Redirect URIs:

### Для продакшена:
```
https://mercadogame.ru/accounts/google/login/callback/
http://mercadogame.ru/accounts/google/login/callback/
https://www.mercadogame.ru/accounts/google/login/callback/
http://www.mercadogame.ru/accounts/google/login/callback/
```

### Для локальной разработки:
```
http://localhost:8000/accounts/google/login/callback/
http://127.0.0.1:8000/accounts/google/login/callback/
```

## 2. Настройка переменных окружения на сервере

На вашем продакшн сервере создайте файл `.env` в корне проекта:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=ваш_google_client_id_здесь
GOOGLE_CLIENT_SECRET=ваш_google_client_secret_здесь

# Django Settings
DJANGO_DEBUG=False
SECRET_KEY=ваш_секретный_ключ_для_продакшена

# Database Settings
DB_NAME=mercadogame_db
DB_USER=mercadogame_user
DB_PASSWORD=ваш_пароль_базы_данных
DB_HOST=localhost
DB_PORT=5432
```

## 3. Запуск команд на сервере

После деплоя выполните следующие команды:

```bash
# Активируйте виртуальное окружение
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate     # Windows

# Примените миграции
python manage.py migrate

# Обновите информацию о сайте
python manage.py update_site

# Настройте Google OAuth
python manage.py setup_google_oauth

# Соберите статические файлы
python manage.py collectstatic --noinput
```

## 4. Проверка настроек

Проверьте, что в Google Cloud Console:
- ✅ Client ID и Client Secret корректны
- ✅ Authorized Redirect URIs добавлены
- ✅ OAuth consent screen настроен
- ✅ API Google+ включен (или People API)

## 5. Тестирование

1. Перейдите на https://mercadogame.ru
2. Нажмите "Войти"
3. Нажмите "Войти через Google"
4. Выберите аккаунт Google
5. Разрешите доступ к профилю и email
6. Вы должны быть перенаправлены обратно на сайт как авторизованный пользователь

## 6. Возможные проблемы

### Проблема: "redirect_uri_mismatch"
**Решение:** Убедитесь, что redirect URI в Google Cloud Console точно совпадает с тем, который использует ваш сайт (включая http/https и слэш в конце).

### Проблема: "invalid_client"
**Решение:** Проверьте, что GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в .env файле совпадают с данными из Google Cloud Console.

### Проблема: Токен не сохраняется на фронтенде
**Решение:** Проверьте консоль браузера на наличие ошибок. Убедитесь, что JavaScript файлы загружаются корректно.

## 7. Безопасность

⚠️ **ВАЖНО:**
- Никогда не коммитьте .env файл в git
- Используйте HTTPS на продакшене
- Регулярно обновляйте CLIENT_SECRET
- Ограничьте список authorized domains в Google Cloud Console

## 8. Дополнительные настройки

### OAuth Consent Screen
В Google Cloud Console настройте:
- **App name:** MercadoGame
- **User support email:** ваш email
- **Developer contact email:** ваш email
- **Authorized domains:** mercadogame.ru
- **Scopes:** email, profile

### Verification (опционально)
Для production приложения рекомендуется пройти верификацию в Google, если вы планируете больше 100 пользователей.
