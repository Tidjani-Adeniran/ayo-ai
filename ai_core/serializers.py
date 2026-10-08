from rest_framework import serializers
from .models import Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'status', 'uploaded_by', 'created_at']
        read_only_fields = ['id', 'status', 'uploaded_by', 'created_at']