//frontend/app/excuses/%5Bid%5D/page.jsx
"use client";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock, Download, Eye, Calendar, User, MessageSquare, AlertCircle } from "lucide-react";

// Simulando useParams para el ejemplo
const useParams = () => ({ id: "1" });

// Simulando authFetch para el ejemplo
const authFetch = async (url) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ok: true,
    json: async () => ({
      id: 1,
      reason: "Cita médica programada con especialista debido a problemas de salud que requieren atención inmediata",
      status: "approved",
      file: "https://example.com/medical-certificate.pdf",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-16T14:20:00Z",
      session_date: "2024-01-20",
      student_name: "María González",
      course_name: "Matemáticas Avanzadas",
      reviewed_by: "Dr. Rodriguez",
      review_comment: "Documentación médica válida. Excusa aprobada."
    })
  };
};

export default function ExcuseDetailPage() {
  const { id } = useParams();
  const [excuse, setExcuse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExcuse = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excuses/${id}/`);
        if (!res.ok) throw new Error("Error al obtener la excusa");

        const data = await res.json();
        setExcuse(data);
      } catch (err) {
        console.error(err);
        setError("❌ No se pudo cargar la excusa");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchExcuse();
  }, [id]);

  const getStatusConfig = (status) => {
    const configs = {
      approved: {
        icon: CheckCircle,
        label: "Aprobada",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        gradientFrom: "from-green-500",
        gradientTo: "to-emerald-600"
      },
      pending: {
        icon: Clock,
        label: "Pendiente de Revisión",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        gradientFrom: "from-yellow-500",
        gradientTo: "to-orange-600"
      },
      rejected: {
        icon: XCircle,
        label: "Rechazada",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        gradientFrom: "from-red-500",
        gradientTo: "to-rose-600"
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded-xl"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al cargar</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  if (!excuse) return null;

  const statusConfig = getStatusConfig(excuse.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Detalle de Excusa #{excuse.id}
            </h1>
            <p className="text-gray-600 mt-1">Información completa de la justificación</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`mb-8 p-6 rounded-2xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} shadow-lg`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-gradient-to-br ${statusConfig.gradientFrom} ${statusConfig.gradientTo} text-white shadow-lg`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${statusConfig.color}`}>
                Estado: {statusConfig.label}
              </h2>
              <p className="text-gray-600 mt-1">
                {excuse.status === 'approved' && 'Tu excusa ha sido aprobada y se ha registrado oficialmente.'}
                {excuse.status === 'pending' && 'Tu excusa está siendo revisada por un instructor.'}
                {excuse.status === 'rejected' && 'Tu excusa no fue aprobada. Revisa los comentarios del instructor.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reason Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Motivo de la Excusa</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-800 leading-relaxed">{excuse.reason}</p>
                </div>
              </div>
            </div>

            {/* File Attachment */}
            {excuse.file && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-indigo-100">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Documento Adjunto</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Certificado médico</p>
                          <p className="text-sm text-gray-600">Documento de respaldo</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={excuse.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </a>
                        <a 
                          href={excuse.file}
                          download
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors duration-200"
                        >
                          <Download className="h-4 w-4" />
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Comments */}
            {excuse.review_comment && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-full bg-green-100">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Comentarios del Instructor</h3>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-gray-800">{excuse.review_comment}</p>
                    {excuse.reviewed_by && (
                      <p className="text-sm text-green-600 mt-2 font-medium">
                        — {excuse.reviewed_by}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Información
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Sesión afectada</p>
                      <p className="font-medium text-gray-800">
                        {new Date(excuse.session_date).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  
                  {excuse.course_name && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Curso</p>
                        <p className="font-medium text-gray-800">{excuse.course_name}</p>
                      </div>
                    </div>
                  )}

                  {excuse.student_name && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <User className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Estudiante</p>
                        <p className="font-medium text-gray-800">{excuse.student_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Cronología
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div className="w-px h-8 bg-gray-200"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Excusa creada</p>
                      <p className="text-sm text-gray-600">{formatDate(excuse.created_at)}</p>
                    </div>
                  </div>
                  
                  {excuse.updated_at !== excuse.created_at && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${statusConfig.color.replace('text-', 'bg-')}`}></div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Estado actualizado</p>
                        <p className="text-sm text-gray-600">{formatDate(excuse.updated_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <button 
                  onClick={() => window.location.href = `/excuses/${id}/review`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-200 hover:shadow-lg"
                >
                  <Eye className="h-4 w-4" />
                  Revisar Excusa
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Solo disponible para instructores y administradores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}