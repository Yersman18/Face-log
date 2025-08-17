import face_recognition
import numpy as np
import cv2
from PIL import Image
import io
import base64
import json

class FaceRecognitionService:
    @staticmethod
    def extract_face_encoding(image_file):
        """Extraer codificación facial de una imagen"""
        try:
            # Cargar imagen
            image = face_recognition.load_image_file(image_file)
            
            # Encontrar caras
            face_locations = face_recognition.face_locations(image)
            
            if not face_locations:
                return None
            
            # Extraer codificación de la primera cara encontrada
            face_encodings = face_recognition.face_encodings(image, face_locations)
            
            if face_encodings:
                return face_encodings[0].tolist()
            
            return None
        except Exception as e:
            print(f"Error al extraer codificación facial: {e}")
            return None
    
    @staticmethod
    def compare_faces(known_encoding, unknown_encoding, tolerance=0.6):
        """Comparar dos codificaciones faciales"""
        try:
            if isinstance(known_encoding, str):
                known_encoding = json.loads(known_encoding)
            if isinstance(unknown_encoding, str):
                unknown_encoding = json.loads(unknown_encoding)
                
            known_np = np.array(known_encoding)
            unknown_np = np.array(unknown_encoding)
            
            # Calcular distancia
            distance = face_recognition.face_distance([known_np], unknown_np)[0]
            
            # Verificar si coincide
            is_match = distance <= tolerance
            
            return is_match, float(distance)
        except Exception as e:
            print(f"Error al comparar caras: {e}")
            return False, 1.0
    
    @staticmethod
    def process_webcam_image(base64_image):
        """Procesar imagen de webcam en base64"""
        try:
            # Decodificar base64
            image_data = base64.b64decode(base64_image.split(',')[1])
            image = Image.open(io.BytesIO(image_data))
            
            # Convertir a RGB
            image_rgb = image.convert('RGB')
            image_array = np.array(image_rgb)
            
            # Extraer codificación
            face_locations = face_recognition.face_locations(image_array)
            
            if not face_locations:
                return None
            
            face_encodings = face_recognition.face_encodings(image_array, face_locations)
            
            if face_encodings:
                return face_encodings[0].tolist()
            
            return None
        except Exception as e:
            print(f"Error al procesar imagen de webcam: {e}")
            return None