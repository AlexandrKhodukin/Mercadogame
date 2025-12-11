import sys
import os

# Путь к виртуальному окружению (настройте на сервере)
INTERP = os.path.join(os.environ['HOME'], 'virtualenv', 'mysite', '3.9', 'bin', 'python3')
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

# Добавляем путь к проекту
sys.path.append(os.getcwd())

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
