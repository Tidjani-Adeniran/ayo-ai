import os
import json
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Conversation, ChatMessage, Document, DocumentChunk
from .serializers import DocumentSerializer
from .utils import search_similar_chunks

load_dotenv()


class AyoWellbeingResponse(BaseModel):
    greeting: str = Field(
        description="A brief, warm, culturally grounded greeting or conversational response."
    )
    reflection: str = Field(
        description="An empathetic reflection or response to what the user said."
    )
    actionable_suggestion: Optional[str] = Field(
        default=None, 
        description="One simple, non-clinical wellbeing suggestion. Set to null or empty string if the user is just saying hello or engaging in casual small talk."
    )
    culturally_grounded_wisdom: Optional[str] = Field(
        default=None, 
        description="An encouraging proverb or warm wisdom if relevant. Set to null or empty string if not applicable to a basic greeting."
    )
    suggested_followups: list[str] = Field(
        description="2 short follow-up options for the user to tap next."
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Handles user account registration."""
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email', '')

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username is already taken."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, password=password, email=email)
    return Response(
        {"message": "User registered successfully!", "username": user.username},
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    """
    Authenticated chat endpoint. Saves message history to DB,
    retrieves top matching document excerpts (RAG), and generates
    a structured response using Gemini with source document citations.
    """
    user_message = request.data.get('message', '')
    conversation_id = request.data.get('conversation_id', None)

    if not user_message:
        return Response(
            {"error": "Message content is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return Response(
            {"error": "Gemini API key is missing on server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Get or create active conversation for request.user
    if conversation_id:
        try:
            conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        except Conversation.DoesNotExist:
            return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)
    else:
        # Create a new conversation session
        title_snippet = user_message[:30] + "..." if len(user_message) > 30 else user_message
        conversation = Conversation.objects.create(user=request.user, title=title_snippet)

    # Save User message to DB
    ChatMessage.objects.create(
        conversation=conversation,
        sender='user',
        content=user_message
    )

    # Fetch recent chat context (up to last 6 messages) for conversation flow
    recent_messages = conversation.messages.order_by('-timestamp')[:6]
    history_context = ""
    for msg in reversed(list(recent_messages)):
        history_context += f"{msg.sender.upper()}: {msg.content}\n"

    # Semantic search: Retrieve top 2 document chunks related to the user message
    matching_chunks = search_similar_chunks(user_message, top_k=2)
    doc_context = ""
    sources_used = []

    if matching_chunks:
        doc_context = "Relevant Uploaded Document Context:\n"
        for chunk in matching_chunks:
            doc_context += f"--- [{chunk['document_title']}] (Similarity: {chunk['similarity_score']:.2f}) ---\n{chunk['content']}\n\n"
            
            # Format sources for frontend citation badges
            sources_used.append({
                "title": chunk["document_title"],
                "score": round(chunk["similarity_score"] * 100, 1)  # Convert to percentage
            })

    # Persona and grounding instructions
    system_instruction = (
        "You are ayo-ai, a warm, empathetic, non-clinical African wellbeing companion. "
        "Always remain in persona as ayo-ai. "
        "Never say 'I am an AI created by Google', 'I am a robot', or 'As an artificial intelligence'. "
        "When relevant uploaded document context is provided, use it to accurately inform your guidance. "
        "When the user engages in small talk or simple greetings, keep your response lightweight and human-like."
    )

    client = genai.Client(api_key=api_key)
    prompt = (
        f"{doc_context}"
        f"Recent Conversation History:\n{history_context}\n"
        f"Respond naturally to the user's latest input: {user_message}"
    )

    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    
    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=AyoWellbeingResponse,
                ),
            )
            
            # Save Ayo AI response to DB
            ChatMessage.objects.create(
                conversation=conversation,
                sender='ayo',
                content=response.text
            )

            return Response({
                "conversation_id": conversation.id,
                "structured_data": json.loads(response.text) if isinstance(response.text, str) else response.text,
                "sources": sources_used,
                "model_used": model_name
            }, status=status.HTTP_200_OK)

        except Exception as e:
            last_error = e
            print(f"❌ ERROR on {model_name}: {e}")
            continue

    return Response(
        {"error": f"Ayo AI unavailable. Error: {str(last_error)}"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_conversations_view(request):
    """Lists all past conversations for the authenticated user for sidebar navigation."""
    conversations = Conversation.objects.filter(user=request.user).order_by('-created_at')
    data = [
        {
            "id": conv.id,
            "title": conv.title or f"Chat #{conv.id}",
            "created_at": conv.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for conv in conversations
    ]
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_conversation_messages_view(request, conversation_id):
    """Retrieves full message history for a given conversation session."""
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)

    messages = conversation.messages.order_by('timestamp')
    formatted_messages = []
    
    for msg in messages:
        structured_data = None
        if msg.sender == 'ayo':
            try:
                structured_data = json.loads(msg.content)
            except (json.JSONDecodeError, TypeError):
                structured_data = None

        formatted_messages.append({
            "sender": msg.sender,
            "text": msg.content if not structured_data else None,
            "structured": structured_data
        })

    return Response({
        "conversation_id": conversation.id,
        "messages": formatted_messages
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_conversation_view(request, conversation_id):
    """Deletes a specific conversation session and all associated messages."""
    try:
        conversation = Conversation.objects.get(id=conversation_id, user=request.user)
        conversation.delete()
        return Response({"message": "Conversation deleted successfully."}, status=status.HTTP_200_OK)
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found."}, status=status.HTTP_404_NOT_FOUND)


class DocumentUploadView(APIView):
    """
    Handles PDF document uploads, triggers text extraction, chunking, 
    and vector embedding generation.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            doc = serializer.save(uploaded_by=request.user)

            try:
                # Delegate text extraction, chunking, and embedding creation to model method
                doc.process_and_chunk()
            except Exception as e:
                doc.status = 'failed'
                doc.save()
                return Response(
                    {"error": f"Document processing error: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            if doc.status == 'failed':
                return Response(
                    {"error": "Could not extract text or generate embeddings. Ensure the PDF contains selectable text and not scanned images."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {
                    "message": "Document uploaded and chunked successfully!",
                    "chunks_created": doc.chunks.count(),
                    "document": serializer.data
                },
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)