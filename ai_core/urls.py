from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    chat_view,
    register_view,
    DocumentUploadView,
    list_conversations_view,
    get_conversation_messages_view,
    delete_conversation_view,
)

urlpatterns = [
    path('auth/register/', register_view, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('chat/', chat_view, name='chat'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    path('conversations/', list_conversations_view, name='list_conversations'),
    path('conversations/<int:conversation_id>/', get_conversation_messages_view, name='get_conversation_messages'),
    path('conversations/<int:conversation_id>/delete/', delete_conversation_view, name='delete_conversation'),
]