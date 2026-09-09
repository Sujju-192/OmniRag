import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()  # <-- This was missing in test.py

api_key = os.getenv("GOOGLE_API_KEY")
print(f"Loaded API Key: {api_key[:6]}..." if api_key else "❌ API KEY NOT FOUND IN .ENV!")

if api_key:
    genai.configure(api_key=api_key)
    print("\nSupported Embedding Models:")
    for m in genai.list_models():
        if 'embedContent' in m.supported_generation_methods:
            print(m.name)