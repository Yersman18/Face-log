//frontend/app/excuses/new/page.jsx
"use client";
import { useState } from "react";
import { ArrowLeft, Plus, Upload, FileText, Send, CheckCircle, XCircle, AlertCircle, Calendar, MessageSquare } from "lucide-react";

// Simulando useRouter para el ejemplo
const useRouter = () => ({
  push: (path) => console.log(`Navegando a: ${path}`)
});

// Simulando authFetch para el ejemplo
const authFetch = async (url, options) => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulamos una respuesta exitosa
  return {
    ok: true,
    json: async () => ({ id: 1, message: "Excusa creada exitosamente" })
  };
};

export default function NewExcusePage() {
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tamaño del archivo (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("El archivo no puede ser mayor a 5MB");
        return;
      }
      
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Solo se permiten archivos PDF, JPG o PNG");
        return;
      }
      
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!reason.trim()) {
      setError("El motivo es obligatorio");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("reason", reason.trim());
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await authFetch("http://127.0.0.1:8000/api/excuses/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al crear la excusa");

      setSuccess("✅ Excusa enviada correctamente");
      setReason("");
      setFile(null);

      // Redirigir a la lista de excusas después de 1.5s
      setTimeout(() => router.push("/excuses"), 1500);
    } catch (err) {
      console.error(err);
      setError("❌ No se pudo enviar la excusa");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
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
              Nueva Excusa
            </h1>
            <p className="text-gray-600 mt-1">Justifica tu ausencia con documentación de respaldo</p>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="space-y-8">
              {/* Reason Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-blue-100">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">
                    Motivo de la Excusa <span className="text-red-500">*</span>
                  </label>
                </div>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 resize-none text-gray-800 placeholder-gray-400"
                  placeholder="Describe detalladamente el motivo de tu ausencia. Ejemplo: Cita médica, emergencia familiar, problemas de transporte, etc."
                  rows={5}
                  required
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    Sé específico y detallado para facilitar la revisión
                  </p>
                  <span className={`text-sm ${reason.length > 450 ? 'text-red-500' : 'text-gray-400'}`}>
                    {reason.length}/500
                  </span>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-indigo-100">
                    <Upload className="h-5 w-5 text-indigo-600" />
                  </div>
                  <label className="text-lg font-semibold text-gray-800">
                    Documento de Respaldo <span className="text-gray-500">(Opcional)</span>
                  </label>
                </div>

                {!file ? (
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 cursor-pointer group"
                    >
                      <Upload className="h-8 w-8 text-gray-400 group-hover:text-indigo-500 mb-2 group-hover:scale-110 transition-all duration-200" />
                      <span className="text-gray-600 group-hover:text-indigo-600 font-medium">
                        Hacer clic para seleccionar archivo
                      </span>
                      <span className="text-sm text-gray-400 mt-1">
                        PDF, JPG, PNG (máx. 5MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <FileText className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors duration-200 group"
                      >
                        <XCircle className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Consejos para tu excusa:</p>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Adjunta documentos que respalden tu ausencia (certificados médicos, etc.)</li>
                        <li>• Sé específico y honesto en tu explicación</li>
                        <li>• Envía la excusa lo antes posible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !reason.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Excusa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Proceso de Revisión</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Tu excusa será revisada por un instructor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Recibirás una notificación del resultado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Si es aprobada, se registra automáticamente</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Políticas de Excusas</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span>Envía la excusa dentro de 48 horas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span>Incluye documentación cuando sea posible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <span>Solo excusas válidas serán aprobadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}