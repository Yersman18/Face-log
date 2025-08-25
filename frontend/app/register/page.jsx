"use client";
import { useState } from "react";
import { Eye, EyeOff, Building2, Shield, Lock, User, Mail, UserCheck, CreditCard, ChevronDown } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    role: "student", // por defecto
    student_id: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registro exitoso, ahora puedes iniciar sesión");
        setFormData({
          username: "",
          email: "",
          password: "",
          password_confirm: "",
          first_name: "",
          last_name: "",
          role: "student",
          student_id: "",
        });
      } else {
        setMessage(JSON.stringify(data));
      }
    } catch (err) {
      setMessage("❌ Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Patrón de puntos de fondo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Círculos decorativos */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-lg relative z-10">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal Institucional</h1>
          <p className="text-blue-200 text-sm">Crear nueva cuenta</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <UserCheck className="w-6 h-6 text-blue-300 mr-2" />
            <h2 className="text-xl font-semibold text-white">Registro</h2>
          </div>

          {message && (
            <div className={`${
              message.includes('✅') 
                ? 'bg-green-500/20 border-green-500/30 text-green-200' 
                : 'bg-red-500/20 border-red-500/30 text-red-200'
            } p-4 rounded-2xl mb-6 text-sm backdrop-blur-sm`}>
              <div className="flex items-center">
                <div className={`w-2 h-2 ${
                  message.includes('✅') ? 'bg-green-400' : 'bg-red-400'
                } rounded-full mr-2`}></div>
                {message}
              </div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Fila 1: Nombre y Apellido */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-blue-300" />
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Tu nombre"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-blue-300" />
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Tu apellido"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Usuario */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-blue-300" />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="Nombre de usuario"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-blue-300" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  required
                />
              </div>
            </div>

            {/* Fila 2: Rol y ID Estudiante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">
                  Rol
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Shield className="h-4 w-4 text-blue-300" />
                  </div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm appearance-none"
                    required
                  >
                    <option value="student" className="bg-slate-800">Estudiante</option>
                    <option value="instructor" className="bg-slate-800">Instructor</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-100">
                  ID Estudiante
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 text-blue-300" />
                  </div>
                  <input
                    type="text"
                    name="student_id"
                    placeholder="ID de estudiante"
                    value={formData.student_id}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Crea tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-11 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-blue-300" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password_confirm"
                  placeholder="Confirma tu contraseña"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-11 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Registrando...
                </div>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-blue-200 text-sm">
                ¿Ya tienes una cuenta?{" "}
                <a 
                  href="/login"
                  className="text-blue-300 hover:text-white underline transition-colors"
                >
                  Iniciar sesión
                </a>
              </p>
            </div>
          </div>
        </div>
        {/* Additional info */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-xs">
            Al registrarte, aceptas nuestros términos y condiciones de uso
          </p>
        </div>
      </div>
    </div>
  );
}