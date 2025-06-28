from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from elevenlabs.client import ElevenLabs
from dotenv import load_dotenv
import os
import httpx
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
KRISHNA_URL = os.getenv("KRISHNA_URL")

app = FastAPI()

# Enable CORS for all origins (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

class SpeakRequest(BaseModel):
    text: str

@app.post("/speak")
async def speak(request: SpeakRequest):
    text = request.text
    if not text:
        return JSONResponse({"error": "No text provided."}, status_code=400)

    # Call Krishna API (example usage)
    async with httpx.AsyncClient() as http_client:
        response = await http_client.post(KRISHNA_URL, json={"text": text})
        if response.status_code != 200:
            return JSONResponse({"error": "Failed to get response from Krishna API."}, status_code=500)
        krishna_reply = response.json().get("reply", "")

    try:
        audio = client.text_to_speech.convert(
            voice_id="JBFqnCBsd6RMkjVDRZzb",  # George voice_id
            text=krishna_reply or text,
            model_id="eleven_monolingual_v1"
        )
        output_filename = "output.mp3"
        with open(output_filename, "wb") as f:
            for chunk in audio:
                f.write(chunk)
    except Exception as error:
        return JSONResponse({"error": f"Error generating audio: {error}"}, status_code=500)

    return FileResponse(output_filename, media_type="audio/mpeg", filename="output.mp3")
