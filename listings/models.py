from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.core.files.base import ContentFile
from PIL import Image
import io
import os
import time


class Game(models.Model):
    name = models.CharField(max_length=200, verbose_name='Название', db_index=True)
    description = models.TextField(blank=True, null=True, verbose_name='Описание')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Игра'
        verbose_name_plural = 'Игры'
        indexes = [
            models.Index(fields=['name'], name='game_name_idx'),
        ]


class Server(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='servers', verbose_name='Игра')
    name = models.CharField(max_length=100, verbose_name='Название сервера', help_text='Например: BR SERVER #1')
    number = models.IntegerField(verbose_name='Номер сервера', help_text='Уникальный номер для каждой игры')

    def __str__(self):
        return f"{self.game.name} - {self.name}"

    class Meta:
        verbose_name = 'Сервер'
        verbose_name_plural = 'Серверы'
        unique_together = ['game', 'number']
        ordering = ['game', 'number']


class Listing(models.Model):
    CATEGORY_CHOICES = [
        ('account', 'Аккаунт'),
        ('currency', 'Валюта'),
        ('service', 'Услуга'),
        ('other', 'Другое'),
    ]

    game = models.ForeignKey(Game, on_delete=models.CASCADE, verbose_name='Игра')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Продавец')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='account', verbose_name='Категория')
    server = models.ForeignKey(
        Server,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name='Сервер',
        help_text='Сервер игры'
    )
    title = models.CharField(max_length=200, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        verbose_name='Цена',
        validators=[MinValueValidator(0.01), MaxValueValidator(999999.99)],
        help_text='Цена должна быть от 0.01 до 999999.99'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Объявление'
        verbose_name_plural = 'Объявления'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at'], name='listing_created_idx'),
            models.Index(fields=['game', 'category'], name='listing_game_cat_idx'),
            models.Index(fields=['seller'], name='listing_seller_idx'),
        ]


class Conversation(models.Model):
    """Диалог между двумя пользователями по конкретному объявлению"""
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, verbose_name='Объявление', related_name='conversations')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Покупатель', related_name='buyer_conversations')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Продавец', related_name='seller_conversations')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Последнее обновление')

    def __str__(self):
        return f"Диалог: {self.buyer.username} <-> {self.seller.username} ({self.listing.title})"

    class Meta:
        verbose_name = 'Диалог'
        verbose_name_plural = 'Диалоги'
        unique_together = ['listing', 'buyer', 'seller']
        ordering = ['-updated_at']


class Message(models.Model):
    """Сообщение в диалоге"""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, verbose_name='Диалог', related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Отправитель')
    text = models.TextField(verbose_name='Текст сообщения')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата отправки')

    def __str__(self):
        return f"{self.sender.username}: {self.text[:50]}"

    class Meta:
        verbose_name = 'Сообщение'
        verbose_name_plural = 'Сообщения'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at'], name='msg_conv_created_idx'),
            models.Index(fields=['conversation', 'is_read'], name='msg_conv_read_idx'),
        ]


def avatar_upload_path(instance, filename):
    """Генерирует путь для сохранения аватара с уникальным именем: avatars/user_<id>/avatar_<timestamp>.<ext>"""
    ext = filename.split('.')[-1]
    timestamp = int(time.time())
    filename = f'avatar_{timestamp}.{ext}'
    return os.path.join('avatars', f'user_{instance.user.id}', filename)



class Profile(models.Model):
    """Профиль пользователя с аватаркой"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Пользователь', related_name='profile')
    avatar = models.ImageField(
        upload_to=avatar_upload_path,
        blank=True,
        null=True,
        verbose_name='Аватар',
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'webp']),
        ],
        help_text='Загрузите изображение (JPG, PNG, WEBP). Макс. размер: 5 МБ. Изображение будет автоматически обрезано до 400x400px.'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания профиля')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления профиля')

    def __str__(self):
        return f"Профиль пользователя {self.user.username}"

    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'

    def save(self, *args, **kwargs):
        """Автоматический ресайз аватара при сохранении"""
        if self.avatar:
            # Открываем изображение
            img = Image.open(self.avatar)

            # Конвертируем RGBA в RGB если нужно (для JPEG)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Определяем размер для обрезки (квадрат из центра)
            width, height = img.size
            min_dimension = min(width, height)

            # Вычисляем координаты для центральной обрезки
            left = (width - min_dimension) // 2
            top = (height - min_dimension) // 2
            right = left + min_dimension
            bottom = top + min_dimension

            # Обрезаем до квадрата
            img = img.crop((left, top, right, bottom))

            # Ресайзим до 400x400
            img = img.resize((400, 400), Image.Resampling.LANCZOS)

            # Сохраняем в буфер
            output = io.BytesIO()
            img_format = 'JPEG'
            if self.avatar.name.lower().endswith('.png'):
                img_format = 'PNG'
            elif self.avatar.name.lower().endswith('.webp'):
                img_format = 'WEBP'

            img.save(output, format=img_format, quality=85, optimize=True)
            output.seek(0)

            # Заменяем файл
            self.avatar.save(
                self.avatar.name,
                ContentFile(output.read()),
                save=False
            )

        super().save(*args, **kwargs)

    def delete_avatar(self):
        """Удаляет аватар с диска и все старые файлы аватаров"""
        if self.avatar:
            # Удаляем текущий файл
            if os.path.isfile(self.avatar.path):
                os.remove(self.avatar.path)
        
        # Удаляем все старые файлы аватаров из папки пользователя
        avatar_dir = os.path.join('media', 'avatars', f'user_{self.user.id}')
        if os.path.isdir(avatar_dir):
            for filename in os.listdir(avatar_dir):
                if filename.startswith('avatar_'):
                    file_path = os.path.join(avatar_dir, filename)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
        
        self.avatar = None
        self.save()
