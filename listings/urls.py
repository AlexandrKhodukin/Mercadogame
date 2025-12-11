"""
Рефакторинг URLs для использования с ViewSets
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GameViewSet,
    ListingViewSet,
    ServerViewSet,
    ConversationViewSet,
    MessageViewSet,
    ProfileViewSet,
    register,
    login,
    seller_profile
)

# Создаем router для ViewSets
router = DefaultRouter()
router.register(r'games', GameViewSet, basename='game')
router.register(r'listings', ListingViewSet, basename='listing')
router.register(r'servers', ServerViewSet, basename='server')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    # ViewSet URLs через router
    path('', include(router.urls)),

    # Аутентификация
    path('register/', register, name='register'),
    path('login/', login, name='login'),

    # Профиль продавца
    path('seller/<int:user_id>/', seller_profile, name='seller-profile'),
]

# Доступные endpoints:
# GET    /api/games/                           - список игр
# GET    /api/games/{id}/                      - детали игры
# GET    /api/games/{id}/servers/              - серверы игры
# GET    /api/servers/                         - список серверов (с фильтром ?game=id)
# GET    /api/listings/                        - все объявления (с фильтрами ?game=id&category=X&seller=id)
# GET    /api/listings/{id}/                   - детали объявления
# POST   /api/listings/                        - создать объявление (требует auth)
# PUT    /api/listings/{id}/                   - обновить объявление (требует auth)
# DELETE /api/listings/{id}/                   - удалить объявление (требует auth)
# GET    /api/listings/my_listings/            - мои объявления (требует auth)
# POST   /api/register/                        - регистрация
# POST   /api/login/                           - вход
# GET    /api/seller/{user_id}/                - профиль продавца
# GET    /api/conversations/                   - мои диалоги (требует auth)
# GET    /api/conversations/{id}/              - детали диалога с сообщениями (требует auth)
# POST   /api/conversations/start_conversation/ - начать диалог (требует auth)
# POST   /api/conversations/{id}/mark_as_read/  - отметить сообщения как прочитанные (требует auth)
# GET    /api/messages/                        - мои сообщения (требует auth)
# POST   /api/messages/                        - отправить сообщение (требует auth)
