# facelog/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # apps
    path('api/auth/', include('authentication.urls')),
    path('api/attendance/', include('attendance.urls')),
    path('api/excuses/', include('excuses.urls')),
    path('api/face-recognition/', include('face_recognition_app.urls')),

    # JWT refresh
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

#HOLAAAAA
