import os
from dotenv import load_dotenv
from google import genai
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

load_dotenv()

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
            {"error": "Gemini API key is not configured on server."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    client = genai.Client(api_key=api_key)
    prompt = f"You are ayo-ai, a warm, culturally grounded, non-clinical African wellbeing companion. Respond helpfully to: {user_message}"

    # List of models to try in order (primary -> fallbacks)
    models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
    
    last_error = None
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            # If successful, return immediately
            return Response({
                "response": response.text,
                "model_used": model_name
            }, status=status.HTTP_200_OK)

        except Exception as e:
            last_error = e
            # Continue to the next model in the list
            continue

    # If all models failed, return a user-friendly error message
    return Response(
        {"error": "Ayo AI is experiencing high traffic right now. Please try again in a few seconds."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE
    )