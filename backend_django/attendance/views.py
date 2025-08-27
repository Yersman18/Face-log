# attendance/views.py
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from .models import Course, AttendanceSession, Attendance
from .serializers import (
    CourseSerializer, AttendanceSessionSerializer, 
    AttendanceSerializer, AttendanceSessionCreateSerializer
)

from django.contrib.auth import get_user_model
User = get_user_model()


class IsInstructorPermission(permissions.BasePermission):
    """Permiso personalizado para instructores"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_instructor()

class IsStudentPermission(permissions.BasePermission):
    """Permiso personalizado para estudiantes"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student()

# ===============================
# VIEWS PARA CURSOS
# ===============================

class CourseListCreateView(generics.ListCreateAPIView):
    """Lista y crea cursos"""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_instructor():
            return Course.objects.filter(instructor=user)
        elif user.is_student():
            # Estudiantes ven cursos de su ficha
            try:
                student_profile = user.student_profile
                return Course.objects.filter(fichas=student_profile.ficha)
            except:
                return Course.objects.none()
        return Course.objects.all()
    
    def perform_create(self, serializer):
        # Solo instructores pueden crear cursos
        if not self.request.user.is_instructor():
            raise permissions.PermissionDenied("Solo los instructores pueden crear cursos")
        serializer.save(instructor=self.request.user)

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalle, actualización y eliminación de cursos"""
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_instructor():
            return Course.objects.filter(instructor=user)
        return Course.objects.all()

# ===============================
# VIEWS PARA SESIONES DE ASISTENCIA
# ===============================

class AttendanceSessionListCreateView(generics.ListCreateAPIView):
    """Lista y crea sesiones de asistencia"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AttendanceSessionCreateSerializer
        return AttendanceSessionSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_instructor():
            return AttendanceSession.objects.filter(course__instructor=user).order_by('-date', '-start_time')
        elif user.is_student():
            try:
                student_profile = user.student_profile
                return AttendanceSession.objects.filter(
                    course__fichas=student_profile.ficha
                ).order_by('-date', '-start_time')
            except:
                return AttendanceSession.objects.none()
        return AttendanceSession.objects.all()
    
    def perform_create(self, serializer):
        if not self.request.user.is_instructor():
            raise permissions.PermissionDenied("Solo los instructores pueden crear sesiones")
        serializer.save()

class AttendanceSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detalle de sesión de asistencia"""
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_instructor():
            return AttendanceSession.objects.filter(course__instructor=user)
        return AttendanceSession.objects.all()

@api_view(['POST'])
@permission_classes([IsInstructorPermission])
def start_attendance_session(request, session_id):
    """Inicia una sesión de asistencia"""
    session = get_object_or_404(
        AttendanceSession, 
        id=session_id, 
        course__instructor=request.user
    )
    
    if session.attendance_started:
        return Response({
            'error': 'La sesión de asistencia ya fue iniciada'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    session.start_attendance()
    
    return Response({
        'message': 'Sesión de asistencia iniciada correctamente',
        'session_id': session.id,
        'started_at': session.attendance_started_at,
        'students_count': session.course.get_students_count()
    })

@api_view(['POST'])
@permission_classes([IsInstructorPermission])
def close_attendance_session(request, session_id):
    """Cierra una sesión de asistencia"""
    session = get_object_or_404(
        AttendanceSession,
        id=session_id,
        course__instructor=request.user
    )
    
    if session.attendance_closed:
        return Response({
            'error': 'La sesión de asistencia ya fue cerrada'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not session.attendance_started:
        return Response({
            'error': 'La sesión de asistencia no ha sido iniciada'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    session.close_attendance()
    summary = session.get_attendance_summary()
    
    return Response({
        'message': 'Sesión de asistencia cerrada correctamente',
        'session_id': session.id,
        'closed_at': session.attendance_closed_at,
        'summary': summary
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def session_attendance_summary(request, session_id):
    """Obtiene resumen de asistencia de una sesión"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Verificar permisos
    user = request.user
    if user.is_instructor():
        if session.course.instructor != user:
            return Response({
                'error': 'No tienes permisos para ver esta sesión'
            }, status=status.HTTP_403_FORBIDDEN)
    elif user.is_student():
        try:
            student_profile = user.student_profile
            if not session.course.fichas.filter(id=student_profile.ficha.id).exists():
                return Response({
                    'error': 'No tienes permisos para ver esta sesión'
                }, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({
                'error': 'Perfil de estudiante no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)
    
    summary = session.get_attendance_summary()
    attendances = session.attendances.select_related('student', 'student__student_profile').all()
    
    attendance_data = []
    for attendance in attendances:
        student_info = attendance.get_student_info()
        attendance_data.append({
            'id': attendance.id,
            'student': {
                'id': attendance.student.id,
                'name': student_info['name'],
                'document': student_info.get('document', 'N/A'),
                'ficha': student_info.get('ficha', 'N/A'),
            },
            'status': attendance.status,
            'status_display': attendance.get_status_display(),
            'check_in_time': attendance.check_in_time,
            'verified_by_face': attendance.verified_by_face,
            'face_confidence_score': attendance.face_confidence_score,
            'duration_minutes': attendance.get_duration_minutes(),
        })
    
    return Response({
        'session': {
            'id': session.id,
            'course': session.course.name,
            'date': session.date,
            'start_time': session.start_time,
            'end_time': session.end_time,
            'is_active': session.is_active,
            'attendance_started': session.attendance_started,
            'attendance_closed': session.attendance_closed,
        },
        'summary': summary,
        'attendances': attendance_data
    })

# ===============================
# VIEWS PARA ASISTENCIA
# ===============================

class AttendanceListView(generics.ListAPIView):
    """Lista asistencias"""
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Attendance.objects.select_related(
            'session', 'session__course', 'student'
        ).order_by('-session__date', '-session__start_time')
        
        if user.is_instructor():
            queryset = queryset.filter(session__course__instructor=user)
        elif user.is_student():
            queryset = queryset.filter(student=user)
        
        # Filtros opcionales
        session_id = self.request.query_params.get('session_id')
        course_id = self.request.query_params.get('course_id')
        status_filter = self.request.query_params.get('status')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if course_id:
            queryset = queryset.filter(session__course_id=course_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if date_from:
            queryset = queryset.filter(session__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(session__date__lte=date_to)
            
        return queryset

@api_view(['PUT'])
@permission_classes([IsInstructorPermission])
def update_attendance(request, attendance_id):
    """Actualiza manualmente una asistencia (solo instructores)"""
    attendance = get_object_or_404(
        Attendance,
        id=attendance_id,
        session__course__instructor=request.user
    )
    
    new_status = request.data.get('status')
    reason = request.data.get('reason', '')
    
    if new_status not in ['present', 'absent', 'late', 'excused']:
        return Response({
            'error': 'Estado inválido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    old_status = attendance.status
    attendance.status = new_status
    attendance.manual_override = True
    attendance.override_reason = reason
    attendance.modified_by = request.user
    
    # Si se marca como presente/tarde, establecer check_in_time si no existe
    if new_status in ['present', 'late'] and not attendance.check_in_time:
        attendance.check_in_time = timezone.now()
    elif new_status in ['absent', 'excused']:
        attendance.check_in_time = None
        attendance.verified_by_face = False
        attendance.face_confidence_score = None
    
    attendance.save()
    
    return Response({
        'message': f'Asistencia actualizada de {old_status} a {new_status}',
        'attendance': {
            'id': attendance.id,
            'status': attendance.status,
            'status_display': attendance.get_status_display(),
            'manual_override': attendance.manual_override,
            'override_reason': attendance.override_reason,
            'check_in_time': attendance.check_in_time
        }
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_attendance_history(request):
    """Historial de asistencia del estudiante autenticado"""
    if not request.user.is_student():
        return Response({
            'error': 'Solo disponible para estudiantes'
        }, status=status.HTTP_403_FORBIDDEN)
    
    attendances = Attendance.objects.filter(
        student=request.user
    ).select_related(
        'session', 'session__course'
    ).order_by('-session__date', '-session__start_time')
    
    # Paginación manual simple
    page_size = 20
    page = int(request.query_params.get('page', 1))
    start = (page - 1) * page_size
    end = start + page_size
    
    paginated_attendances = attendances[start:end]
    
    data = []
    for attendance in paginated_attendances:
        data.append({
            'id': attendance.id,
            'course': {
                'name': attendance.session.course.name,
                'code': attendance.session.course.code,
            },
            'session': {
                'date': attendance.session.date,
                'start_time': attendance.session.start_time,
                'end_time': attendance.session.end_time,
            },
            'status': attendance.status,
            'status_display': attendance.get_status_display(),
            'check_in_time': attendance.check_in_time,
            'verified_by_face': attendance.verified_by_face,
            'duration_minutes': attendance.get_duration_minutes(),
        })
    
    # Estadísticas generales
    try:
        stats = request.user.student_profile.get_attendance_stats()
    except:
        stats = {}
    
    return Response({
        'attendances': data,
        'stats': stats,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': attendances.count(),
            'has_next': attendances.count() > end
        }
    })

# ===============================
# VIEWS PARA ESTADÍSTICAS
# ===============================

@api_view(['GET'])
@permission_classes([IsInstructorPermission])
def instructor_dashboard(request):
    """Dashboard con estadísticas para instructores"""
    instructor = request.user
    
    # Cursos del instructor
    courses = Course.objects.filter(instructor=instructor)
    total_courses = courses.count()
    active_courses = courses.filter(is_active=True).count()
    
    # Estudiantes
    total_students = 0
    for course in courses:
        total_students += course.get_students_count()
    
    # Sesiones
    sessions = AttendanceSession.objects.filter(course__instructor=instructor)
    total_sessions = sessions.count()
    active_sessions = sessions.filter(is_active=True).count()
    
    # Asistencias recientes
    recent_attendances = Attendance.objects.filter(
        session__course__instructor=instructor
    ).select_related('student', 'session', 'session__course').order_by('-created_at')[:10]
    
    recent_data = []
    for attendance in recent_attendances:
        student_info = attendance.get_student_info()
        recent_data.append({
            'student_name': student_info['name'],
            'course': attendance.session.course.name,
            'date': attendance.session.date,
            'status': attendance.get_status_display(),
            'verified_by_face': attendance.verified_by_face
        })
    
    return Response({
        'summary': {
            'total_courses': total_courses,
            'active_courses': active_courses,
            'total_students': total_students,
            'total_sessions': total_sessions,
            'active_sessions': active_sessions,
        },
        'recent_attendances': recent_data
    })

@api_view(['GET'])
@permission_classes([IsStudentPermission])
def student_dashboard(request):
    """Dashboard con estadísticas para estudiantes"""
    try:
        student_profile = request.user.student_profile
        stats = student_profile.get_attendance_stats()
        courses = student_profile.get_courses()
        
        # Próximas sesiones
        upcoming_sessions = AttendanceSession.objects.filter(
            course__fichas=student_profile.ficha,
            date__gte=timezone.now().date()
        ).order_by('date', 'start_time')[:5]
        
        upcoming_data = []
        for session in upcoming_sessions:
            upcoming_data.append({
                'id': session.id,
                'course': session.course.name,
                'date': session.date,
                'start_time': session.start_time,
                'end_time': session.end_time,
                'is_active': session.is_active
            })
        
        return Response({
            'student_info': {
                'name': student_profile.get_full_name(),
                'document': student_profile.documento,
                'ficha': student_profile.ficha.numero,
                'ficha_name': student_profile.ficha.nombre,
                'estado_academico': student_profile.get_estado_academico_display(),
            },
            'attendance_stats': stats,
            'courses': [{'id': c.id, 'name': c.name, 'code': c.code} for c in courses],
            'upcoming_sessions': upcoming_data
        })
        
    except Exception as e:
        return Response({
            'error': 'Error obteniendo información del estudiante',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)