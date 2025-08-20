"use client";
import { useState } from "react";
import { Camera, Upload, User, CheckCircle, XCircle, AlertTriangle, Eye, Trash2, ArrowLeft } from "lucide-react";

// Simulando authFetch para el ejemplo
const authFetch = async (url, options) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulamos una respuesta exitosa
  return {
    ok: true,
    json: async () => ({ message: "Rostro registrado exitosamente" })
  };
};

export default function RegisterFacePage() {
  const [file, setFile] = useState(null);
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
    if (!file) {
      setMessage("❌ Selecciona una imagen");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await authFetch("http://127.0.0.1:8000/api/face-recognition/register/", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Rostro registrado correctamente");
        // Limpiar el formulario después del éxito
        setTimeout(() => {
          setFile(null);
          setPreview(null);
          setMessage("");
        }, 3000);
      } else {
        setMessage("❌ " + (data.error || "Error al registrar rostro"));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => window.history.back()}
            className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Registro de Rostro
            </h1>
            <p className="text-gray-600 mt-1">Configura el reconocimiento facial para asistencia automática</p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-6 bg-gradient-to-r ${getMessageConfig(message).bgColor} border-2 ${getMessageConfig(message).borderColor} rounded-2xl shadow-lg`}>
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
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-full bg-blue-100">
                  <Camera className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Subir Imagen</h2>
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
                    id="face-upload"
                  />
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Arrastra tu foto aquí
                    </h3>
                    <p className="text-gray-600 mb-4">
                      o haz clic para seleccionar desde tu dispositivo
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
                      alt="Vista previa"
                      className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200"
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

              <p className="text-sm text-gray-500 mt-4">
                Formatos permitidos: JPG, PNG • Tamaño máximo: 5MB
              </p>
            </div>
          </div>

          {/* Instructions & Guidelines */}
          <div className="space-y-6">
            {/* Guidelines Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Recomendaciones</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Toma la foto en un lugar bien iluminado</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Mira directamente a la cámara</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Evita usar gafas de sol o accesorios que cubran tu rostro</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">Usa una expresión neutral</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <AlertTriangle className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-blue-800">Información Importante</h3>
              </div>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• Tu imagen será procesada de forma segura</p>
                <p>• Solo se almacenan características faciales, no la imagen original</p>
                <p>• Podrás actualizar tu registro cuando lo necesites</p>
                <p>• Este sistema mejora la precisión de la asistencia</p>
              </div>
            </div>

            {/* Process Steps */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-purple-100">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Proceso</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                      <div className="w-px h-6 bg-gray-200 mt-2"></div>
                    </div>
                    <div className="pt-1">
                      <p className="font-medium text-gray-800">Subir imagen</p>
                      <p className="text-sm text-gray-600">Selecciona una foto clara de tu rostro</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                      <div className="w-px h-6 bg-gray-200 mt-2"></div>
                    </div>
                    <div className="pt-1">
                      <p className="font-medium text-gray-800">Procesamiento</p>
                      <p className="text-sm text-gray-600">El sistema analiza y registra tus características</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                    </div>
                    <div className="pt-1">
                      <p className="font-medium text-gray-800">Listo para usar</p>
                      <p className="text-sm text-gray-600">Ya puedes usar el reconocimiento facial</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="flex-2 flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Procesando Imagen...
              </>
            ) : (
              <>
                <User className="h-5 w-5" />
                Registrar Rostro
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}