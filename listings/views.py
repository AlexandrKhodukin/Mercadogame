"""
Рефакторинг views.py с улучшениями:
- Использование ViewSets вместо функциональных views
- Proper error handling
- Более чистая структура кода
"""
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import authenticate
from django.db import models
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Game, Listing, Server, Conversation, Message, Profile
from django.views.generic import TemplateView
from .serializers import (
    GameSerializer,
    ListingSerializer,
    UserSerializer,
    RegisterSerializer,
    ServerSerializer,
    ConversationSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
    ProfileSerializer
)


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для игр (только чтение)"""
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'])
    def servers(self, request, pk=None):
        """Получить серверы для конкретной игры"""
        game = self.get_object()
        servers = Server.objects.filter(game=game)
        serializer = ServerSerializer(servers, many=True)
        return Response(serializer.data)


class ListingViewSet(viewsets.ModelViewSet):
    """ViewSet для объявлений"""
    queryset = Listing.objects.select_related('game', 'seller', 'seller__profile', 'server').all()
    serializer_class = ListingSerializer

    def get_permissions(self):
        """Разрешения в зависимости от действия"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        """Фильтрация объявлений с оптимизацией запросов"""
        queryset = Listing.objects.select_related(
            'game', 'seller', 'seller__profile', 'server'
        ).all()

        # Фильтр по игре
        game_id = self.request.query_params.get('game', None)
        if game_id:
            queryset = queryset.filter(game_id=game_id)

        # Фильтр по продавцу
        seller_id = self.request.query_params.get('seller', None)
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)

        # Фильтр по категории
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)

        return queryset

    def perform_create(self, serializer):
        """Автоматически устанавливаем текущего пользователя как продавца"""
        serializer.save(seller=self.request.user)

    def perform_update(self, serializer):
        """Проверка прав перед обновлением"""
        from rest_framework.exceptions import PermissionDenied
        if serializer.instance.seller != self.request.user:
            raise PermissionDenied("Вы не можете редактировать чужое объявление")
        serializer.save()

    def perform_destroy(self, instance):
        """Проверка прав перед удалением"""
        from rest_framework.exceptions import PermissionDenied
        if instance.seller != self.request.user:
            raise PermissionDenied("Вы не можете удалить чужое объявление")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """Получить объявления текущего пользователя"""
        listings = Listing.objects.filter(seller=request.user)
        serializer = self.get_serializer(listings, many=True)
        return Response(serializer.data)


class ServerViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet для серверов (только чтение)"""
    queryset = Server.objects.all()
    serializer_class = ServerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Фильтрация серверов по игре"""
        queryset = Server.objects.all()
        game_id = self.request.query_params.get('game', None)
        if game_id:
            queryset = queryset.filter(game_id=game_id)
        return queryset


# Аутентификация остается на функциональных views
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Регистрация нового пользователя"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Вход пользователя"""
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Необходимо указать имя пользователя и пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })

    return Response(
        {'error': 'Неверный логин или пароль'},
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def seller_profile(request, user_id):
    """Профиль продавца с его объявлениями"""
    user = get_object_or_404(User.objects.select_related('profile'), id=user_id)
    listings = Listing.objects.filter(seller=user).select_related('game', 'server')

    return Response({
        'user': UserSerializer(user, context={'request': request}).data,
        'listings': ListingSerializer(listings, many=True, context={'request': request}).data,
        'listings_count': listings.count()
    })


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet для диалогов"""
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Получаем только диалоги текущего пользователя"""
        user = self.request.user
        return Conversation.objects.filter(
            models.Q(buyer=user) | models.Q(seller=user)
        ).select_related('listing', 'buyer', 'seller').prefetch_related('messages')

    def get_serializer_class(self):
        """Для детального просмотра используем другой serializer"""
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer

    @action(detail=False, methods=['post'])
    def start_conversation(self, request):
        """Начать диалог по объявлению"""
        listing_id = request.data.get('listing_id')
        
        if not listing_id:
            return Response(
                {'error': 'listing_id обязателен'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        listing = get_object_or_404(Listing, id=listing_id)
        
        # Нельзя начать диалог с самим собой
        if listing.seller == request.user:
            return Response(
                {'error': 'Вы не можете начать диалог со своим объявлением'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Проверяем, существует ли уже диалог
        conversation, created = Conversation.objects.get_or_create(
            listing=listing,
            buyer=request.user,
            seller=listing.seller
        )
        
        serializer = ConversationDetailSerializer(conversation, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Отметить все сообщения в диалоге как прочитанные"""
        conversation = self.get_object()
        
        # Отмечаем как прочитанные только чужие сообщения
        conversation.messages.exclude(sender=request.user).update(is_read=True)
        
        return Response({'status': 'Сообщения отмечены как прочитанные'})


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet для сообщений"""
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Получаем только сообщения из диалогов пользователя"""
        user = self.request.user
        return Message.objects.filter(
            models.Q(conversation__buyer=user) | models.Q(conversation__seller=user)
        ).select_related('sender', 'conversation')

    def perform_create(self, serializer):
        """Автоматически устанавливаем отправителя"""
        from rest_framework.exceptions import PermissionDenied
        conversation_id = self.request.data.get('conversation')
        conversation = get_object_or_404(Conversation, id=conversation_id)

        # Проверяем, что пользователь участник диалога
        if conversation.buyer != self.request.user and conversation.seller != self.request.user:
            raise PermissionDenied("Вы не участник этого диалога")

        serializer.save(sender=self.request.user)


class ProfileViewSet(viewsets.ModelViewSet):
    """ViewSet для профилей пользователей"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Получает профиль текущего пользователя"""
        profile, created = Profile.objects.get_or_create(user=self.request.user)
        return profile

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_avatar(self, request):
        """Загрузка аватара"""
        print(f"DEBUG: Upload avatar called, FILES: {request.FILES}")
        print(f"DEBUG: User: {request.user}")

        profile, created = Profile.objects.get_or_create(user=request.user)
        print(f"DEBUG: Profile created: {created}, Profile: {profile}")

        if 'avatar' not in request.FILES:
            print("DEBUG: No avatar in FILES")
            return Response(
                {'error': 'Файл аватара не предоставлен'},
                status=status.HTTP_400_BAD_REQUEST
            )

        avatar_file = request.FILES['avatar']

        # Проверка размера файла (5 МБ)
        if avatar_file.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'Размер файла превышает 5 МБ'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверка расширения
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = avatar_file.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            return Response(
                {'error': f'Разрешены только форматы: {", ".join(allowed_extensions)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Удаляем старый аватар если есть
        if profile.avatar:
            profile.delete_avatar()

        # Сохраняем новый аватар
        profile.avatar = avatar_file
        profile.save()
        print(f"DEBUG: Avatar saved: {profile.avatar.url}")

        # Возвращаем обновленные данные пользователя
        user_serializer = UserSerializer(request.user, context={'request': request})
        print(f"DEBUG: Serialized data: {user_serializer.data}")
        return Response(user_serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'])
    def delete_avatar(self, request):
        """Удаление аватара"""
        try:
            profile = Profile.objects.get(user=request.user)
            profile.delete_avatar()

            user_serializer = UserSerializer(request.user, context={'request': request})
            return Response(user_serializer.data, status=status.HTTP_200_OK)
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Профиль не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


class IndexView(TemplateView):
    """Подача index.html"""
    template_name = 'index.html'
    content_type = 'text/html'


from django.http import FileResponse
import os
from django.conf import settings

def frontend_view(request, path=''):
    if not path:
        path = 'index.html'
    
    file_path = os.path.join(settings.BASE_DIR, 'frontend', path)
    
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(open(file_path, 'rb'))
    
    index_path = os.path.join(settings.BASE_DIR, 'frontend', 'index.html')
    return FileResponse(open(index_path, 'rb'))
