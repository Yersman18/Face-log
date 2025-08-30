# backend_django/attendance/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


# ===============================
# MODELO FICHA
# ===============================
class Ficha(models.Model):
    numero = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.numero


# ===============================
# PERFIL DE ESTUDIANTE
# ===============================
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    documento = models.CharField(max_length=50, unique=True)
    ficha = models.ForeignKey(Ficha, on_delete=models.SET_NULL, null=True, blank=True)
    estado_academico = models.CharField(
        max_length=20,
        choices=[("activo", "Activo"), ("inactivo", "Inactivo"), ("graduado", "Graduado")],
        default="activo"
    )

    def __str__(self):
        return f"{self.user.username} - {self.documento}"

    def get_full_name(self):
        return self.user.get_full_name() or self.user.username

    def get_estado_academico_display(self):
        mapping = {
            "activo": "Activo",
            "inactivo": "Inactivo",
            "graduado": "Graduado"
        }
        return mapping.get(self.estado_academico, "Desconocido")

    def get_courses(self):
        if self.ficha:
            return Course.objects.filter(fichas=self.ficha)
        return Course.objects.none()

    def get_attendance_stats(self):
        attendances = Attendance.objects.filter(student=self.user)
        total_sessions = attendances.count()
        stats = {
            "total_sessions": total_sessions,
            "present": attendances.filter(status="present").count(),
            "absent": attendances.filter(status="absent").count(),
            "late": attendances.filter(status="late").count(),
            "excused": attendances.filter(status="excused").count(),
        }
        stats["attendance_rate"] = (
            (stats["present"] + stats["late"]) / total_sessions * 100
            if total_sessions > 0 else 0
        )
        return stats


# ===============================
# CURSOS
# ===============================
class Course(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")
    students = models.ManyToManyField(User, related_name="enrolled_courses", blank=True)
    fichas = models.ManyToManyField(Ficha, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    def get_students_count(self):
        return self.students.count()


# ===============================
# SESIONES DE ASISTENCIA
# ===============================
class AttendanceSession(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    attendance_started_at = models.DateTimeField(null=True, blank=True)
    attendance_closed_at = models.DateTimeField(null=True, blank=True)
    late_tolerance_minutes = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["course", "date", "start_time"]

    def __str__(self):
        return f"{self.course.code} - {self.date}"

    @property
    def attendance_started(self):
        return self.attendance_started_at is not None

    @property
    def attendance_closed(self):
        return self.attendance_closed_at is not None

    def start_attendance(self):
        from django.utils.timezone import now
        if not self.attendance_started:
            self.attendance_started_at = now()
            self.save()

    def close_attendance(self):
        from django.utils.timezone import now
        if not self.attendance_closed:
            self.attendance_closed_at = now()
            self.save()


# ===============================
# ASISTENCIA
# ===============================
class Attendance(models.Model):
    STATUS_CHOICES = [
        ("present", "Presente"),
        ("absent", "Ausente"),
        ("late", "Tardanza"),
        ("excused", "Excusado"),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name="attendances")
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="absent")
    check_in_time = models.DateTimeField(null=True, blank=True)
    verified_by_face = models.BooleanField(default=False)
    manual_override = models.BooleanField(default=False)
    override_reason = models.TextField(blank=True, null=True)
    modified_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="modified_attendances"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["session", "student"]

    def __str__(self):
        return f"{self.student.username} - {self.session} - {self.status}"

    def get_student_info(self):
        profile = getattr(self.student, "student_profile", None)
        return {
            "name": self.student.get_full_name() or self.student.username,
            "document": profile.documento if profile else "N/A",
            "ficha": profile.ficha.numero if profile and profile.ficha else "N/A",
        }
