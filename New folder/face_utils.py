import face_recognition
import cv2
import numpy as np
import pickle

def get_face_encoding(image_bytes: bytes):
    """
    Given image bytes, loads the image and returns the face encoding using face_recognition.
    Returns None if no face or multiple faces are found for registration.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_img)
    if len(face_locations) != 1:
        return None
    
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
    if not face_encodings:
        return None
        
    return pickle.dumps(face_encodings[0])

def find_faces_in_image(image_bytes: bytes, known_face_encodings: list, known_face_ids: list):
    """
    Given image bytes of a classroom, finds all faces and tries to match them
    against known_face_encodings. Returns a list of recognized student IDs.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    face_locations = face_recognition.face_locations(rgb_img)
    face_encodings = face_recognition.face_encodings(rgb_img, face_locations)
    
    recognized_ids = set()
    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
        if True in matches:
            first_match_index = matches.index(True)
            recognized_ids.add(known_face_ids[first_match_index])
            
    return list(recognized_ids)
