# Быстрый старт: Google OAuth

## 🚀 Что уже сделано

✅ Бэкенд настроен (`django-allauth` + Google provider)
✅ Фронтенд обновлен (кнопки "Войти через Google")
✅ Миграции базы данных выполнены
✅ Стили для кнопок добавлены
✅ Локализация обновлена (RU + PT-BR)

## 📝 Что нужно сделать

### 1. Получить Google OAuth credentials (5-10 минут)

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект "MercadoGame"
3. Включите Google+ API
4. Создайте OAuth 2.0 Client ID:
   - **Redirect URIs:**
     ```
     http://localhost:8000/accounts/google/login/callback/
     http://127.0.0.1:8000/accounts/google/login/callback/
     ```
5. Скопируйте **Client ID** и **Client Secret**

📖 **Подробная инструкция:** `GOOGLE_OAUTH_SETUP.md`

### 2. Создать файл .env

```bash
# В корневой папке Mercadogame создайте файл .env
cp .env.example .env
```

Отредактируйте `.env` и добавьте ваши credentials:

```env
GOOGLE_CLIENT_ID=ваш-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-ваш-secret
```

### 3. Создать суперпользователя

```bash
cd Mercadogame
venv/Scripts/python.exe manage.py createsuperuser
```

### 4. Настроить Django Admin

```bash
# Запустите сервер
venv/Scripts/python.exe manage.py runserver
```

1. Откройте: http://127.0.0.1:8000/admin/
2. **Sites** → Измените `example.com` на `localhost:8000`
3. **Social applications** → **Add**:
   - Provider: `Google`
   - Name: `Google OAuth`
   - Client id: ваш Client ID
   - Secret key: ваш Client Secret
   - Sites: Выберите `localhost:8000`
   - Save

### 5. Протестировать

1. Откройте: http://127.0.0.1:8000/login.html
2. Нажмите **"Войти через Google"**
3. Выберите Google аккаунт
4. Готово!

## 🔧 Структура изменений

### Файлы изменены:
- `frontend/css/auth.css` - стили для кнопки Google
- `frontend/login.html` - добавлена кнопка Google
- `frontend/register.html` - добавлена кнопка Google
- `frontend/js/i18n.js` - переводы для кнопок

### Файлы созданы:
- `GOOGLE_OAUTH_SETUP.md` - подробная инструкция
- `.env.example` - пример переменных окружения
- `QUICK_START_OAUTH.md` - этот файл

### Настройки (уже настроены в settings.py):
```python
INSTALLED_APPS = [
    ...
    'allauth.socialaccount.providers.google',  # ✅
]

SOCIALACCOUNT_PROVIDERS = {
    'google': {  # ✅
        'SCOPE': ['profile', 'email'],
        ...
    }
}
```

## ❓ Проблемы?

### "Redirect URI mismatch"
→ Проверьте, что redirect URI в Google Console точно совпадает:
```
http://127.0.0.1:8000/accounts/google/login/callback/
```

### "Social application not found"
→ Убедитесь, что создали Social Application в Django Admin

### "Client ID not in environment"
→ Проверьте файл `.env` и перезапустите сервер

## 📚 Полная документация

См. файл: **`GOOGLE_OAUTH_SETUP.md`**

---

**Вопросы?** Откройте issue на GitHub
