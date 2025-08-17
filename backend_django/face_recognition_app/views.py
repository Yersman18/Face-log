# face_recognition/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .services import FaceRecognitionService
import json

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_face(request):
    """Registrar rostro del usuario"""
    if 'image' not in request.FILES:
        return Response({
            'error': 'Debe proporcionar una imagen'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Extraer codificación facial
    face_encoding = FaceRecognitionService.extract_face_encoding(image_file)
    
    if face_encoding is None:
        return Response({
            'error': 'No se pudo detectar un rostro en la imagen. Asegúrate de que tu cara esté bien iluminada y visible.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Guardar codificación en el usuario
    user = request.user
    user.face_encoding = face_encoding
    user.profile_image = image_file
    user.save()
    
    return Response({
        'message': 'Rostro registrado correctamente',
        'face_registered': True
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_face(request):
    """Verificar rostro para asistencia"""
    image_data = request.data.get('image')
    session_id = request.data.get('session_id')
    
    if not image_data or not session_id:
        return Response({
            'error': 'Debe proporcionar image y session_id'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Procesar imagen de la webcam
    face_encoding = FaceRecognitionService.process_webcam_image(image_data)
    
    if face_encoding is None:
        return Response({
            'error': 'No se pudo detectar un rostro en la imagen'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Verificar que el usuario tenga rostro registrado
    if not user.face_encoding:
        return Response({
            'error': 'No tienes un rostro registrado. Registra tu rostro primero.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Comparar rostros
    is_match, confidence = FaceRecognitionService.compare_faces(
        user.face_encoding, 
        face_encoding
    )
    
    if is_match:
        # Marcar asistencia automáticamente
        from attendance.models import AttendanceSession, Attendance
        from django.shortcuts import get_object_or_404
        from django.utils import timezone
        
        try:
            session = get_object_or_404(AttendanceSession, id=session_id)
            
            # Verificar que el usuario esté inscrito en el curso
            if user not in session.course.students.all():
                return Response({
                    'error': 'No estás inscrito en este curso'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Crear o actualizar asistencia
            attendance, created = Attendance.objects.get_or_create(
                session=session,
                student=user,
                defaults={
                    'status': 'present',
                    'verified_by_face': True,
                    'check_in_time': timezone.now()
                }
            )
            
            if not created:
                attendance.status = 'present'
                attendance.verified_by_face = True
                attendance.check_in_time = timezone.now()
                attendance.save()
            
            return Response({
                'message': 'Rostro verificado correctamente. Asistencia marcada.',
                'verified': True,
                'confidence': round((1 - confidence) * 100, 2),
                'attendance_marked': True
            })
            
        except Exception as e:
            return Response({
                'error': f'Error al marcar asistencia: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({
            'message': 'Rostro no verificado. La imagen no coincide con tu rostro registrado.',
            'verified': False,
            'confidence': round((1 - confidence) * 100, 2),
            'attendance_marked': False
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def face_status(request):
    """Verificar estado del registro facial del usuario"""
    user = request.user
    has_face = bool(user.face_encoding)
    
    return Response({
        'has_face_registered': has_face,
        'profile_image': user.profile_image.url if user.profile_image else None
    })
