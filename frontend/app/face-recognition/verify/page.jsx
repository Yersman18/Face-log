"use client";
import { useState } from "react";
import { Camera, Upload, Shield, CheckCircle, XCircle, AlertTriangle, Eye, Trash2, ArrowLeft, Hash, Scan } from "lucide-react";

// Simulando authFetch para el ejemplo
const authFetch = async (url, options) => {
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // Simulamos diferentes respuestas basadas en el session_id
  const sessionId = options.body.get('session_id');
  if (sessionId === '12345') {
    return {
      ok: true,
      json: async () => ({ message: "Asistencia registrada para Juan Pérez - Matemáticas Avanzadas" })
    };
  } else if (sessionId === '99999') {
    return {
      ok: false,
      json: async () => ({ error: "Rostro no reconocido o sesión inválida" })
    };
  }
  
  return {
    ok: true,
    json: async () => ({ message: "Verificación exitosa - Asistencia confirmada" })
  };
};

export default function VerifyFacePage() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;

    // Validar tipo de archivo
    if (!selectedFile.type.startsWith('image/')) {
      setMessage("❌ Solo se permiten archivos de imagen");
      return;
    }

    // Validar tamaño (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage("❌ La imagen no puede ser mayor a 5MB");
      return;
    }

    setFile(selectedFile);
    setMessage("");

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !sessionId.trim()) {
      setMessage("❌ Debes subir una imagen y proporcionar el ID de sesión");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("session_id", sessionId.trim());

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/face-recognition/verify/"`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Verificación exitosa: ${data.message}`);
        // Limpiar formulario después del éxito
        setTimeout(() => {
          setFile(null);
          setPreview(null);
          setSessionId("");
          setMessage("");
        }, 4000);
      } else {
        setMessage("❌ " + (data.error || "No se pudo verificar"));
      }
    } catch (err) {
      setMessage("❌ Error en la conexión con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setMessage("");
  };

  const getMessageConfig = (msg) => {
    if (msg.includes('✅')) {
      return {
        icon: CheckCircle,
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      };
    } else if (msg.includes('❌')) {
      return {
        icon: XCircle,
        bgColor: 'from-red-50 to-pink-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700'
      };
    }
    return {
      icon: AlertTriangle,
      bgColor: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Verificación de Rostro
            </h1>
            <p className="text-gray-600 mt-1">Confirma tu asistencia usando reconocimiento facial</p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-8 p-6 bg-gradient-to-r ${getMessageConfig(message).bgColor} border-2 ${getMessageConfig(message).borderColor} rounded-2xl shadow-lg ${message.includes('✅') ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-3">
              {(() => {
                const MessageIcon = getMessageConfig(message).icon;
                return <MessageIcon className={`h-6 w-6 ${getMessageConfig(message).textColor.replace('text-', 'text-').replace('-700', '-500')}`} />;
              })()}
              <p className={`font-medium ${getMessageConfig(message).textColor}`}>{message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session ID Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-emerald-100">
                  <Hash className="h-6 w-6 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">ID de Sesión</h2>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ingresa el ID de la sesión de clase"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 text-gray-800 placeholder-gray-400"
                  />
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-emerald-800 font-medium">¿Dónde encontrar el ID?</p>
                      <p className="text-sm text-emerald-700 mt-1">
                        El instructor proporcionará este código al inicio de cada clase.
                        Suele mostrarse en la pizarra o proyector.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-blue-100">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Tu Foto</h2>
              </div>

              {!preview ? (
                <div
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="verify-upload"
                  />
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Sube tu foto actual
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Toma una selfie o selecciona una imagen
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200">
                      <Camera className="h-4 w-4" />
                      Seleccionar Imagen
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group">
                    <img
                      src={preview}
                      alt="Imagen para verificación"
                      className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl flex items-center justify-center">
                      <button
                        onClick={removeFile}
                        className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-200">
                          <Camera className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors duration-200 group"
                      >
                        <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-full bg-indigo-100">
                <Scan className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Proceso de Verificación</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
                  <Hash className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">1. ID de Sesión</h3>
                <p className="text-sm text-gray-600">Proporciona el código único de la clase</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">2. Tu Foto</h3>
                <p className="text-sm text-gray-600">Sube una imagen clara de tu rostro</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">3. Verificación</h3>
                <p className="text-sm text-gray-600">El sistema confirma tu identidad</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={() => window.history.back()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
                Volver
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={!file || !sessionId.trim() || isSubmitting}
                className="flex-2 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verificando Rostro...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5" />
                    Verificar Asistencia
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Seguridad y Privacidad</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Tus imágenes se procesan de forma segura</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>No se almacenan las fotos enviadas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Solo se comparan características faciales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span>Cumplimos con estándares de protección de datos</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Consejos para el Éxito</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Usa buena iluminación natural</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>Mira directamente a la cámara</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Evita sombras en tu rostro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <span>Mantén una expresión neutral</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Session IDs */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-yellow-100">
              <Eye className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-yellow-800">Modo Demostración</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-3">Puedes probar con estos IDs de ejemplo:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSessionId("12345")}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors duration-200"
            >
              12345 (exitoso)
            </button>
            <button
              onClick={() => setSessionId("99999")}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm hover:bg-yellow-200 transition-colors duration-200"
            >
              99999 (error)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}