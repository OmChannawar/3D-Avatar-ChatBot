// =======================
// Google Font Injection
// =======================
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
document.head.appendChild(fontLink);

// =======================
// Custom Styling Injection
// =======================
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: 'Roboto', Arial, sans-serif;
    background: #f7f9fb;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
  .container {
    max-width: 800px;
    margin: 40px auto;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    padding: 32px;
    border: 1px solid #e3e7ed;
  }
  h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 24px;
    color: #222b45;
  }
  button {
    background: linear-gradient(90deg, #4f8cff 0%, #3358ff 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(79,140,255,0.08);
    margin-bottom: 20px;
  }
  button:hover {
    background: linear-gradient(90deg, #3358ff 0%, #4f8cff 100%);
    box-shadow: 0 4px 16px rgba(51,88,255,0.12);
  }
  textarea {
    width: 100%;
    min-height: 140px;
    font-size: 1rem;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #dbe2ea;
    background: #f4f7fa;
    resize: vertical;
    color: #222b45;
    box-sizing: border-box;
    transition: border 0.2s;
  }
  textarea:focus {
    border: 1.5px solid #4f8cff;
    outline: none;
    background: #fff;
  }
  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3358ff;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
    display: none;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @media (max-width: 700px) {
    .container {
      padding: 18px;
    }
    h1 {
      font-size: 1.8rem;
    }
  }
`;
document.head.appendChild(style);

// =======================
// Build Interface Elements
// =======================
const body = document.body;

const container = document.createElement('div');
container.className = 'container';

const title = document.createElement('h1');
title.textContent = 'Speech to Text Interface';

const recordButton = document.createElement('button');
recordButton.id = 'recordButton';
recordButton.textContent = 'Start Recording';

const label = document.createElement('div');
label.className = 'label';
label.textContent = 'Transcribed Text:';

const output = document.createElement('textarea');
output.id = 'output';
output.placeholder = 'Your transcribed text will appear here...';

const loader = document.createElement('div');
loader.className = 'loader';

container.appendChild(title);
container.appendChild(recordButton);
container.appendChild(label);
container.appendChild(loader);
container.appendChild(output);
body.appendChild(container);

// =======================
// Recording + Transcription Logic
// =======================
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

async function sendAudioToBackend(audioBlob) {
  output.value = '';
  loader.style.display = 'block';

  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  try {
    const response = await fetch('/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    output.value = data.transcribedText || 'Transcription completed, but no text found.';
  } catch (error) {
    console.error('Transcription error:', error);
    output.value = `Error: ${error.message}`;
  } finally {
    loader.style.display = 'none';
  }
}

// =======================
// Record Button Logic
// =======================
recordButton.addEventListener('click', async () => {
  if (!isRecording) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      recordButton.textContent = 'Stop Recording';
      output.value = 'Recording started... Speak now.';
      isRecording = true;
    } catch (error) {
      console.error('Microphone error:', error);
      output.value = 'Microphone access denied or not available.';
    }
  } else {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    recordButton.textContent = 'Start Recording';
    isRecording = false;
  }
});