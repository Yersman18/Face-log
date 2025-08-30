# authentication/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import (
    UserRegistrationSerializer, 
    LoginSerializer, 
    UserSerializer, 
    UserProfileUpdateSerializer
)
from .models import User
from attendance.models import StudentProfile  # 🔥 IMPORTANTE


def get_tokens_for_user(user):
    """Generar tokens JWT"""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Registro de nuevos usuarios con creación automática de perfil"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)

        # 🔥 Traer el perfil de estudiante recién creado
        student_profile = None
        try:
            if hasattr(user, "student_profile"):
                student_profile = {
                    "id": user.student_profile.id,
                    "documento": user.student_profile.documento,
                    "estado_academico": user.student_profile.estado_academico,
                    "ficha": user.student_profile.ficha.numero if user.student_profile.ficha else None,
                }
        except StudentProfile.DoesNotExist:
            student_profile = None

        return Response({
            'user': UserSerializer(user).data,
            'student_profile': student_profile,
            **tokens,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login de usuarios"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)

        # 🔥 Incluir perfil en el login también
        student_profile = None
        try:
            if hasattr(user, "student_profile"):
                student_profile = {
                    "id": user.student_profile.id,
                    "documento": user.student_profile.documento,
                    "estado_academico": user.student_profile.estado_academico,
                    "ficha": user.student_profile.ficha.numero if user.student_profile.ficha else None,
                }
        except StudentProfile.DoesNotExist:
            student_profile = None

        return Response({
            'user': UserSerializer(user).data,
            'student_profile': student_profile,
            **tokens,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Obtener perfil del usuario autenticado"""
    serializer = UserSerializer(request.user)

    student_profile = None
    try:
        if hasattr(request.user, "student_profile"):
            student_profile = {
                "id": request.user.student_profile.id,
                "documento": request.user.student_profile.documento,
                "estado_academico": request.user.student_profile.estado_academico,
                "ficha": request.user.student_profile.ficha.numero if request.user.student_profile.ficha else None,
            }
    except StudentProfile.DoesNotExist:
        student_profile = None

    return Response({
        "user": serializer.data,
        "student_profile": student_profile
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """Actualizar perfil del usuario"""
    serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(request.user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Cambiar contraseña del usuario"""
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response({
            'error': 'Debe proporcionar old_password y new_password'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    if not user.check_password(old_password):
        return Response({
            'error': 'Contraseña actual incorrecta'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Contraseña actualizada correctamente'})
