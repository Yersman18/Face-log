"use client";
import { useEffect, useState } from "react";
import { BarChart3, Users, Calendar, Clock, CheckCircle, XCircle, AlertCircle, BookOpen } from "lucide-react";

// Simulando authFetch para el ejemplo
const authFetch = async (url) => {
  // Simulación de respuesta para demostrar el componente
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ok: true,
    json: async () => ({
      // Datos de ejemplo para estudiante
      total_sessions: 45,
      present: 38,
      absent: 4,
      late: 2,
      excused: 1,
      attendance_rate: 86.67
    })
  };
};

export default function AttendanceStatsPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/stats/`);
        if (!res.ok) throw new Error("Error al obtener estadísticas");

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError("❌ No se pudieron cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color, percentage }) => (
    <div className={`relative overflow-hidden rounded-2xl p-6 ${color} backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 translate-x-6 -translate-y-6"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8 text-white/90 group-hover:scale-110 transition-transform duration-300" />
          {percentage && (
            <span className="text-xs px-2 py-1 bg-white/20 text-white rounded-full">
              {percentage}%
            </span>
          )}
        </div>
        <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Estadísticas de Asistencia
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Monitorea tu rendimiento académico y mantente al día con tus clases
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Stats Display */}
        {!loading && stats && (
          <div className="space-y-8">
            {stats.total_sessions !== undefined ? (
              // Para estudiantes
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Users className="h-6 w-6 text-indigo-600" />
                  Panel de Estudiante
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    icon={Calendar}
                    title="Total de Sesiones"
                    value={stats.total_sessions}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                  />
                  <StatCard
                    icon={CheckCircle}
                    title="Asistencias"
                    value={stats.present}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                    percentage={((stats.present / stats.total_sessions) * 100).toFixed(1)}
                  />
                  <StatCard
                    icon={XCircle}
                    title="Ausencias"
                    value={stats.absent}
                    color="bg-gradient-to-br from-red-500 to-rose-600"
                    percentage={((stats.absent / stats.total_sessions) * 100).toFixed(1)}
                  />
                  <StatCard
                    icon={Clock}
                    title="Tardanzas"
                    value={stats.late}
                    color="bg-gradient-to-br from-yellow-500 to-orange-600"
                    percentage={((stats.late / stats.total_sessions) * 100).toFixed(1)}
                  />
                  <StatCard
                    icon={AlertCircle}
                    title="Excusadas"
                    value={stats.excused}
                    color="bg-gradient-to-br from-purple-500 to-violet-600"
                    percentage={((stats.excused / stats.total_sessions) * 100).toFixed(1)}
                  />
                  <StatCard
                    icon={BarChart3}
                    title="Porcentaje de Asistencia"
                    value={`${stats.attendance_rate.toFixed(1)}%`}
                    color="bg-gradient-to-br from-indigo-500 to-purple-600"
                  />
                </div>
              </div>
            ) : (
              // Para instructores
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-indigo-600" />
                  Panel de Instructor
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    icon={BookOpen}
                    title="Total de Cursos"
                    value={stats.total_courses}
                    color="bg-gradient-to-br from-blue-500 to-indigo-600"
                  />
                  <StatCard
                    icon={Calendar}
                    title="Total de Sesiones"
                    value={stats.total_sessions}
                    color="bg-gradient-to-br from-cyan-500 to-blue-600"
                  />
                  <StatCard
                    icon={Users}
                    title="Total de Asistencias"
                    value={stats.total_attendances}
                    color="bg-gradient-to-br from-teal-500 to-cyan-600"
                  />
                  <StatCard
                    icon={CheckCircle}
                    title="Presentes"
                    value={stats.present}
                    color="bg-gradient-to-br from-green-500 to-emerald-600"
                  />
                  <StatCard
                    icon={XCircle}
                    title="Ausentes"
                    value={stats.absent}
                    color="bg-gradient-to-br from-red-500 to-rose-600"
                  />
                  <StatCard
                    icon={BarChart3}
                    title="Porcentaje Global"
                    value={`${stats.overall_attendance_rate.toFixed(1)}%`}
                    color="bg-gradient-to-br from-indigo-500 to-purple-600"
                  />
                </div>
              </div>
            )}

            {/* Additional Info Card */}
            <div className="mt-12 p-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm border border-indigo-200 rounded-2xl shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-indigo-100">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Análisis de Rendimiento
                  </h3>
                  <p className="text-gray-600">
                    {stats.total_sessions !== undefined ? (
                      stats.attendance_rate >= 85 ? 
                        "¡Excelente asistencia! Mantén este buen ritmo para garantizar tu éxito académico." :
                        stats.attendance_rate >= 70 ?
                          "Tu asistencia es aceptable, pero puedes mejorarla para optimizar tu aprendizaje." :
                          "Es importante mejorar tu asistencia para no perderte contenido importante del curso."
                    ) : (
                      stats.overall_attendance_rate >= 85 ?
                        "Los estudiantes muestran una excelente participación en tus cursos." :
                        "Considera estrategias para mejorar la asistencia general de tus estudiantes."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}