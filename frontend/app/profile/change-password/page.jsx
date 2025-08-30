// Change Password Page
"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff, Shield, CheckCircle, AlertCircle, KeyRound } from "lucide-react";
import { authFetch, API_URL } from "@/lib/api";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Fuerza de contraseña
    if (name === "new_password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[a-z]/.test(value)) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 25) return "Débil";
    if (passwordStrength <= 50) return "Regular";
    if (passwordStrength <= 75) return "Fuerte";
    return "Muy Fuerte";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (!form.old_password || !form.new_password) {
      setMessage("Por favor, completa todos los campos");
      setMessageType("error");
      setLoading(false);
      return;
    }

    if (form.new_password.length < 8) {
      setMessage("La nueva contraseña debe tener al menos 8 caracteres");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const res = await authFetch(`${API_URL}/api/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Contraseña actualizada correctamente");
        setMessageType("success");
        setForm({ old_password: "", new_password: "" });
        setPasswordStrength(0);
      } else {
        let errorMsg = "Error al cambiar la contraseña";
        if (data.old_password) errorMsg = data.old_password;
        else if (data.new_password) errorMsg = data.new_password;
        else if (data.error) errorMsg = data.error;
        setMessage(errorMsg);
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error en la conexión con el servidor");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <KeyRound className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cambiar Contraseña</h1>
            <p className="text-gray-600">Actualiza tu contraseña para mantener tu cuenta segura</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-white" />
                <div>
                  <h2 className="text-xl font-semibold text-white">Configuración de Seguridad</h2>
                  <p className="text-blue-100 text-sm">Protege tu cuenta con una contraseña segura</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Actual */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    name="old_password"
                    value={form.old_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                    placeholder="Ingresa tu contraseña actual"
                    required
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("old")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPasswords.old ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Nueva */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="new_password"
                    value={form.new_password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                    placeholder="Ingresa tu nueva contraseña"
                    required
                  />
                  <button type="button" onClick={() => togglePasswordVisibility("new")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {showPasswords.new ? <EyeOff /> : <Eye />}
                  </button>
                </div>

                {/* Barra de fuerza */}
                {form.new_password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Fuerza de la contraseña:</span>
                      <span className="font-medium">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center"
              >
                {loading ? "Cambiando contraseña..." : "Cambiar Contraseña"}
              </button>

              {/* Mensaje */}
              {message && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${messageType === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
