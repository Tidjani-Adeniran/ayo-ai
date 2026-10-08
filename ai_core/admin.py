from django.contrib import admin
from .models import Conversation, ChatMessage, Document, DocumentChunk


class DocumentChunkInline(admin.TabularInline):
    model = DocumentChunk
    extra = 0
    readonly_fields = ('chunk_index', 'content', 'has_embedding', 'created_at')
    can_delete = False
    max_num = 0

    def has_embedding(self, obj):
        return bool(obj.embedding)
    has_embedding.boolean = True
    has_embedding.short_description = "Vectorized?"


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'status', 'uploaded_by', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'uploaded_by__username')
    readonly_fields = ('status', 'created_at')
    inlines = [DocumentChunkInline]

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)
        
        # Trigger PDF extraction and chunking when uploaded via Admin
        obj.process_and_chunk()


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ('id', 'document', 'chunk_index', 'has_embedding', 'created_at')
    list_filter = ('document', 'created_at')
    search_fields = ('content', 'document__title')
    readonly_fields = ('created_at',)

    def has_embedding(self, obj):
        return bool(obj.embedding)
    has_embedding.boolean = True
    has_embedding.short_description = "Vectorized?"


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'created_at')
    search_fields = ('user__username', 'title')
    readonly_fields = ('created_at',)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'short_content', 'timestamp')
    list_filter = ('sender', 'timestamp')
    search_fields = ('content', 'conversation__user__username')
    readonly_fields = ('timestamp',)

    def short_content(self, obj):
        return obj.content[:60] + "..." if len(obj.content) > 60 else obj.content
    short_content.short_description = "Content"