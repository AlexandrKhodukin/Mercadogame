# 🚀 Инструкция по деплою Google OAuth на продакшен

## Шаг 1: Получение Google OAuth Credentials для продакшена

### 1.1. Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект или создайте новый
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите ваш OAuth 2.0 Client ID или создайте новый

### 1.2. Добавьте Production URLs

В настройках OAuth 2.0 Client добавьте:

**Authorized JavaScript origins:**
```
https://mercadogame.ru
https://www.mercadogame.ru
```

**Authorized redirect URIs:**
```
https://mercadogame.ru/accounts/google/login/callback/
https://www.mercadogame.ru/accounts/google/login/callback/
```

⚠️ **ВАЖНО:** Используйте HTTPS, а не HTTP!

---

## Шаг 2: Настройка переменных окружения на сервере

### 2.1. Подключитесь к серверу

```bash
ssh your_user@193.42.125.186
# или
ssh your_user@mercadogame.ru
```

### 2.2. Перейдите в директорию проекта

```bash
cd /path/to/Mercadogame
# Например: cd /var/www/mercadogame или ~/Mercadogame
```

### 2.3. Обновите код с GitHub

```bash
git pull origin main
```

### 2.4. Создайте/обновите .env файл

```bash
nano .env
```

Добавьте следующие строки:

```env
# Django Settings
SECRET_KEY=your_production_secret_key_here_very_long_and_secure
DJANGO_DEBUG=False

# Google OAuth Credentials
GOOGLE_CLIENT_ID=ваш_production_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-ваш_production_secret

# Database (если используете PostgreSQL)
DB_NAME=mercadogame_db
DB_USER=mercadogame_user
DB_PASSWORD=ваш_secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=https://mercadogame.ru,https://www.mercadogame.ru
```

Сохраните файл: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Шаг 3: Обновление Django

### 3.1. Активируйте виртуальное окружение

```bash
source venv/bin/activate
# или
source .venv/bin/activate
```

### 3.2. Установите/обновите зависимости

```bash
pip install -r requirements.txt
```

### 3.3. Выполните миграции

```bash
python manage.py migrate
```

### 3.4. Соберите статические файлы

```bash
python manage.py collectstatic --noinput
```

---

## Шаг 4: Настройка Django Admin

### 4.1. Создайте суперпользователя (если еще не создан)

```bash
python manage.py createsuperuser
```

### 4.2. Откройте Django Admin

Перейдите на: `https://mercadogame.ru/admin/`

Войдите с credentials суперпользователя

### 4.3. Настройте Sites

1. Перейдите в **Sites**
2. Кликните на существующий site (обычно "example.com")
3. Измените:
   - **Domain name:** `mercadogame.ru`
   - **Display name:** `MercadoGame`
4. Нажмите **Save**

### 4.4. Создайте Social Application

1. Перейдите в **Social applications**
2. Нажмите **Add social application**
3. Заполните форму:
   - **Provider:** `Google`
   - **Name:** `Google OAuth Production`
   - **Client id:** ваш production Client ID из Google Console
   - **Secret key:** ваш production Client Secret
   - **Sites:** Переместите `mercadogame.ru` из "Available sites" в "Chosen sites"
4. Нажмите **Save**

---

## Шаг 5: Перезапуск сервера

### Если используете Gunicorn + systemd:

```bash
sudo systemctl restart mercadogame
# или
sudo systemctl restart gunicorn
```

### Если используете uWSGI:

```bash
sudo systemctl restart uwsgi
# или
sudo touch /path/to/mercadogame.ini
```

### Если используете Apache/Passenger:

```bash
touch tmp/restart.txt
# или
sudo systemctl restart apache2
```

### Проверьте статус:

```bash
sudo systemctl status mercadogame
# или
sudo systemctl status gunicorn
# или
sudo systemctl status uwsgi
```

---

## Шаг 6: Проверка Nginx конфигурации (если используется)

### 6.1. Проверьте конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/mercadogame
```

Убедитесь, что настроен SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name mercadogame.ru www.mercadogame.ru;

    ssl_certificate /etc/letsencrypt/live/mercadogame.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mercadogame.ru/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /path/to/Mercadogame/staticfiles/;
    }

    location /media/ {
        alias /path/to/Mercadogame/media/;
    }
}

# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name mercadogame.ru www.mercadogame.ru;
    return 301 https://$server_name$request_uri;
}
```

### 6.2. Проверьте конфигурацию и перезапустите Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Шаг 7: Тестирование

### 7.1. Откройте сайт

Перейдите на: `https://mercadogame.ru/login.html`

### 7.2. Протестируйте Google OAuth

1. Нажмите кнопку **"Войти через Google"**
2. Вы должны быть перенаправлены на страницу авторизации Google
3. Выберите аккаунт
4. Разрешите доступ
5. Вы должны быть перенаправлены обратно на mercadogame.ru с авторизацией

### 7.3. Проверьте в Django Admin

1. Откройте: `https://mercadogame.ru/admin/`
2. Проверьте **Social accounts** - должна появиться новая запись
3. Проверьте **Users** - пользователь создан с email из Google

---

## 🐛 Решение проблем

### Проблема: "redirect_uri_mismatch"

**Решение:**
1. Проверьте в Google Cloud Console redirect URI:
   ```
   https://mercadogame.ru/accounts/google/login/callback/
   ```
2. Убедитесь, что используется HTTPS
3. Проверьте, что домен в Sites (Django Admin) правильный: `mercadogame.ru`

### Проблема: "Mixed Content" ошибки

**Решение:**
1. Убедитесь, что в .env установлено `DJANGO_DEBUG=False`
2. Проверьте, что все ссылки используют HTTPS
3. Добавьте в settings.py:
   ```python
   SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
   SECURE_SSL_REDIRECT = True
   ```

### Проблема: Static files не загружаются

**Решение:**
```bash
python manage.py collectstatic --noinput
sudo systemctl restart nginx
```

### Проблема: "Social application matching query does not exist"

**Решение:**
1. Проверьте, что создали Social Application в Django Admin
2. Убедитесь, что сайт `mercadogame.ru` добавлен в "Chosen sites"
3. Перезапустите сервер

---

## 📋 Чеклист финальной проверки

- [ ] Google OAuth credentials получены для production
- [ ] Redirect URIs добавлены в Google Cloud Console (HTTPS!)
- [ ] .env файл создан на сервере с правильными credentials
- [ ] Код обновлен с GitHub (`git pull`)
- [ ] Миграции выполнены (`python manage.py migrate`)
- [ ] Static files собраны (`python manage.py collectstatic`)
- [ ] Site настроен в Django Admin (`mercadogame.ru`)
- [ ] Social Application создан в Django Admin
- [ ] Сервер перезапущен (Gunicorn/uWSGI/Apache)
- [ ] Nginx настроен и перезапущен
- [ ] SSL сертификат установлен и работает
- [ ] Тестирование: вход через Google работает
- [ ] Проверено: пользователь создается в базе данных
- [ ] Логи сервера проверены на ошибки

---

## 🔒 Безопасность

### Обязательные настройки для продакшена:

1. **В .env:**
   ```env
   DJANGO_DEBUG=False
   SECRET_KEY=длинный_случайный_ключ_минимум_50_символов
   ```

2. **SSL/HTTPS:**
   - Убедитесь, что Let's Encrypt сертификат установлен
   - Настроен автоматический редирект с HTTP на HTTPS

3. **Файл .env:**
   ```bash
   # Установите правильные права доступа
   chmod 600 .env
   chown www-data:www-data .env
   ```

4. **.gitignore:**
   Убедитесь, что .env в .gitignore (уже должен быть)

---

## 📊 Мониторинг

### Проверка логов:

```bash
# Django логи
tail -f /var/log/mercadogame/error.log

# Nginx логи
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Systemd логи
journalctl -u mercadogame -f
journalctl -u nginx -f
```

---

## 🎉 Готово!

После выполнения всех шагов пользователи смогут входить на https://mercadogame.ru через свои Google аккаунты!

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Проверьте Django Admin → Social applications
3. Проверьте Google Cloud Console → Credentials
4. Убедитесь, что все URL используют HTTPS

---

**Примерное время деплоя:** 15-20 минут
**Последнее обновление:** 2025-12-13
