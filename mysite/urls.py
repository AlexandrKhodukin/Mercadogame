from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from listings.views import IndexView, frontend_view

# Backend маршруты (должны быть ПЕРВЫМИ, чтобы не перехватывались catch-all)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('listings.urls')),
    path('accounts/', include('allauth.urls')),
]

# Обслуживание статических и медиа файлов
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    # В продакшене тоже нужно обслуживать media файлы через Django
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Фронтенд маршруты (должны быть ПОСЛЕДНИМИ)
urlpatterns += [
    path('', frontend_view, name='index'),
    # Catch-all для фронтенда (любые страницы вроде /listings, /profile и т.д.)
    # НЕ перехватывает admin/, api/, accounts/ т.к. они обрабатываются выше
    path('<path:path>', frontend_view, name='frontend'),
]
