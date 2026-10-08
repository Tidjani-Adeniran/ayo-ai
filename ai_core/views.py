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
    Authenticated chat endpoint. Saves message history to DB
    and injects recent conversation context into Gemini.
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

    # Fetch recent chat context (up to last 6 messages) for context continuity
    recent_messages = conversation.messages.order_by('-timestamp')[:6]
    history_context = ""
    for msg in reversed(list(recent_messages)):
        history_context += f"{msg.sender.upper()}: {msg.content}\n"

    # Define system instructions to keep persona grounded, warm, and natural
    system_instruction = (
        "You are ayo-ai, a warm, empathetic, non-clinical African wellbeing companion. "
        "Always remain in persona as ayo-ai. "
        "Never say 'I am an AI created by Google', 'I am a robot', or 'As an artificial intelligence'. "
        "When the user engages in small talk or simple greetings (e.g., 'hey', 'how are you doing'), "
        "keep your response lightweight, friendly, and human-like. Do not over-explain or give long advice unless the user is sharing a specific problem or distress."
    )

    client = genai.Client(api_key=api_key)
    prompt = (
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
                "structured_data": response.text,
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


class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = DocumentSerializer(data=request.data)
        if serializer.is_valid():
            doc = serializer.save(uploaded_by=request.user)

            # Delegate text extraction & chunk generation to the model method
            doc.process_and_chunk()

            if doc.status == 'failed':
                return Response(
                    {"error": "Could not extract text from the uploaded document. It may be an image-only PDF or empty."},
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