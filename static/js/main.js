let videoStream;
let capturedImage;

function openCamera() {
    const modal = document.getElementById('scannerModal');
    const video = document.getElementById('videoElement');
    
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            modal.style.display = 'flex';
        })
        .catch(err => {
            console.error("Error accessing camera:", err);
            alert("Unable to access camera. Please ensure camera permissions are granted.");
        });
}

function closeModal() {
    const modal = document.getElementById('scannerModal');
    stopCamera();
    modal.style.display = 'none';
    resetResults();
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
}

function captureImage() {
    const video = document.getElementById('videoElement');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    capturedImage = canvas.toDataURL('image/jpeg');
    
    // Stop the video stream after capture
    stopCamera();
    
    // Show the captured image
    video.style.display = 'none';
    const img = document.createElement('img');
    img.src = capturedImage;
    img.style.width = '100%';
    img.style.height = '100%';
    video.parentElement.appendChild(img);
}

function resetScan() {
    const video = document.getElementById('videoElement');
    const container = video.parentElement;
    
    // Remove any captured image
    const img = container.querySelector('img');
    if (img) {
        container.removeChild(img);
    }
    
    // Reset video display
    video.style.display = 'block';
    
    // Restart camera
    openCamera();
    
    // Clear results
    resetResults();
}

function submitScan() {
    if (!capturedImage) {
        alert('Please capture an image first!');
        return;
    }

    showLoading();

    fetch('/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: capturedImage
        })
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        if (data.status === 'success') {
            displayResults(data);
        } else {
            alert('Error analyzing image: ' + data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Error:', error);
        alert('Error analyzing image. Please try again.');
    });
}

function displayResults(data) {
    const resultDiv = document.getElementById('emotion-result');
    resultDiv.innerHTML = `
        <div class="emotion-result fade-in">
            <h3>Detected Emotion: ${data.emotion}</h3>
        </div>
        <div class="recommendations fade-in">
            <h3>Music Recommendations:</h3>
            <ul>
                ${data.recommendations.map(rec => `
                    <li>
                        <strong>${rec.genre}</strong>
                        <p>${rec.description}</p>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function resetResults() {
    const resultDiv = document.getElementById('emotion-result');
    resultDiv.innerHTML = '';
    capturedImage = null;
}

function showLoading() {
    document.querySelector('.loading-indicator').style.display = 'flex';
}

function hideLoading() {
    document.querySelector('.loading-indicator').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('scannerModal');
    if (event.target === modal) {
        closeModal();
    }
}