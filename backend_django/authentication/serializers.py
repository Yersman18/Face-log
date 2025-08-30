# authentication/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from attendance.models import StudentProfile, Ficha  # 🔥 IMPORTANTE

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'student_id', 'profile_image', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'student_id'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data
    
    def validate_student_id(self, value):
        if value and User.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Este ID de estudiante ya está en uso")
        return value
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # 🔥 Crear ficha por defecto si no existe
        ficha, _ = Ficha.objects.get_or_create(numero="DEFAULT123")

        # 🔥 Crear perfil de estudiante automáticamente
        StudentProfile.objects.create(
            user=user,
            documento=user.student_id or "SIN-DOC",
            ficha=ficha,
            estado_academico="activo"
        )

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if user.is_active:
                    data['user'] = user
                    return data
                else:
                    raise serializers.ValidationError('Usuario inactivo')
            else:
                raise serializers.ValidationError('Credenciales inválidas')
        else:
            raise serializers.ValidationError('Debe proporcionar username y password')

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'profile_image', 'student_id']
    
    def validate_student_id(self, value):
        if value and User.objects.filter(student_id=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("Este ID de estudiante ya está en uso")
        return value
