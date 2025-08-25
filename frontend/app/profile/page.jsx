// frontend/app/profile/page.jsx
"use client";
import { useEffect, useState } from "react";
import { API_URL, authFetch, clearTokens } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // 👇 corregido: ahora apunta a /api/auth/profile/
        const res = await authFetch(`${API_URL}/api/auth/profile/`);
        if (!res.ok) throw new Error("Error al obtener el perfil");

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("❌ Error al cargar perfil:", err);
        setError("No se pudo cargar el perfil. Inicia sesión de nuevo.");
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearTokens();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Perfil</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {profile ? (
          <div className="space-y-2">
            <p>
              <strong>Usuario:</strong> {profile.username}
            </p>
            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            <p>
              <strong>Rol:</strong> {profile.role}
            </p>
            <p>
              <strong>ID Estudiante:</strong> {profile.student_id || "N/A"}
            </p>

            {/* Botones de acción */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => (window.location.href = "/profile/update")}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Editar Perfil
              </button>

              <button
                onClick={() =>
                  (window.location.href = "/profile/change-password")
                }
                className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
              >
                Cambiar Contraseña
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : (
          !error && <p className="text-center">Cargando perfil...</p>
        )}
      </div>
    </div>
  );
}
