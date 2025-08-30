# backend_django/attendance/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Course, AttendanceSession, Attendance, StudentProfile

User = get_user_model()


# ===============================
# SERIALIZER PERFIL DE ESTUDIANTE
# ===============================
class StudentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    ficha_numero = serializers.CharField(source="ficha.numero", read_only=True)

    class Meta:
        model = StudentProfile
        fields = ["id", "user", "documento", "ficha_numero", "estado_academico"]


# ===============================
# SERIALIZER CURSOS
# ===============================
class CourseSerializer(serializers.ModelSerializer):
    instructor = serializers.StringRelatedField(read_only=True)
    students = serializers.StringRelatedField(many=True, read_only=True)
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "name", "code",
                  "is_active", 
                  "instructor", "students", 
                  "students_count", "created_at"]

    def get_students_count(self, obj):
        return obj.students.count()


# ===============================
# SERIALIZER SESIONES DE ASISTENCIA
# ===============================
class AttendanceSessionSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)
    course_code = serializers.CharField(source="course.code", read_only=True)
    instructor_name = serializers.SerializerMethodField()

    class Meta:
        model = AttendanceSession
        fields = [
            "id", "course", "course_name", "course_code",
            "instructor_name", "date", "start_time", "end_time",
            "is_active", "created_at"
        ]

    def get_instructor_name(self, obj):
        return obj.course.instructor.get_full_name() or obj.course.instructor.username


class AttendanceSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceSession
        fields = ["course", "date", "start_time", "end_time", "is_active"]

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("La hora de inicio debe ser anterior a la hora de fin")
        return data


# ===============================
# SERIALIZER ASISTENCIA
# ===============================
class AttendanceSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    session = serializers.PrimaryKeyRelatedField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id", "student", "session", "status", "status_display",
            "check_in_time", "verified_by_face", "created_at"
        ]


# ===============================
# SERIALIZER ESTADÍSTICAS
# ===============================
class AttendanceStatsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    excused = serializers.IntegerField()
    attendance_rate = serializers.FloatField()
