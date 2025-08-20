"use client";
import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Badge, Edit, Camera, Save, X, Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

// Simulamos las funciones para el ejemplo
const mockProfile = {
  id: 1,
  username: "juan.perez",
  first_name: "Juan Carlos",
  last_name: "Pérez González",
  email: "juan.perez@universidad.edu",
  student_id: "EST-2024-001",
  role: "student",
  created_at: "2024-01-15T10:30:00Z",
  last_login: "2024-08-19T08:45:00Z",
  profile_image: null,
  is_verified: true,
  face_registered: false
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Simular carga de perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Simulación de carga
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setProfile(mockProfile);
        setEditForm(mockProfile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Error al cargar el perfil. Por favor, inténtalo de nuevo.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setMessage("");
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    // Validaciones básicas
    if (!editForm.username || !editForm.email) {
      setMessage("Por favor, completa los campos obligatorios");
      setMessageType("error");
      setSaving(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      setMessage("Por favor, ingresa un email válido");
      setMessageType("error");
      setSaving(false);
      return;
    }

    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular éxito/error
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setProfile({...editForm});
        setIsEditing(false);
        setMessage("Perfil actualizado correctamente");
        setMessageType("success");
      } else {
        setMessage("Error al actualizar el perfil. Verifica los datos e inténtalo de nuevo.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Error de conexión. Por favor, inténtalo de nuevo.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({...profile});
    setIsEditing(false);
    setMessage("");
  };

  const handleChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    switch(role) {
      case 'student': return 'Estudiante';
      case 'teacher': return 'Profesor';
      case 'admin': return 'Administrador';
      default: return 'Usuario';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Cargando perfil...</p>
          <p className="text-gray-400 text-sm mt-2">Obteniendo tu información personal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <User className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              )}
              <p className={`text-sm font-medium ${
                messageType === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-4 right-4 flex items-center space-x-2">
              {profile.is_verified && (
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-white" />
                  <span className="text-white text-xs font-medium">Verificado</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8 -mt-16 relative">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {profile.profile_image ? (
                      <img 
                        src={profile.profile_image} 
                        alt="Imagen de perfil" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group-hover:scale-105">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {profile.first_name && profile.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : profile.username}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile.role)}`}>
                    <Badge className="w-4 h-4 inline mr-1" />
                    {getRoleText(profile.role)}
                  </span>
                </div>
                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
                {profile.last_login && (
                  <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    Último acceso: {formatDate(profile.last_login)}
                  </p>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </button>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Información Personal
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Nombre de Usuario *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username || ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Ingresa tu nombre de usuario"
                      />
                    ) : (
                      <div className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200 font-medium">
                        {profile.username}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Nombres</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Ingresa tu nombre"
                      />
                    ) : (
                      <div className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                        {profile.first_name || 'No especificado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Apellidos</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.last_name || ''}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Ingresa tus apellidos"
                      />
                    ) : (
                      <div className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                        {profile.last_name || 'No especificado'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-5 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-500" />
                  Información de Cuenta
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Email *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="correo@ejemplo.com"
                      />
                    ) : (
                      <div className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200 font-medium">
                        {profile.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">ID de Estudiante</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.student_id || ''}
                        onChange={(e) => handleChange('student_id', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        placeholder="EST-YYYY-###"
                      />
                    ) : (
                      <div className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200">
                        {profile.student_id || 'No asignado'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Fecha de Registro</label>
                    <div className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      {formatDate(profile.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Edit Mode */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {/* Account Status */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Estado</h4>
                <p className="text-green-600 font-bold">Activo</p>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Badge className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Rol</h4>
                <p className="text-blue-600 font-bold">{getRoleText(profile.role)}</p>
              </div>
            </div>
          </div>

          {/* Face Recognition Status */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                profile.face_registered ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <Camera className={`w-6 h-6 ${
                  profile.face_registered ? 'text-green-600' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Reconocimiento</h4>
                <p className={`font-bold ${
                  profile.face_registered ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {profile.face_registered ? 'Configurado' : 'Pendiente'}
                </p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Miembro desde</h4>
                <p className="text-purple-600 font-bold">
                  {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Configuración de Seguridad
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Contraseña</h4>
                  <p className="text-sm text-gray-600">Última actualización hace 2 semanas</p>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Cambiar
                </button>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800">Verificación de Email</h4>
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Email verificado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        {isEditing && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Información importante</h4>
                <p className="text-sm text-amber-700">
                  Los campos marcados con * son obligatorios. Asegúrate de que tu email sea válido 
                  para recibir notificaciones importantes sobre tu cuenta.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}