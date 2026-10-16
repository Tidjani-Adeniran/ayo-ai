from rest_framework import serializers
from .models import Document
from .models import JournalEntry

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'title', 'file', 'status', 'uploaded_by', 'created_at']
        read_only_fields = ['id', 'status', 'uploaded_by', 'created_at']
        
class JournalSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'title', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']