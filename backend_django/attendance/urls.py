# attendance/urls.py
from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    # Cursos
    path('courses/', views.CourseListCreateView.as_view(), name='course-list-create'),
    path('courses/<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path("courses/<int:pk>/toggle/", views.toggle_course, name="course-toggle"),  # 👈 aquí
    
    # Sesiones de asistencia
    path('sessions/', views.AttendanceSessionListCreateView.as_view(), name='session-list-create'),
    path('sessions/<int:pk>/', views.AttendanceSessionDetailView.as_view(), name='session-detail'),
    path('sessions/<int:session_id>/start/', views.start_attendance_session, name='start-session'),
    path('sessions/<int:session_id>/close/', views.close_attendance_session, name='close-session'),
    path('sessions/<int:session_id>/summary/', views.session_attendance_summary, name='session-summary'),
    
    # Asistencias
    path('attendances/', views.AttendanceListView.as_view(), name='attendance-list'),
    path('attendances/<int:attendance_id>/update/', views.update_attendance, name='update-attendance'),
    
    # Dashboards
    path('instructor/dashboard/', views.instructor_dashboard, name='instructor-dashboard'),
    path('student/dashboard/', views.student_dashboard, name='student-dashboard'),
    path('student/history/', views.student_attendance_history, name='student-history'),
]