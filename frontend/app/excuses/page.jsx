"use client";
import { useEffect, useState } from "react";
import { FileText, Plus, Eye, Clock, CheckCircle, XCircle, AlertTriangle, Calendar } from "lucide-react";

// Simulando authFetch para el ejemplo
const authFetch = async (url) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    ok: true,
    json: async () => [
      {
        id: 1,
        reason: "Cita médica programada",
        status: "approved",
        created_at: "2024-01-15",
        session_date: "2024-01-20"
      },
      {
        id: 2,
        reason: "Emergencia familiar",
        status: "pending",
        created_at: "2024-01-18",
        session_date: "2024-01-22"
      },
      {
        id: 3,
        reason: "Transporte público cancelado",
        status: "rejected",
        created_at: "2024-01-10",
        session_date: "2024-01-12"
      }
    ]
  };
};

export default function ExcusesPage() {
  const [excuses, setExcuses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExcuses = async () => {
      try {
        setLoading(true);
        const res = await authFetch("http://127.0.0.1:8000/api/excuses/");
        if (!res.ok) throw new Error("Error al obtener excusas");

        const data = await res.json();
        setExcuses(data);
      } catch (err) {
        console.error(err);
        setError("❌ No se pudieron cargar las excusas");
      } finally {
        setLoading(false);
      }
    };

    fetchExcuses();
  }, []);

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        icon: CheckCircle,
        label: "Aprobada",
        color: "text-green-600",
        bgColor: "bg-green-100",
        borderColor: "border-green-200"
      },
      pending: {
        icon: Clock,
        label: "Pendiente",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        borderColor: "border-yellow-200"
      },
      rejected: {
        icon: XCircle,
        label: "Rechazada",
        color: "text-red-600",
        bgColor: "bg-red-100",
        borderColor: "border-red-200"
      }
    };
    return configs[status] || configs.pending;
  };

  const ExcuseCard = ({ excuse }) => {
    const statusConfig = getStatusConfig(excuse.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
        {/* Status indicator line */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${statusConfig.bgColor.replace('bg-', 'bg-gradient-to-r from-').replace('100', '500 to-')}${statusConfig.color.split('-')[1]}-600`}></div>
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Excusa #{excuse.id}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    {new Date(excuse.created_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Motivo:</p>
              <p className="text-gray-800 font-medium">{excuse.reason}</p>
            </div>
            
            {excuse.session_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Sesión: {new Date(excuse.session_date).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>

          <button 
            onClick={() => window.location.href = `/excuses/${excuse.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg group"
          >
            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Ver detalle completo
          </button>
        </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="w-20 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="w-full h-16 bg-gray-200 rounded-xl mb-4"></div>
            <div className="w-full h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-6">
        <FileText className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">No hay excusas registradas</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Cuando necesites justificar una ausencia, podrás crear una nueva excusa desde aquí.
      </p>
      <button 
        onClick={() => window.location.href = '/excuses/new'}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" />
        Crear primera excusa
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Mis Excusas
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gestiona y revisa el estado de tus justificaciones de ausencia
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Content */}
        {!loading && (
          <div className="space-y-8">
            {excuses.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{excuses.length}</p>
                        <p className="text-sm text-gray-600">Total de excusas</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {excuses.filter(e => e.status === 'approved').length}
                        </p>
                        <p className="text-sm text-gray-600">Aprobadas</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-yellow-100">
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {excuses.filter(e => e.status === 'pending').length}
                        </p>
                        <p className="text-sm text-gray-600">Pendientes</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Excuses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {excuses.map((excuse) => (
                    <ExcuseCard key={excuse.id} excuse={excuse} />
                  ))}
                </div>
              </>
            )}

            {/* Floating Action Button */}
            {!loading && (
              <div className="fixed bottom-8 right-8">
                <button 
                  onClick={() => window.location.href = '/excuses/new'}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-medium shadow-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-3xl hover:scale-105 group"
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden sm:inline">Nueva excusa</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}