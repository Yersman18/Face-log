# attendance/admin.py
from django.contrib import admin
from .models import Course, AttendanceSession, Attendance

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'instructor', 'get_fichas', 'student_count', 'is_active', 'created_at']
    list_filter = ['instructor', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'instructor__username', 'instructor__first_name', 'instructor__last_name']
    ordering = ['-created_at']
    filter_horizontal = ['fichas']  # Para una mejor interfaz en ManyToMany
    
    def get_fichas(self, obj):
        """Devuelve los números de ficha asociados al curso"""
        return ", ".join([f.numero for f in obj.fichas.all()[:5]])  # Limita a 5 para no sobrecargar
    get_fichas.short_description = 'Fichas'

    def student_count(self, obj):
        """Cuenta total de estudiantes en el curso"""
        return obj.get_students_count()
    student_count.short_description = 'Total Estudiantes'


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = [
        'course', 'date', 'start_time', 'end_time', 
        'is_active', 'attendance_started', 'attendance_closed', 
        'attendance_count', 'created_at'
    ]
    list_filter = [
        'course', 'date', 'is_active', 
        'attendance_started', 'attendance_closed', 'created_at'
    ]
    search_fields = ['course__name', 'course__code', 'course__instructor__username']
    ordering = ['-date', '-start_time']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('course', 'date', 'start_time', 'end_time')
        }),
        ('Control de Sesión', {
            'fields': (
                'is_active', 'attendance_started', 'attendance_closed',
                'late_tolerance_minutes'
            )
        }),
        ('Metadatos', {
            'fields': ('attendance_started_at', 'attendance_closed_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['attendance_started_at', 'attendance_closed_at']
    
    def attendance_count(self, obj):
        """Cuenta total de registros de asistencia"""
        return obj.attendances.count()
    attendance_count.short_description = 'Registros Asistencia'

    actions = ['start_attendance_action', 'close_attendance_action']
    
    def start_attendance_action(self, request, queryset):
        """Acción para iniciar toma de asistencia en sesiones seleccionadas"""
        count = 0
        for session in queryset:
            if not session.attendance_started:
                session.start_attendance()
                count += 1
        
        self.message_user(
            request, 
            f"Se inició la toma de asistencia en {count} sesión(es)."
        )
    start_attendance_action.short_description = "Iniciar toma de asistencia"
    
    def close_attendance_action(self, request, queryset):
        """Acción para cerrar toma de asistencia en sesiones seleccionadas"""
        count = 0
        for session in queryset:
            if session.attendance_started and not session.attendance_closed:
                session.close_attendance()
                count += 1
        
        self.message_user(
            request, 
            f"Se cerró la toma de asistencia en {count} sesión(es)."
        )
    close_attendance_action.short_description = "Cerrar toma de asistencia"


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        'get_student_name', 'get_student_document', 'get_course', 
        'get_session_date', 'status', 'check_in_time', 
        'verified_by_face', 'manual_override'
    ]
    list_filter = [
        'status', 'verified_by_face', 'manual_override',
        'session__course', 'session__date', 'session__is_active'
    ]
    search_fields = [
        'student__username', 'student__first_name', 'student__last_name',
        'session__course__name', 'session__course__code'
    ]
    ordering = ['-session__date', '-session__start_time', 'student__last_name']
    date_hierarchy = 'session__date'
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('session', 'student', 'status')
        }),
        ('Registro de Tiempo', {
            'fields': ('check_in_time',)
        }),
        ('Verificación Facial', {
            'fields': ('verified_by_face', 'face_confidence_score'),
            'classes': ('collapse',)
        }),
        ('Modificaciones Manuales', {
            'fields': ('manual_override', 'override_reason', 'modified_by'),
            'classes': ('collapse',)
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def get_student_name(self, obj):
        """Nombre completo del estudiante"""
        return obj.student.get_full_name()
    get_student_name.short_description = 'Estudiante'
    get_student_name.admin_order_field = 'student__last_name'
    
    def get_student_document(self, obj):
        """Documento del estudiante"""
        info = obj.get_student_info()
        return info.get('document', 'N/A')
    get_student_document.short_description = 'Documento'
    
    def get_course(self, obj):
        """Curso de la sesión"""
        return f"{obj.session.course.code} - {obj.session.course.name}"
    get_course.short_description = 'Curso'
    get_course.admin_order_field = 'session__course__code'
    
    def get_session_date(self, obj):
        """Fecha de la sesión"""
        return obj.session.date
    get_session_date.short_description = 'Fecha Sesión'
    get_session_date.admin_order_field = 'session__date'

    # Acciones personalizadas
    actions = ['mark_present_action', 'mark_absent_action', 'mark_excused_action']
    
    def mark_present_action(self, request, queryset):
        """Marca como presente a los estudiantes seleccionados"""
        count = 0
        for attendance in queryset:
            attendance.mark_present()
            count += 1
        
        self.message_user(
            request, 
            f"{count} estudiante(s) marcado(s) como presente."
        )
    mark_present_action.short_description = "Marcar como presente"
    
    def mark_absent_action(self, request, queryset):
        """Marca como ausente a los estudiantes seleccionados"""
        count = 0
        for attendance in queryset:
            attendance.mark_absent()
            count += 1
        
        self.message_user(
            request, 
            f"{count} estudiante(s) marcado(s) como ausente."
        )
    mark_absent_action.short_description = "Marcar como ausente"
    
    def mark_excused_action(self, request, queryset):
        """Marca como excusado a los estudiantes seleccionados"""
        count = 0
        for attendance in queryset:
            attendance.mark_excused()
            count += 1
        
        self.message_user(
            request, 
            f"{count} estudiante(s) marcado(s) como excusado."
        )
    mark_excused_action.short_description = "Marcar como excusado"