# attendance/serializers.py
from rest_framework import serializers
from .models import Course, AttendanceSession, Attendance
from authentication.serializers import UserSerializer

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    students = UserSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'instructor', 'students', 'student_count', 'created_at']
        read_only_fields = ['id', 'instructor', 'created_at']
    
    def get_student_count(self, obj):
        return obj.students.count()

class AttendanceSessionSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    attendance_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSession
        fields = ['id', 'course', 'date', 'start_time', 'end_time', 'is_active', 'attendance_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_attendance_count(self, obj):
        return obj.attendance_set.count()

class CreateAttendanceSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = ['course', 'date', 'start_time', 'end_time', 'is_active']
    
    def validate(self, data):
        # Verificar que no exista otra sesión en el mismo horario
        course = data['course']
        date = data['date']
        start_time = data['start_time']
        end_time = data['end_time']
        
        if start_time >= end_time:
            raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de fin")
        
        # Buscar sesiones que se traslapen
        overlapping_sessions = AttendanceSession.objects.filter(
            course=course,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time
        )
        
        if overlapping_sessions.exists():
            raise serializers.ValidationError("Ya existe una sesión en este horario")
        
        return data

class AttendanceSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    session = AttendanceSessionSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'session', 'status', 'status_display', 'check_in_time', 'verified_by_face', 'created_at']
        read_only_fields = ['id', 'created_at']

class AttendanceStatsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    excused = serializers.IntegerField()
    attendance_rate = serializers.FloatField()