from django.contrib import admin
from .models import Conversation, ChatMessage

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at')
    search_fields = ('user__username', 'title')

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'timestamp')
    list_filter = ('sender',)