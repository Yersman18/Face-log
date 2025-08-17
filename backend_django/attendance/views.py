# attendance/views.py
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, date, timedelta
from .models import Course, AttendanceSession, Attendance
from .serializers import (
    CourseSerializer, AttendanceSessionSerializer, 
    AttendanceSerializer, CreateAttendanceSessionSerializer,
    AttendanceStatsSerializer
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def courses(request):
    """Listar cursos o crear nuevo curso (solo instructores)"""
    if request.method == 'GET':
        if request.user.role == 'student':
            # Estudiante ve solo sus cursos inscritos
            user_courses = request.user.enrolled_courses.all()
        else:
            # Instructor ve sus cursos que dicta
            user_courses = request.user.courses.all()
        
        serializer = CourseSerializer(user_courses, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if request.user.role != 'instructor':
            return Response({
                'error': 'Solo los instructores pueden crear cursos'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(instructor=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def course_detail(request, course_id):
    """Detalle, actualizar o eliminar curso"""
    course = get_object_or_404(Course, id=course_id)
    
    # Verificar permisos
    if request.user.role == 'student':
        if course not in request.user.enrolled_courses.all():
            return Response({
                'error': 'No tienes acceso a este curso'
            }, status=status.HTTP_403_FORBIDDEN)
    elif request.user.role == 'instructor':
        if course.instructor != request.user:
            return Response({
                'error': 'No eres el instructor de este curso'
            }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = CourseSerializer(course)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if request.user.role != 'instructor' or course.instructor != request.user:
            return Response({
                'error': 'No tienes permisos para editar este curso'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CourseSerializer(course, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if request.user.role != 'instructor' or course.instructor != request.user:
            return Response({
                'error': 'No tienes permisos para eliminar este curso'
            }, status=status.HTTP_403_FORBIDDEN)
        
        course.delete()
        return Response({'message': 'Curso eliminado correctamente'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_student(request, course_id):
    """Inscribir estudiante a un curso"""
    if request.user.role != 'instructor':
        return Response({
            'error': 'Solo los instructores pueden inscribir estudiantes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    course = get_object_or_404(Course, id=course_id, instructor=request.user)
    student_id = request.data.get('student_id')
    
    if not student_id:
        return Response({
            'error': 'Debe proporcionar student_id'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        student = User.objects.get(id=student_id, role='student')
        course.students.add(student)
        return Response({'message': f'Estudiante {student.username} inscrito correctamente'})
    except User.DoesNotExist:
        return Response({
            'error': 'Estudiante no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def attendance_sessions(request):
    """Listar sesiones de asistencia o crear nueva sesión"""
    if request.method == 'GET':
        course_id = request.query_params.get('course_id')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        
        sessions = AttendanceSession.objects.all()
        
        if request.user.role == 'student':
            # Filtrar por cursos del estudiante
            user_courses = request.user.enrolled_courses.all()
            sessions = sessions.filter(course__in=user_courses)
        elif request.user.role == 'instructor':
            # Filtrar por cursos del instructor
            sessions = sessions.filter(course__instructor=request.user)
        
        if course_id:
            sessions = sessions.filter(course_id=course_id)
        
        if date_from:
            sessions = sessions.filter(date__gte=date_from)
        
        if date_to:
            sessions = sessions.filter(date__lte=date_to)
        
        sessions = sessions.order_by('-date', '-start_time')
        serializer = AttendanceSessionSerializer(sessions, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if request.user.role != 'instructor':
            return Response({
                'error': 'Solo los instructores pueden crear sesiones de asistencia'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CreateAttendanceSessionSerializer(data=request.data)
        if serializer.is_valid():
            course = serializer.validated_data['course']
            
            # Verificar que el instructor sea dueño del curso
            if course.instructor != request.user:
                return Response({
                    'error': 'No eres el instructor de este curso'
                }, status=status.HTTP_403_FORBIDDEN)
            
            session = serializer.save()
            
            # Crear registros de asistencia para todos los estudiantes del curso
            for student in course.students.all():
                Attendance.objects.create(
                    session=session,
                    student=student,
                    status='absent'  # Por defecto ausente
                )
            
            return Response(AttendanceSessionSerializer(session).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def attendance_session_detail(request, session_id):
    """Detalle, actualizar o eliminar sesión de asistencia"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Verificar permisos
    if request.user.role == 'student':
        if session.course not in request.user.enrolled_courses.all():
            return Response({
                'error': 'No tienes acceso a esta sesión'
            }, status=status.HTTP_403_FORBIDDEN)
    elif request.user.role == 'instructor':
        if session.course.instructor != request.user:
            return Response({
                'error': 'No eres el instructor de este curso'
            }, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        serializer = AttendanceSessionSerializer(session)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        if request.user != session.course.instructor:
            return Response({
                'error': 'No tienes permisos para editar esta sesión'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AttendanceSessionSerializer(session, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if request.user != session.course.instructor:
            return Response({
                'error': 'No tienes permisos para eliminar esta sesión'
            }, status=status.HTTP_403_FORBIDDEN)
        
        session.delete()
        return Response({'message': 'Sesión eliminada correctamente'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    """Marcar asistencia (con o sin reconocimiento facial)"""
    session_id = request.data.get('session_id')
    student_id = request.data.get('student_id', request.user.id)
    status_attendance = request.data.get('status', 'present')
    verified_by_face = request.data.get('verified_by_face', False)
    
    if not session_id:
        return Response({
            'error': 'Debe proporcionar session_id'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Solo instructores pueden marcar asistencia de otros estudiantes
    if request.user.role == 'student' and student_id != request.user.id:
        return Response({
            'error': 'Los estudiantes solo pueden marcar su propia asistencia'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Verificar que la sesión esté activa
    if not session.is_active:
        return Response({
            'error': 'Esta sesión de asistencia no está activa'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Obtener el estudiante
    if request.user.role == 'instructor':
        student = get_object_or_404(User, id=student_id, role='student')
    else:
        student = request.user
    
    # Verificar que el estudiante esté inscrito en el curso
    if student not in session.course.students.all():
        return Response({
            'error': 'El estudiante no está inscrito en este curso'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Buscar o crear registro de asistencia
    attendance, created = Attendance.objects.get_or_create(
        session=session,
        student=student,
        defaults={
            'status': status_attendance,
            'verified_by_face': verified_by_face,
            'check_in_time': timezone.now() if status_attendance == 'present' else None
        }
    )
    
    if not created:
        # Actualizar registro existente
        attendance.status = status_attendance
        attendance.verified_by_face = verified_by_face
        if status_attendance == 'present':
            attendance.check_in_time = timezone.now()
        attendance.save()
    
    serializer = AttendanceSerializer(attendance)
    return Response({
        'message': 'Asistencia marcada correctamente',
        'attendance': serializer.data
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_attendance(request):
    """Obtener asistencias del usuario autenticado"""
    if request.user.role != 'student':
        return Response({
            'error': 'Solo los estudiantes pueden ver sus asistencias'
        }, status=status.HTTP_403_FORBIDDEN)
    
    course_id = request.query_params.get('course_id')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    
    attendances = Attendance.objects.filter(student=request.user)
    
    if course_id:
        attendances = attendances.filter(session__course_id=course_id)
    
    if date_from:
        attendances = attendances.filter(session__date__gte=date_from)
    
    if date_to:
        attendances = attendances.filter(session__date__lte=date_to)
    
    attendances = attendances.order_by('-session__date', '-session__start_time')
    serializer = AttendanceSerializer(attendances, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_report(request, session_id):
    """Reporte de asistencia de una sesión (solo instructores)"""
    if request.user.role != 'instructor':
        return Response({
            'error': 'Solo los instructores pueden ver reportes de asistencia'
        }, status=status.HTTP_403_FORBIDDEN)
    
    session = get_object_or_404(AttendanceSession, id=session_id, course__instructor=request.user)
    attendances = Attendance.objects.filter(session=session).select_related('student')
    
    serializer = AttendanceSerializer(attendances, many=True)
    
    # Estadísticas
    total_students = attendances.count()
    present_count = attendances.filter(status='present').count()
    absent_count = attendances.filter(status='absent').count()
    late_count = attendances.filter(status='late').count()
    excused_count = attendances.filter(status='excused').count()
    
    return Response({
        'session': AttendanceSessionSerializer(session).data,
        'attendances': serializer.data,
        'stats': {
            'total_students': total_students,
            'present': present_count,
            'absent': absent_count,
            'late': late_count,
            'excused': excused_count,
            'attendance_rate': (present_count / total_students * 100) if total_students > 0 else 0
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_stats(request):
    """Estadísticas de asistencia"""
    course_id = request.query_params.get('course_id')
    
    if request.user.role == 'student':
        # Estadísticas del estudiante
        attendances = Attendance.objects.filter(student=request.user)
        if course_id:
            attendances = attendances.filter(session__course_id=course_id)
        
        total = attendances.count()
        present = attendances.filter(status='present').count()
        absent = attendances.filter(status='absent').count()
        late = attendances.filter(status='late').count()
        excused = attendances.filter(status='excused').count()
        
        return Response({
            'total_sessions': total,
            'present': present,
            'absent': absent,
            'late': late,
            'excused': excused,
            'attendance_rate': (present / total * 100) if total > 0 else 0
        })
    
    elif request.user.role == 'instructor':
        # Estadísticas del instructor
        courses = request.user.courses.all()
        if course_id:
            courses = courses.filter(id=course_id)
        
        sessions = AttendanceSession.objects.filter(course__in=courses)
        attendances = Attendance.objects.filter(session__in=sessions)
        
        total_sessions = sessions.count()
        total_attendances = attendances.count()
        present = attendances.filter(status='present').count()
        absent = attendances.filter(status='absent').count()
        
        return Response({
            'total_courses': courses.count(),
            'total_sessions': total_sessions,
            'total_attendances': total_attendances,
            'present': present,
            'absent': absent,
            'overall_attendance_rate': (present / total_attendances * 100) if total_attendances > 0 else 0
        })