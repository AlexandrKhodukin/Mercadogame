import os
from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp


class Command(BaseCommand):
    help = 'Настройка Google OAuth приложения'

    def handle(self, *args, **options):
        # Получаем credentials из переменных окружения
        client_id = os.environ.get('GOOGLE_CLIENT_ID')
        client_secret = os.environ.get('GOOGLE_CLIENT_SECRET')

        if not client_id or not client_secret:
            self.stdout.write(self.style.ERROR(
                'Ошибка: GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET должны быть установлены в .env файле'
            ))
            return

        # Получаем или создаем Site
        site = Site.objects.get_current()

        # Проверяем, существует ли уже Google приложение
        google_app, created = SocialApp.objects.get_or_create(
            provider='google',
            defaults={
                'name': 'Google',
                'client_id': client_id,
                'secret': client_secret,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS('[OK] Google OAuth приложение создано'))
        else:
            # Обновляем существующее приложение
            google_app.client_id = client_id
            google_app.secret = client_secret
            google_app.save()
            self.stdout.write(self.style.SUCCESS('[OK] Google OAuth приложение обновлено'))

        # Добавляем сайт к приложению
        if site not in google_app.sites.all():
            google_app.sites.add(site)
            self.stdout.write(self.style.SUCCESS(f'[OK] Сайт {site.domain} добавлен к Google приложению'))

        self.stdout.write(self.style.SUCCESS('\n=== Google OAuth успешно настроен! ==='))
        self.stdout.write(f'Client ID: {client_id}')
        self.stdout.write(f'Сайт: {site.domain}')
        self.stdout.write('\nТеперь добавьте authorized redirect URIs в Google Cloud Console:')
        self.stdout.write(f'  - http://{site.domain}/accounts/google/login/callback/')
        self.stdout.write(f'  - http://localhost:8000/accounts/google/login/callback/')
        if site.domain != 'example.com':
            self.stdout.write(f'  - https://{site.domain}/accounts/google/login/callback/')
