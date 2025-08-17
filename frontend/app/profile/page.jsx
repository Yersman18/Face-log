"use client"; // Profile Page Component
import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Badge, Edit, Camera, Save, X } from 'lucide-react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Cargar datos del perfil desde tu API
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access");
      
      if (!token) {
        alert("❌ No hay token de acceso. Redirigiendo al login...");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setEditForm(data);
        } else {
          alert("❌ No se pudo obtener el perfil.");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert("❌ Error al cargar el perfil.");
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("access");
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editForm.username,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          email: editForm.email,
          student_id: editForm.student_id,
        }),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProfile(updatedData);
        setIsEditing(false);
        alert("✅ Perfil actualizado correctamente");
      } else {
        alert("❌ Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Error al actualizar el perfil");
    }
  };

  const handleCancel = () => {
    setEditForm({...profile});
    setIsEditing(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Cover Section */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Content */}
          <div className="px-8 pb-8 -mt-16 relative">
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    {profile.profile_image ? (
                      <img 
                        src={profile.profile_image} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-gray-800">
                    {profile.full_name || profile.username}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile.role)}`}>
                    <Badge className="w-4 h-4 inline mr-1" />
                    {getRoleText(profile.role)}
                  </span>
                </div>
                <p className="text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar Perfil
                </button>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Información Personal
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre de Usuario</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username || ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white p-3 rounded-lg">{profile.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombres</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.first_name || ''}
                        onChange={(e) => handleChange('first_name', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Ingresa tu nombre"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white p-3 rounded-lg">
                        {profile.first_name || 'No especificado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Apellidos</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.last_name || ''}
                        onChange={(e) => handleChange('last_name', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Ingresa tu apellido"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white p-3 rounded-lg">
                        {profile.last_name || 'No especificado'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-green-500" />
                  Información de Cuenta
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white p-3 rounded-lg">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ID de Estudiante</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.student_id || ''}
                        onChange={(e) => handleChange('student_id', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ingresa tu ID de estudiante"
                      />
                    ) : (
                      <p className="text-gray-800 bg-white p-3 rounded-lg">
                        {profile.student_id || 'No asignado'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Registro</label>
                    <p className="text-gray-800 bg-white p-3 rounded-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      {formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons for Edit Mode */}
            {isEditing && (
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Estado</h4>
                <p className="text-blue-600 font-medium">Activo</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Badge className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Rol</h4>
                <p className="text-green-600 font-medium">{getRoleText(profile.role)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Miembro desde</h4>
                <p className="text-purple-600 font-medium">
                  {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}