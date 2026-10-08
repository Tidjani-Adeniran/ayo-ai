from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import chat_view, register_view, DocumentUploadView
urlpatterns = [
    path('auth/register/', register_view, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('chat/', chat_view, name='chat'),
    path('documents/upload/', DocumentUploadView.as_view(), name='document-upload'),
    
]