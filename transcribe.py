from elevenlabs import set_api_key, transcribe  # type: ignore

# Set your ElevenLabs API key properly
set_api_key("sk_75c715378ea8d19443b91f8bea354826131d667fea1eafeb")

# Path to your audio file (.wav, .mp3, .webm, etc.)
audio_path = "sample.wav"

# Perform transcription
result = transcribe(audio_path)

# Print the text
print("Transcribed Text:", result.text)
