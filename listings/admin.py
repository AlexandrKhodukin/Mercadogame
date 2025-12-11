from django.contrib import admin
from .models import Game, Listing, Server, Conversation, Message, Profile


class ServerInline(admin.TabularInline):
    """Inline для добавления серверов на странице игры"""
    model = Server
    extra = 1  # Количество пустых форм для добавления новых серверов
    fields = ('name', 'number')
    verbose_name = 'Сервер'
    verbose_name_plural = 'Серверы'
    ordering = ('number',)


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'get_short_description', 'get_servers_count')
    search_fields = ('name', 'description')
    list_filter = ()
    inlines = [ServerInline]

    def get_short_description(self, obj):
        """Отображает краткое описание (первые 50 символов)"""
        if obj.description:
            return obj.description[:50] + '...' if len(obj.description) > 50 else obj.description
        return '-'
    get_short_description.short_description = 'Описание'

    def get_servers_count(self, obj):
        """Отображает количество серверов"""
        return obj.servers.count()
    get_servers_count.short_description = 'Кол-во серверов'




@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'game', 'category', 'price', 'seller', 'created_at')
    list_filter = ('category', 'game', 'created_at')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'buyer', 'seller', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('buyer__username', 'seller__username', 'listing__title')
    date_hierarchy = 'created_at'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'get_text_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('text', 'sender__username')
    date_hierarchy = 'created_at'

    def get_text_preview(self, obj):
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    get_text_preview.short_description = 'Текст'


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'get_avatar_preview', 'created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('created_at',)
    readonly_fields = ('created_at', 'updated_at', 'get_avatar_preview')

    def get_avatar_preview(self, obj):
        if obj.avatar:
            return f'<img src="{obj.avatar.url}" width="50" height="50" style="border-radius: 50%;" />'
        return '-'
    get_avatar_preview.short_description = 'Аватар'
    get_avatar_preview.allow_tags = True
