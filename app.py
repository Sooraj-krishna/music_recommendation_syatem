from flask import Flask, render_template, jsonify, request
import cv2
import numpy as np
import base64
from deepface import DeepFace
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze_emotion():
    try:
        # Get image data from POST request
        image_data = request.json['image']
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Analyze emotions using DeepFace
        result = DeepFace.analyze(img, actions=['emotion'])
        
        # Get dominant emotion
        emotions = result[0]['emotion']
        dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0]
        
        # Generate music recommendations based on emotion
        recommendations = get_music_recommendations(dominant_emotion)
        
        return jsonify({
            'status': 'success',
            'emotion': dominant_emotion,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

def get_music_recommendations(emotion):
    # Dictionary mapping emotions to music genres/recommendations
    recommendations = {
        'happy': [
            {'genre': 'Pop', 'description': 'Upbeat and energetic pop songs'},
            {'genre': 'Dance', 'description': 'Electronic dance music to keep the mood up'}
        ],
        'sad': [
            {'genre': 'Blues', 'description': 'Soulful blues to express your feelings'},
            {'genre': 'Acoustic', 'description': 'Gentle acoustic melodies'}
        ],
        'angry': [
            {'genre': 'Rock', 'description': 'Heavy rock to channel the energy'},
            {'genre': 'Metal', 'description': 'Intense metal music'}
        ],
        'neutral': [
            {'genre': 'Jazz', 'description': 'Smooth jazz for relaxation'},
            {'genre': 'Ambient', 'description': 'Calming ambient sounds'}
        ],
        'fear': [
            {'genre': 'Classical', 'description': 'Soothing classical pieces'},
            {'genre': 'Meditation', 'description': 'Peaceful meditation music'}
        ],
        'surprise': [
            {'genre': 'Electronic', 'description': 'Experimental electronic music'},
            {'genre': 'World Music', 'description': 'Diverse world music'}
        ],
        'disgust': [
            {'genre': 'Punk', 'description': 'Energetic punk rock'},
            {'genre': 'Alternative', 'description': 'Alternative rock and indie'}
        ]
    }
    return recommendations.get(emotion.lower(), recommendations['neutral'])

if __name__ == '__main__':
    app.run(debug=True)
