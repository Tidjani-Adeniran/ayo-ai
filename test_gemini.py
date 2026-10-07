import os
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env file
load_dotenv()

# Retrieve API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing! Check your .env file.")

# Initialize the Gemini Client
client = genai.Client(api_key=api_key)

# Generate a non-clinical wellbeing response
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Give a warm, brief, culturally grounded welcome message for an African wellbeing companion app. Keep it encouraging and non-clinical.",
)

print("\n--- AI Response ---")
print(response.text)