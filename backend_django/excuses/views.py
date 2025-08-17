# excuses/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Excuse
from .serializers import ExcuseSerializer, CreateExcuseSerializer, ReviewExcuseSerializer
from attendance.models import AttendanceSession, Attendance

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def excuse_list(request):
    """Listar excusas o crear nueva excusa"""
    if request.method == 'GET':
        if request.user.role == 'student':
            # Estudiante ve solo sus excusas
            excuses = Excuse.objects.filter(student=request.user)
        elif request.user.role == 'instructor':
            # Instructor ve excusas de sus cursos
            excuses = Excuse.objects.filter(session__course__instructor=request.user)
        else:
            excuses = Excuse.objects.all()
        
        # Filtros
        status_filter = request.query_params.get('status')
        course_id = request.query_params.get('course_id')
        
        if status_filter:
            excuses = excuses.filter(status=status_filter)
        
        if course_id:
            excuses = excuses.filter(session__course_id=course_id)
        
        excuses = excuses.order_by('-created_at')
        serializer = ExcuseSerializer(excuses, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if request.user.role != 'student':
            return Response({
                'error': 'Solo los estudiantes pueden crear excusas'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CreateExcuseSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.validated_data['session']
            
            # Verificar que el estudiante esté inscrito en el curso
            if request.user not in session.course.students.all():
                return Response({
                    'error': 'No estás inscrito en este curso'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Verificar que no exista ya una excusa para esta sesión
            if Excuse.objects.filter(student=request.user, session=session).exists():
                return Response({
                    'error': 'Ya existe una excusa para esta sesión'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            excuse = serializer.save(student=request.user)
            return Response(ExcuseSerializer(excuse).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def excuse_detail(request, excuse_id):
    """Detalle, actualizar o eliminar excusa"""
    excuse = get_object_or_404(Excuse, id=excuse_id)
    
    # Verificar permisos
    if request.user.role == 'student':
        if excuse.student != request.user:
            return Response({
                'error': 'No tienes acceso a esta excusa'
            }, status=status.HTTP_403_FORBIDDEN)
    elif request.user.role == 'instructor':
        if excuse.session.course.instructor != request.user:
            return Response({
                'error': 'No eres el instructor de este curso'
            }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = ExcuseSerializer(excuse)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if request.user.role == 'student':
            if excuse.student != request.user:
                return Response({
                    'error': 'No puedes editar esta excusa'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if excuse.status != 'pending':
                return Response({
                    'error': 'No puedes editar una excusa que ya fue revisada'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = CreateExcuseSerializer(excuse, data=request.data, partial=True)
        else:
            # Instructor revisa la excusa
            serializer = ReviewExcuseSerializer(excuse, data=request.data, partial=True)
        
        if serializer.is_valid():
            if request.user.role == 'instructor':
                excuse = serializer.save(reviewed_by=request.user, reviewed_at=timezone.now())
                
                # Si la excusa es aprobada, actualizar la asistencia
                if excuse.status == 'approved':
                    try:
                        attendance = Attendance.objects.get(
                            session=excuse.session,
                            student=excuse.student
                        )
                        attendance.status = 'excused'
                        attendance.save()
                    except Attendance.DoesNotExist:
                        # Crear registro de asistencia si no existe
                        Attendance.objects.create(
                            session=excuse.session,
                            student=excuse.student,
                            status='excused'
                        )
            else:
                excuse = serializer.save()
            
            return Response(ExcuseSerializer(excuse).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if request.user.role == 'student':
            if excuse.student != request.user:
                return Response({
                    'error': 'No puedes eliminar esta excusa'
                }, status=status.HTTP_403_FORBIDDEN)
            
            if excuse.status != 'pending':
                return Response({
                    'error': 'No puedes eliminar una excusa que ya fue revisada'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        excuse.delete()
        return Response({'message': 'Excusa eliminada correctamente'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_excuse(request, excuse_id):
    """Revisar excusa (solo instructores)"""
    if request.user.role != 'instructor':
        return Response({
            'error': 'Solo los instructores pueden revisar excusas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    excuse = get_object_or_404(Excuse, id=excuse_id)
    
    # Verificar que sea instructor del curso
    if excuse.session.course.instructor != request.user:
        return Response({
            'error': 'No eres el instructor de este curso'
        }, status=status.HTTP_403_FORBIDDEN)
    
    new_status = request.data.get('status')
    review_comment = request.data.get('review_comment', '')
    
    if new_status not in ['approved', 'rejected']:
        return Response({
            'error': 'Status debe ser "approved" o "rejected"'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    excuse.status = new_status
    excuse.review_comment = review_comment
    excuse.reviewed_by = request.user
    excuse.reviewed_at = timezone.now()
    excuse.save()
    
    # Si la excusa es aprobada, actualizar la asistencia
    if new_status == 'approved':
        try:
            attendance = Attendance.objects.get(
                session=excuse.session,
                student=excuse.student
            )
            attendance.status = 'excused'
            attendance.save()
        except Attendance.DoesNotExist:
            # Crear registro de asistencia si no existe
            Attendance.objects.create(
                session=excuse.session,
                student=excuse.student,
                status='excused'
            )
    
    return Response({
        'message': f'Excusa {new_status}',
        'excuse': ExcuseSerializer(excuse).data
    })