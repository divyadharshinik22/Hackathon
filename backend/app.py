from flask import Flask, request, jsonify
import cv2
import numpy as np

app = Flask(__name__)

# Load Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

@app.route('/')
def home():
    return "Backend Running Successfully!"

@app.route('/detect', methods=['POST'])
def detect_face():
    file = request.files['image']

    # Convert image to OpenCV format
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    return jsonify({
        "faces_detected": len(faces)
    })

if __name__ == '__main__':
    app.run(debug=True)
