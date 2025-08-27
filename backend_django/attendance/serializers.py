# attendance/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, AttendanceSession, Attendance
from authentication.models import Ficha, Student

User = get_user_model()

class FichaSerializer(serializers.ModelSerializer):
    """Serializer para fichas"""
    estudiantes_count = serializers.SerializerMethodField()
    program_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Ficha
        fields = [
            'id', 'numero', 'nombre', 'descripcion', 'tipo_programa',
            'duracion_meses', 'fecha_inicio', 'fecha_fin', 'is_active',
            'max_estudiantes', 'estudiantes_count', 'program_progress'
        ]
        read_only_fields = ['estudiantes_count', 'program_progress']
    
    def get_estudiantes_count(self, obj):
        return obj.get_estudiantes_count()
    
    def get_program_progress(self, obj):
        return obj.get_program_progress()

class StudentBasicSerializer(serializers.ModelSerializer):
    """Serializer básico para información de estudiantes"""
    name = serializers.SerializerMethodField()
    ficha_numero = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'name', 'ficha_numero']
    
    def get_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_ficha_numero(self, obj):
        try:
            return obj.student_profile.numero_ficha
        except:
            return 'N/A'

class CourseSerializer(serializers.ModelSerializer):
    """Serializer para cursos"""
    instructor_name = serializers.SerializerMethodField()
    fichas_info = FichaSerializer(source='fichas', many=True, read_only=True)
    students_count = serializers.SerializerMethodField()
    sessions_count = serializers.SerializerMethodField()
    fichas_ids = serializers.PrimaryKeyRelatedField(
        queryset=Ficha.objects.all(),
        many=True,
        write_only=True,
        source='fichas'
    )
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'description', 'instructor', 'instructor_name',
            'fichas_info', 'fichas_ids', 'hours_per_session', 'is_active',
            'students_count', 'sessions_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['instructor', 'instructor_name', 'students_count', 'sessions_count']
    
    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() or obj.instructor.username
    
    def get_students_count(self, obj):
        return obj.get_students_count()
    
    def get_sessions_count(self, obj):
        return obj.sessions.count()
    
    def validate_fichas_ids(self, value):
        """Validar que las fichas existan y estén activas"""
        if not value:
            raise serializers.ValidationError("Debe seleccionar al menos una ficha")
        
        inactive_fichas = [f for f in value if not f.is_active]
        if inactive_fichas:
            raise serializers.ValidationError(
                f"Las siguientes fichas están inactivas: {[f.numero for f in inactive_fichas]}"
            )
        
        return value

class AttendanceSessionSerializer(serializers.ModelSerializer):
    """Serializer para sesiones de asistencia"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_code = serializers.CharField(source='course.code', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    attendance_summary = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSession
        fields = [
            'id', 'course', 'course_name', 'course_code', 'instructor_name',
            'date', 'start_time', 'end_time', 'is_active', 'attendance_started',
            'attendance_closed', 'late_tolerance_minutes', 'attendance_summary',
            'created_at', 'attendance_started_at', 'attendance_closed_at'
        ]
        read_only_fields = [
            'attendance_started', 'attendance_closed', 'attendance_started_at',
            'attendance_closed_at', 'attendance_summary'
        ]
    
    def get_instructor_name(self, obj):
        return obj.course.instructor.get_full_name() or obj.course.instructor.username
    
    def get_attendance_summary(self, obj):
        return obj.get_attendance_summary()

class AttendanceSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear sesiones de asistencia"""
    
    class Meta:
        model = AttendanceSession
        fields = [
            'course', 'date', 'start_time', 'end_time',
            'late_tolerance_minutes'
        ]
    
    def validate(self, data):
        """Validaciones para la creación de sesiones"""
        # Validar que el instructor sea dueño del curso
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            course = data.get('course')
            if course and course.instructor != request.user:
                raise serializers.ValidationError(
                    "No puedes crear sesiones para cursos que no dictas"
                )
        
        # Validar que start_time < end_time
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError(
                "La hora de inicio debe ser anterior a la hora de fin"
            )
        
        # Validar que no haya conflictos de horario
        course = data.get('course')
        date = data.get('date')
        if course and date and start_time:
            existing_session = AttendanceSession.objects.filter(
                course=course,
                date=date,
                start_time=start_time
            ).exists()
            
            if existing_session:
                raise serializers.ValidationError(
                    "Ya existe una sesión para este curso en esta fecha y hora"
                )
        
        return data

class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer para asistencias"""
    student_info = serializers.SerializerMethodField()
    session_info = serializers.SerializerMethodField()
    course_info = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'session', 'student', 'student_info', 'session_info',
            'course_info', 'status', 'status_display', 'check_in_time',
            'verified_by_face', 'face_confidence_score', 'manual_override',
            'override_reason', 'modified_by', 'duration_minutes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'student_info', 'session_info', 'course_info', 'duration_minutes'
        ]
    
    def get_student_info(self, obj):
        return obj.get_student_info()
    
    def get_session_info(self, obj):
        return {
            'id': obj.session.id,
            'date': obj.session.date,
            'start_time': obj.session.start_time,
            'end_time': obj.session.end_time,
        }
    
    def get_course_info(self, obj):
        return {
            'id': obj.session.course.id,
            'name': obj.session.course.name,
            'code': obj.session.course.code,
        }
    
    def get_duration_minutes(self, obj):
        return obj.get_duration_minutes()

class AttendanceUpdateSerializer(serializers.ModelSerializer):
    """Serializer para actualizar asistencias (uso de instructores)"""
    reason = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Attendance
        fields = ['status', 'reason']
    
    def validate_status(self, value):
        """Validar estado de asistencia"""
        valid_statuses = ['present', 'absent', 'late', 'excused']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Estado debe ser uno de: {valid_statuses}")
        return value

class AttendanceStatsSerializer(serializers.Serializer):
    """Serializer para estadísticas de asistencia"""
    total_sessions = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    excused = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
    
class StudentDashboardSerializer(serializers.Serializer):
    """Serializer para dashboard de estudiantes"""
    student_info = serializers.DictField()
    attendance_stats = AttendanceStatsSerializer()
    courses = serializers.ListField()
    upcoming_sessions = serializers.ListField()

class InstructorDashboardSerializer(serializers.Serializer):
    """Serializer para dashboard de instructores"""
    summary = serializers.DictField()
    recent_attendances = serializers.ListField()

# Serializers para reportes
class AttendanceReportSerializer(serializers.Serializer):
    """Serializer para reportes de asistencia"""
    course_id = serializers.IntegerField(required=False)
    ficha_numero = serializers.CharField(required=False, max_length=20)
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    status = serializers.ChoiceField(
        choices=['present', 'absent', 'late', 'excused'],
        required=False
    )
    export_format = serializers.ChoiceField(
        choices=['json', 'csv', 'excel'],
        default='json'
    )
    
    def validate(self, data):
        """Validaciones para reportes"""
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        
        if date_from and date_to and date_from > date_to:
            raise serializers.ValidationError(
                "La fecha de inicio debe ser anterior a la fecha de fin"
            )
        
        return data

class SessionAttendanceReportSerializer(serializers.Serializer):
    """Serializer para reporte de asistencia por sesión"""
    session_id = serializers.IntegerField()
    include_student_details = serializers.BooleanField(default=True)
    include_face_verification = serializers.BooleanField(default=True)
    export_format = serializers.ChoiceField(
        choices=['json', 'csv', 'excel'],
        default='json'
    )