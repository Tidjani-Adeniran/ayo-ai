import os
from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=255, default="New Wellbeing Session")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.created_at.strftime('%Y-%m-%d')})"


class ChatMessage(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ayo', 'Ayo AI'),
    ]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    content = models.TextField()  # Raw user text OR JSON string from ayo-ai
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.sender}] {self.content[:30]}..."


class Document(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Processing'),
        ('processed', 'Processed'),
        ('failed', 'Failed'),
    ]

    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

    def process_and_chunk(self):
        """Extracts text from PDF, splits into chunks, and generates vector embeddings."""
        from .utils import extract_text_from_pdf, chunk_text, generate_embedding

        try:
            # Get actual file path on disk
            file_path = self.file.path if hasattr(self.file, 'path') else str(self.file)
            
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found on server storage: {file_path}")

            raw_text = extract_text_from_pdf(file_path)

            if not raw_text or not raw_text.strip():
                self.status = 'failed'
                self.save(update_fields=['status'])
                print(f"❌ Could not extract text from document ID {self.id}. PDF may be scanned or image-only.")
                return

            text_chunks = chunk_text(raw_text, chunk_size=1000, overlap=200)

            if not text_chunks:
                self.status = 'failed'
                self.save(update_fields=['status'])
                print(f"❌ No valid text chunks produced for document ID {self.id}")
                return

            # Clear existing chunks if re-processing
            self.chunks.all().delete()

            chunk_objects = []
            for index, chunk_content in enumerate(text_chunks):
                # Safe embedding generation so one failed chunk API call doesn't abort processing
                try:
                    vector = generate_embedding(chunk_content)
                except Exception as embed_err:
                    print(f"⚠️ Failed to generate embedding for chunk {index} in document {self.id}: {embed_err}")
                    vector = None

                chunk_objects.append(
                    DocumentChunk(
                        document=self,
                        chunk_index=index,
                        content=chunk_content,
                        embedding=vector  # Stored in JSONField
                    )
                )

            # Bulk insert chunks into database
            DocumentChunk.objects.bulk_create(chunk_objects)

            self.status = 'processed'
            self.save(update_fields=['status'])
            print(f"✅ Successfully chunked and vectorized Document ID {self.id}: Created {len(chunk_objects)} chunks.")

        except Exception as e:
            self.status = 'failed'
            self.save(update_fields=['status'])
            print(f"❌ Error during document processing for ID {self.id}: {e}")


class DocumentChunk(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    chunk_index = models.IntegerField()
    content = models.TextField()
    embedding = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['chunk_index']

    def __str__(self):
        return f"{self.document.title} - Chunk {self.chunk_index}"