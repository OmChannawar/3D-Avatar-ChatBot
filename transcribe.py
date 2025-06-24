from flask import Flask, request, jsonify
from elevenlabs import set_api_key, transcribe
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
set_api_key("sk_75c715378ea8d19443b91f8bea354826131d667fea1eafeb")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/transcribe", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file uploaded"}), 400

    audio_file = request.files["audio"]
    filename = secure_filename(audio_file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    audio_file.save(file_path)

    try:
        result = transcribe(file_path)
        return jsonify({"transcribedText": result.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # Optional: delete file after processing
        os.remove(file_path)

if __name__ == "__main__":
    app.run(debug=True)
