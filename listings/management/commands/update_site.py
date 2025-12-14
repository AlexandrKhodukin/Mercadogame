from django.core.management.base import BaseCommand
from django.contrib.sites.models import Site


class Command(BaseCommand):
    help = 'Обновление информации о сайте'

    def handle(self, *args, **options):
        site = Site.objects.get_current()
        site.domain = 'mercadogame.ru'
        site.name = 'MercadoGame'
        site.save()

        self.stdout.write(self.style.SUCCESS(f'[OK] Сайт обновлен: {site.domain}'))
