# excuses/serializers.py
from rest_framework import serializers
from .models import Excuse
from attendance.serializers import AttendanceSessionSerializer
from authentication.serializers import UserSerializer

class ExcuseSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    session = AttendanceSessionSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Excuse
        fields = ['id', 'student', 'session', 'reason', 'document', 'status', 'status_display', 
                 'reviewed_by', 'review_comment', 'created_at', 'reviewed_at']
        read_only_fields = ['id', 'student', 'reviewed_by', 'reviewed_at', 'created_at']

class CreateExcuseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Excuse
        fields = ['session', 'reason', 'document']
    
    def validate_session(self, value):
        # Verificar que la sesión ya haya pasado
        from django.utils import timezone
        if value.date > timezone.now().date():
            raise serializers.ValidationError("No puedes crear una excusa para una sesión futura")
        return value

class ReviewExcuseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Excuse
        fields = ['status', 'review_comment']
    
    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Status debe ser 'approved' o 'rejected'")
        return value