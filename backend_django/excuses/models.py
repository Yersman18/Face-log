from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth import get_user_model
from attendance.models import AttendanceSession

User = get_user_model()

class Excuse(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('approved', 'Aprobada'),
        ('rejected', 'Rechazada'),
    ]
    
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE)
    reason = models.TextField()
    document = models.FileField(upload_to='excuses/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_excuses')
    review_comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['student', 'session']
    
    def __str__(self):
        return f"{self.student.username} - {self.session} - {self.status}"