// script.js

const recordButton = document.getElementById('recordButton');
const outputDiv = document.getElementById('output');

let mediaRecorder;
let audioChunks = [];
let isRecording = false;

// Function to send audio to the backend for transcription
async function sendAudioToBackend(audioBlob) {
    outputDiv.textContent = 'Sending audio for transcription... Please wait.';
    const formData = new FormData();
    // Append the audio blob. The 'audio' key must match what your backend expects.
    // 'recording.wav' is a suggested filename for the blob.
    formData.append('audio', audioBlob, 'recording.wav');

    try {
        const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            // Check if the response is not OK (e.g., 404, 500)
            const errorText = await response.text(); // Get error message from backend
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const data = await response.json(); // Assuming backend returns JSON
        console.log('Transcription received:', data);

        // Call the function to display the transcribed text and optionally process it further
        if (data.transcribedText) {
            displayAndProcessText(data.transcribedText);
        } else {
            outputDiv.textContent = 'Transcription successful, but no text found in response.';
        }

    } catch (error) {
        console.error('Error sending audio to backend:', error);
        outputDiv.textContent = `Error during transcription: ${error.message}`;
    }
}

// Function to display the transcribed text and optionally send for further processing
function displayAndProcessText(transcribedText) {
    outputDiv.textContent = transcribedText;
    console.log('Transcribed text displayed:', transcribedText);

    // *Optional: If there's a separate "processing" step after transcription*
    // If the requirement is to send this text to *another* backend endpoint for further processing,
    // you would make another fetch call here.
    // Example:
    // sendTextForFurtherProcessing(transcribedText);
}

// Optional function for further processing (uncomment and use if needed)
/*
async function sendTextForFurtherProcessing(text) {
    try {
        const response = await fetch('/process-text', { // Your backend endpoint for further processing
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Text processed by backend:', result);
        // You might update the UI with the result of this processing, e.g., outputDiv.textContent += "\nProcessed Result: " + result.someKey;
    } catch (error) {
        console.error('Error sending text for further processing:', error);
        // outputDiv.textContent += `\nError in further processing: ${error.message}`;
    }
}
*/

// Event listener for the record button
recordButton.addEventListener('click', async () => {
    if (!isRecording) {
        // --- Start recording ---
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; // Clear previous audio chunks

            // Event handler for when audio data is available
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            // Event handler for when recording stops
            mediaRecorder.onstop = async () => {
                // Combine all recorded chunks into a single Blob
                // Using 'audio/wav' as a common format, but 'audio/webm' is also common and often smaller.
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                console.log('Audio recording stopped. Blob size:', audioBlob.size, 'bytes');

                // Send the recorded audio blob to the backend
                sendAudioToBackend(audioBlob);

                // Stop all tracks in the media stream to release the microphone
                stream.getTracks().forEach(track => track.stop());
            };

            // Start recording
            mediaRecorder.start();
            recordButton.textContent = 'Stop Recording';
            outputDiv.textContent = 'Recording started... Speak now.';
            outputDiv.style.color = '#333'; // Reset text color
            isRecording = true;
        } catch (error) {
            console.error('Error accessing microphone:', error);
            outputDiv.textContent = 'Error: Could not access microphone. Please allow access and try again.';
            outputDiv.style.color = 'red'; // Indicate error
        }
    } else {
        // --- Stop recording ---
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        recordButton.textContent = 'Start Recording';
        outputDiv.textContent = 'Recording stopped. Processing...';
        outputDiv.style.color = '#333'; // Reset text color
        isRecording = false;
    }
});