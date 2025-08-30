// Mark Attendance Page
"use client";
import { useState } from "react";
import { authFetch } from "@/lib/api";

export default function MarkAttendancePage() {
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState("present");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  const statusOptions = [
    { 
      value: "present", 
      label: "Presente", 
      color: "text-green-700 bg-green-100",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    { 
      value: "absent", 
      label: "Ausente", 
      color: "text-red-700 bg-red-100",
      icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    { 
      value: "late", 
      label: "Tarde", 
      color: "text-yellow-700 bg-yellow-100",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    { 
      value: "excused", 
      label: "Excusado", 
      color: "text-blue-700 bg-blue-100",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  ];

  const currentStatus = statusOptions.find(option => option.value === status);

  const handleMark = async () => {
    if (!sessionId.trim()) {
      setMessage("Por favor, ingresa el ID de la sesión");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/attendance/mark/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          status,
          verified_by_face: false,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Asistencia marcada exitosamente");
        setMessageType("success");
        setSessionId(""); // Limpiar después del éxito
      } else {
        throw new Error(data.error || "Error al marcar asistencia");
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Error al marcar asistencia");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Marcar Asistencia</h1>
            <p className="text-gray-600">Registra tu asistencia para la sesión actual</p>
          </div>

          {/* Formulario principal */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-6">
              {/* Campo ID de sesión */}
              <div>
                <label htmlFor="sessionId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID de la Sesión
                </label>
                <div className="relative">
                  <input
                    id="sessionId"
                    type="number"
                    placeholder="Ingresa el ID de la sesión"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed pl-12"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Selector de estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Estado de Asistencia
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-colors duration-200 ${
                        status === option.value
                          ? `${option.color} border-current`
                          : "bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
                      } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={status === option.value}
                        onChange={(e) => setStatus(e.target.value)}
                        disabled={loading}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3 w-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                        </svg>
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      {status === option.value && (
                        <div className="absolute -inset-px rounded-lg border-2 pointer-events-none" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Botón de acción */}
              <button
                onClick={handleMark}
                disabled={loading || !sessionId.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Marcando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Marcar Asistencia</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Estado actual seleccionado */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Estado seleccionado:</span>
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={currentStatus.icon} />
                </svg>
                <span>{currentStatus.label}</span>
              </div>
            </div>
          </div>

          {/* Mensaje de respuesta */}
          {message && (
            <div className={`p-4 rounded-lg border ${
              messageType === "success" 
                ? "bg-green-50 border-green-200 text-green-800" 
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {messageType === "success" ? (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {messageType === "success" ? "¡Éxito!" : "Error"}
                  </p>
                  <p className="text-sm mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-800">Información</h3>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• <strong>Presente:</strong> Asistencia completa y puntual</li>
                  <li>• <strong>Tarde:</strong> Llegada después de la hora establecida</li>
                  <li>• <strong>Ausente:</strong> No asistió a la sesión</li>
                  <li>• <strong>Excusado:</strong> Ausencia justificada previamente</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}