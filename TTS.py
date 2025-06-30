import os
from elevenlabs.client import ElevenLabs
from playsound import playsound

# Retrieve the API key from the environment.
api_key = os.getenv("ELEVENLABS_API_KEY")
if not api_key:
    raise ValueError("Please set the ELEVENLABS_API_KEY environment variable with your actual API key.")

client = ElevenLabs(api_key=api_key)
print("Available voices:")
for voice in client.voices.get_all():
    print(voice)

def main():
    text = "Hello, Arjun."
    print("Generating audio using ElevenLabs, please wait...")

    try:
        # Initialize the ElevenLabs client
        client = ElevenLabs(api_key=api_key)

        # Generate audio using the correct method and argument names
        audio = client.text_to_speech.convert(
            voice_id="JBFqnCBsd6RMkjVDRZzb",  # George voice_id
            text=text,
            model_id="eleven_monolingual_v1"
        )

        output_filename = "output.mp3"
        with open(output_filename, "wb") as f:
            for chunk in audio:
                f.write(chunk)

        print("Audio generated and saved successfully.")
    except Exception as error:
        print("Error generating audio:", error)
        return

    try:
        print("Playing audio...")
        playsound(output_filename)
    except Exception as error:
        print("Error playing audio:", error)

if __name__ == "__main__":
    main()