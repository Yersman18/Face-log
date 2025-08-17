# attendance/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Cursos
    path('courses/', views.courses, name='courses'),
    path('courses/<int:course_id>/', views.course_detail, name='course_detail'),
    path('courses/<int:course_id>/enroll/', views.enroll_student, name='enroll_student'),
    
    # Sesiones de asistencia
    path('sessions/', views.attendance_sessions, name='attendance_sessions'),
    path('sessions/<int:session_id>/', views.attendance_session_detail, name='attendance_session_detail'),
    path('sessions/<int:session_id>/report/', views.attendance_report, name='attendance_report'),
    
    # Asistencia
    path('mark/', views.mark_attendance, name='mark_attendance'),
    path('my-attendance/', views.my_attendance, name='my_attendance'),
    path('stats/', views.attendance_stats, name='attendance_stats'),
]