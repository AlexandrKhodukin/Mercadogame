from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from rest_framework.authtoken.models import Token
from django.shortcuts import redirect
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """Кастомный адаптер для обработки аккаунтов"""

    def get_login_redirect_url(self, request):
        """Редирект после успешного входа"""
        # Если пользователь авторизован, создаем токен
        if request.user.is_authenticated:
            token, created = Token.objects.get_or_create(user=request.user)
            # Перенаправляем на фронтенд с токеном
            return f'/?token={token.key}&user_id={request.user.id}'
        return super().get_login_redirect_url(request)


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Кастомный адаптер для OAuth провайдеров"""

    def get_login_redirect_url(self, request):
        """Редирект после успешной OAuth авторизации"""
        if request.user.is_authenticated:
            # Создаем или получаем токен для пользователя
            token, created = Token.objects.get_or_create(user=request.user)
            # Перенаправляем на главную страницу с токеном и данными пользователя
            return f'/?token={token.key}&user_id={request.user.id}&username={request.user.username}'
        return '/'

    def pre_social_login(self, request, sociallogin):
        """Вызывается перед входом через соцсеть"""
        pass
