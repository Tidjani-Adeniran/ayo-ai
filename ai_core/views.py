import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

load_dotenv()

# Define the exact JSON shape we require from Gemini
class AyoWellbeingResponse(BaseModel):
    greeting: str = Field(description="A brief, warm, culturally grounded greeting.")
    reflection: str = Field(description="A empathetic reflection of what the user expressed.")
    actionable_suggestion: str = Field(description="One simple, non-clinical wellbeing suggestion.")
    culturally_grounded_wisdom: str = Field(description="An encouraging proverb, phrase, or warm African wisdom.")
    suggested_followups: list[str] = Field(description="2 short follow-up questions or prompts the user might click next.")


@api_view(['POST'])
def chat_view(request):
    user_message = request.data.get('message', '')

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

    client = genai.Client(api_key=api_key)
    prompt = f"You are ayo-ai, a warm, non-clinical African wellbeing companion. Respond to: {user_message}"

    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AyoWellbeingResponse,
                ),
            )
            
            return Response({
                "structured_data": response.text,
                "model_used": model_name
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # THIS LINE REVEALS THE REAL ERROR IN YOUR TERMINAL
            print(f" ERROR on {model_name}: {type(e).__name__} - {e}")
            continue

    return Response(
        {"error": f"Ayo AI unavailable. Last model error: {str(e)}"},
        status=status.HTTP_503_SERVICE_UNAVAILABLE
    )