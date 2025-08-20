"use client";
import { useEffect, useState } from "react";
import { User, Camera, Shield, AlertCircle, CheckCircle } from "lucide-react";

// Simulamos authFetch para el ejemplo
const authFetch = async (url) => {
  // Simulación de respuesta
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    ok: true,
    json: async () => ({
      has_face_registered: Math.random() > 0.5,
      profile_image: Math.random() > 0.5 ? "/api/profile-image.jpg" : null,
      last_verification: "2024-01-15T10:30:00Z",
      recognition_accuracy: 95.2
    })
  };
};

export default function FaceRecognitionPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setError(null);
        const res = await authFetch("http://127.0.0.1:8000/api/face-recognition/status/");
        if (!res.ok) throw new Error("Error al obtener estado");
        const data = await res.json();
        setStatus(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el estado del reconocimiento facial");
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600 font-medium">Cargando estado...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <Camera className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reconocimiento Facial</h1>
            <p className="text-gray-600">Gestiona tu identificación biométrica de forma segura</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={handleRefresh}
                  className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Estado del Perfil</h2>
                    <p className="text-indigo-100">Información de tu registro biométrico</p>
                  </div>
                </div>
                <button 
                  onClick={handleRefresh}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                >
                  Actualizar
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Registration Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {status?.has_face_registered ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {status?.has_face_registered ? "Rostro Registrado" : "Sin Registro"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {status?.has_face_registered 
                          ? "Tu rostro está registrado en el sistema" 
                          : "Aún no tienes rostro registrado"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {status?.has_face_registered && (
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {status.recognition_accuracy && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Precisión:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {status.recognition_accuracy}%
                          </span>
                        </div>
                      )}
                      {status.last_verification && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Última verificación:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(status.last_verification).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Profile Image */}
                <div className="flex justify-center">
                  {status?.profile_image ? (
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 mx-auto mb-3 ring-4 ring-indigo-100">
                        <img 
                          src={`http://127.0.0.1:8000${status.profile_image}`} 
                          alt="Imagen de perfil" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm text-gray-500">Imagen de perfil registrada</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <User className="h-12 w-12 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">Sin imagen de perfil</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Register Face */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-green-100 rounded-full p-2">
                    <Camera className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Registrar Rostro</h3>
                    <p className="text-sm text-gray-500">Captura y registra tu identificación facial</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {status?.has_face_registered 
                    ? "Actualiza tu registro facial con una nueva imagen"
                    : "Registra tu rostro para habilitar la verificación biométrica"}
                </p>
                <a 
                  href="/face-recognition/register"
                  className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {status?.has_face_registered ? "Actualizar Registro" : "Registrar Ahora"}
                </a>
              </div>
            </div>

            {/* Verify Face */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Verificar Rostro</h3>
                    <p className="text-sm text-gray-500">Autentica tu identidad mediante reconocimiento facial</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Verifica tu identidad utilizando la cámara para comparar con tu registro facial
                </p>
                <a 
                  href="/face-recognition/verify"
                  className={`inline-flex items-center justify-center w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                    status?.has_face_registered
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {status?.has_face_registered ? "Verificar Identidad" : "Requiere Registro"}
                </a>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-1">Información de Seguridad</h4>
                <p className="text-sm text-amber-700">
                  Tus datos biométricos están protegidos con encriptación de última generación. 
                  Nunca compartimos tu información facial con terceros y puedes eliminar tu registro en cualquier momento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}