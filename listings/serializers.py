from rest_framework import serializers
from .models import Game, Listing, Server, Conversation, Message, Profile
from django.contrib.auth.models import User


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'name', 'description']


class ServerSerializer(serializers.ModelSerializer):
    game_name = serializers.CharField(source='game.name', read_only=True)

    class Meta:
        model = Server
        fields = ['id', 'game', 'game_name', 'name', 'number']


class ListingSerializer(serializers.ModelSerializer):
    game_name = serializers.CharField(source='game.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    seller_avatar = serializers.SerializerMethodField()
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    server_name = serializers.CharField(source='server.name', read_only=True, allow_null=True)
    server_number = serializers.IntegerField(source='server.number', read_only=True, allow_null=True)

    class Meta:
        model = Listing
        fields = ['id', 'game', 'game_name', 'seller', 'seller_name', 'seller_avatar',
                  'category', 'category_display', 'server', 'server_name', 'server_number', 'title', 'description',
                  'price', 'created_at', 'updated_at']
        read_only_fields = ['seller', 'created_at', 'updated_at']

    def get_seller_avatar(self, obj):
        """Получает URL аватара продавца"""
        try:
            if obj.seller.profile and obj.seller.profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.seller.profile.avatar.url)
                return obj.seller.profile.avatar.url
        except Profile.DoesNotExist:
            pass
        return None

    def validate_price(self, value):
        """Валидация цены на уровне API"""
        if value < 0.01:
            raise serializers.ValidationError("Цена должна быть не менее 0.01")
        if value > 999999.99:
            raise serializers.ValidationError("Цена должна быть не более 999999.99")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    """Сериализатор для профиля пользователя"""
    class Meta:
        model = Profile
        fields = ['avatar', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined', 'avatar']

    def get_avatar(self, obj):
        """Получает URL аватара пользователя"""
        try:
            if obj.profile and obj.profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.profile.avatar.url)
                return obj.profile.avatar.url
        except Profile.DoesNotExist:
            pass
        return None


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    username = serializers.CharField(min_length=3, max_length=20)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Имя пользователя должно содержать минимум 3 символа")
        if len(value) > 20:
            raise serializers.ValidationError("Имя пользователя должно содержать максимум 20 символов")

        # Проверка уникальности username
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Пользователь с таким именем уже существует")

        return value

    def validate_email(self, value):
        """Валидация email на уровне API"""
        if not value:
            raise serializers.ValidationError("Email обязателен для заполнения")

        # Приводим email к нижнему регистру для единообразия
        normalized_email = value.lower()

        # Проверка формата email (Django EmailField уже делает базовую проверку)
        # Дополнительная проверка на уникальность (с учетом регистра)
        if User.objects.filter(email__iexact=normalized_email).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")

        return normalized_email

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Создаем профиль для нового пользователя
        Profile.objects.create(user=user)
        return user

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'text', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    listing_title = serializers.CharField(source='listing.title', read_only=True)
    listing_price = serializers.DecimalField(source='listing.price', max_digits=8, decimal_places=2, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'listing', 'listing_title', 'listing_price', 'buyer', 'buyer_name', 
                  'seller', 'seller_name', 'created_at', 'updated_at', 'last_message', 'unread_count']
        read_only_fields = ['buyer', 'seller', 'created_at', 'updated_at']
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'text': last_msg.text,
                'sender': last_msg.sender.username,
                'created_at': last_msg.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class ConversationDetailSerializer(ConversationSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ['messages']
