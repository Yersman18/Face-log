"use client";
import { useState } from "react";
import { Eye, EyeOff, Building2, Lock, User, Mail, UserCheck, CreditCard } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    role: "student", // 🔥 fijo en student
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
      {/* ... resto del formulario igual ... */}

      {/* 🔥 Eliminé el select de Rol */}

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

      {/* resto igual */}
    </div>
  );
}
