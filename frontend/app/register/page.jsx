"use client";
import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserCheck, GraduationCap, Shield, CheckCircle, AlertCircle, UserPlus } from "lucide-react";

// Simulamos API_URL y saveTokens para el ejemplo
const API_URL = "http://127.0.0.1:8000/api";
const saveTokens = (access, refresh) => {
  // En una implementación real, aquí guardarías los tokens
  console.log("Tokens saved:", { access, refresh });
};

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
    student_id: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Limpiar error específico del campo
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }

    // Calcular fuerza de contraseña
    if (name === "password") {
      let strength = 0;
      if (value.length >= 8) strength += 25;
      if (/[a-z]/.test(value)) strength += 25;
      if (/[A-Z]/.test(value)) strength += 25;
      if (/[0-9]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value)) strength += 25;
      setPasswordStrength(strength);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!form.username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (form.username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!form.email.trim()) {
      errors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Ingresa un email válido";
    }

    if (!form.password) {
      errors.password = "La contraseña es requerida";
    } else if (form.password.length < 8) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (form.role === "student" && form.student_id && form.student_id.length < 3) {
      errors.student_id = "El ID de estudiante debe tener al menos 3 caracteres";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

  const getRoleIcon = (role) => {
    switch(role) {
      case 'student': return <GraduationCap className="w-4 h-4" />;
      case 'instructor': return <UserCheck className="w-4 h-4" />;
      case 'admin': return <Shield className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!validateForm()) {
      setMessage("Por favor, corrige los errores en el formulario");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      // Simulación de registro
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular diferentes respuestas
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        const mockTokens = {
          access: "mock-access-token",
          refresh: "mock-refresh-token"
        };
        
        saveTokens(mockTokens.access, mockTokens.refresh);
        setMessage("¡Registro exitoso! Tu cuenta ha sido creada correctamente.");
        setMessageType("success");
        
        // Limpiar formulario
        setTimeout(() => {
          setForm({
            username: "",
            email: "",
            password: "",
            role: "student",
            student_id: "",
          });
          setPasswordStrength(0);
        }, 2000);
        
      } else {
        // Simular errores específicos del servidor
        const mockErrors = {
          username: ["Este nombre de usuario ya está en uso"],
          email: ["Este email ya está registrado"],
        };
        
        setFieldErrors(mockErrors);
        setMessage("Ya existe una cuenta con estos datos. Intenta con información diferente.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Error en la conexión con el servidor. Por favor, inténtalo de nuevo.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <UserPlus className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Únete a nuestra plataforma educativa</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-white" />
              <div>
                <h2 className="text-xl font-semibold text-white">Registro de Usuario</h2>
                <p className="text-blue-100 text-sm">Completa tus datos para comenzar</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Message Alert */}
            {message && (
              <div className={`mb-6 p-4 rounded-lg border ${
                messageType === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center">
                  {messageType === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  )}
                  <p className={`text-sm font-medium ${
                    messageType === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {message}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de Usuario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                      fieldErrors.username 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Ingresa tu nombre de usuario"
                    required
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                      fieldErrors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 transition-colors ${
                      fieldErrors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Crea una contraseña segura"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                
                {/* Password Strength */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Fuerza de la contraseña:</span>
                      <span className="font-medium">{getPasswordStrengthText()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    {getRoleIcon(form.role)}
                  </div>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    required
                  >
                    <option value="student">Estudiante</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Student ID (conditional) */}
              {form.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de Estudiante
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <GraduationCap className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="student_id"
                      value={form.student_id}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-colors ${
                        fieldErrors.student_id 
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="EST-2024-001 (opcional)"
                    />
                  </div>
                  {fieldErrors.student_id && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.student_id}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Si eres estudiante, puedes agregar tu ID institucional
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Crear Cuenta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Inicia sesión aquí
            </a>
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Seguridad y Privacidad</h4>
              <p className="text-sm text-blue-700">
                Tu información está protegida con encriptación de última generación. 
                Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}