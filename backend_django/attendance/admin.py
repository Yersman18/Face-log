# attendance/admin.py
from django.contrib import admin
from .models import Course, AttendanceSession, Attendance

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'instructor', 'student_count', 'created_at']
    list_filter = ['instructor', 'created_at']
    search_fields = ['name', 'code', 'instructor__username']
    filter_horizontal = ['students']
    ordering = ['-created_at']
    
    def student_count(self, obj):
        return obj.students.count()
    student_count.short_description = 'Estudiantes'

@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['course', 'date', 'start_time', 'end_time', 'is_active', 'attendance_count']
    list_filter = ['course', 'date', 'is_active', 'created_at']
    search_fields = ['course__name', 'course__code']
    ordering = ['-date', '-start_time']
    
    def attendance_count(self, obj):
        return obj.attendance_set.count()
    attendance_count.short_description = 'Asistencias'

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'session', 'status', 'check_in_time', 'verified_by_face', 'created_at']
    list_filter = ['status', 'verified_by_face', 'session__course', 'session__date']
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'session__course__name']
    ordering = ['-session__date', '-session__start_time']
    readonly_fields = ['created_at']