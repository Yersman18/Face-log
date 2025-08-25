"use client";
import { useState } from "react";
import { saveTokens } from "@/lib/api";
import { Eye, EyeOff, Building2, Shield, Lock, User, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      saveTokens(data.access, data.refresh);

      window.location.href = "/profile"; // Redirige al perfil
    } catch (err) {
      console.error("❌ Error en login:", err);
      setError("Usuario o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradientDamd-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
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
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-2xl">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Portal Institucional</h1>
          <p className="text-blue-200 text-sm">Acceso seguro al sistema</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-blue-300 mr-2" />
            <h2 className="text-xl font-semibold text-white">Iniciar Sesión</h2>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-2xl mb-6 text-sm backdrop-blur-sm">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-100">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Ingresando...
                </div>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-blue-200 text-sm mb-4">
                ¿No tienes cuenta?
              </p>
              <a 
                href="/register" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl font-medium transition-all duration-200 transform hover:scale-[1.02] backdrop-blur-sm w-full sm:w-auto"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Crear nueva cuenta
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-blue-200 text-sm">
                Sistema seguro y protegido
              </p>
              <div className="flex items-center justify-center mt-2 text-blue-300">
                <Shield className="w-4 h-4 mr-1" />
                <span className="text-xs">Cifrado end-to-end</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="text-center mt-6">
          <p className="text-blue-200 text-xs">
            ¿Problemas para acceder?{" "}
            <button className="text-blue-300 hover:text-white underline transition-colors">
              Contactar soporte técnico
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}