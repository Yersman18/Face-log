"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("access");
    if (!token) {
      router.push("/login");
    } else {
      // Traer perfil
      api.get("/authentication/profile/")
        .then(res => {
          setUser(res.data);
          setIsLoading(false);
        })
        .catch(() => {
          router.push("/login");
        });
    }
  }, [router]);

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    router.push("/login");
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'student': return '🎓';
      case 'teacher': return '👨‍🏫';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'student': return 'from-blue-500 to-cyan-500';
      case 'teacher': return 'from-green-500 to-emerald-500';
      case 'admin': return 'from-purple-500 to-indigo-500';
      default: return 'from-gray-500 to-slate-500';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-gray-600 text-lg">Error al cargar usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">FL</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">FaceLog</h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">
                  {currentTime.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {currentTime.toLocaleTimeString('es-ES')}
                </p>
              </div>
              
              <button
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">{getRoleIcon(user.role)}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user.username}
                </span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className={`bg-gradient-to-r ${getRoleColor(user.role)} rounded-3xl p-8 text-white shadow-xl`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {getGreeting()}, {user.username}! {getRoleIcon(user.role)}
                </h2>
                <p className="text-lg opacity-90">
                  Bienvenido a tu dashboard de FaceLog
                </p>
                <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-sm font-medium">
                    {getRoleText(user.role)} • ID: {user.id}
                  </span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
                  <span className="text-6xl">{getRoleIcon(user.role)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Asistencias</h3>
                <p className="text-2xl font-bold text-gray-800">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Presente</h3>
                <p className="text-2xl font-bold text-green-600">Hoy</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Porcentaje</h3>
                <p className="text-2xl font-bold text-purple-600">96%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Estado</h3>
                <p className="text-2xl font-bold text-orange-600">Activo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push("/profile")}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Mi Perfil</h3>
            </div>
            <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
          </button>

          <button className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Reconocimiento</h3>
            </div>
            <p className="text-gray-600">Registra tu asistencia usando reconocimiento facial</p>
          </button>

          <button className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Reportes</h3>
            </div>
            <p className="text-gray-600">Consulta tu historial de asistencias y estadísticas</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Actividad Reciente
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">✓</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Asistencia registrada</p>
                <p className="text-sm text-gray-600">Hoy, 8:30 AM</p>
              </div>
              <span className="text-green-600 font-medium">Presente</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">i</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Perfil actualizado</p>
                <p className="text-sm text-gray-600">Ayer, 3:45 PM</p>
              </div>
              <span className="text-blue-600 font-medium">Info</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Reporte generado</p>
                <p className="text-sm text-gray-600">15 Ago, 10:20 AM</p>
              </div>
              <span className="text-purple-600 font-medium">Reporte</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}