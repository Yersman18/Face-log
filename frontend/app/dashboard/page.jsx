"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch("http://127.0.0.1:8000/api/auth/profile/");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          router.push("/login"); // si no hay sesión activa
        }
      } catch (err) {
        console.error("Error cargando perfil:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) return <p className="p-6">⏳ Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard</h1>
      <p className="mb-4">Bienvenido, <b>{user?.username}</b> 👋</p>
      <p className="mb-6">Tu rol es: <b>{user?.role}</b></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opciones comunes para todos */}
        <button
          onClick={() => router.push("/profile")}
          className="p-4 border rounded shadow hover:bg-gray-100"
        >
          👤 Mi Perfil
        </button>

        {/* Opciones dinámicas según el rol */}
        {user?.role === "student" && (
          <>
            <button
              onClick={() => router.push("/attendance/my")}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              ✅ Mi Asistencia
            </button>

            <button
              onClick={() => router.push("/excuses")}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              📝 Mis Excusas
            </button>
          </>
        )}

        {user?.role === "instructor" && (
          <>
            <button
              onClick={() => router.push("/attendance/courses")}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              🎓 Cursos que dicto
            </button>

            <button
              onClick={() => router.push("/attendance/sessions")}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              📅 Sesiones de asistencia
            </button>
          </>
        )}

        {user?.role === "admin" && (
          <>
            <button
              onClick={() => router.push("/attendance/stats")}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              📈 Estadísticas generales
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="p-4 border rounded shadow hover:bg-gray-100"
            >
              ⚙️ Panel de administración
            </button>
          </>
        )}
      </div>
    </div>
  );
}
