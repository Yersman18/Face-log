"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch("/attendance/student/dashboard/");
        if (!res.ok) throw new Error("Error al obtener datos del dashboard");
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div>Cargando dashboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Dashboard Estudiante</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Información del Estudiante</h2>
        <p><strong>Nombre:</strong> {data.student_info.name}</p>
        <p><strong>Documento:</strong> {data.student_info.document}</p>
        <p><strong>Ficha:</strong> {data.student_info.ficha} - {data.student_info.ficha_name}</p>
        <p><strong>Estado Académico:</strong> {data.student_info.estado_academico}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Estadísticas de Asistencia</h2>
        <pre>{JSON.stringify(data.attendance_stats, null, 2)}</pre>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Cursos</h2>
        <ul className="list-disc pl-6">
          {data.courses.map(course => (
            <li key={course.id}>{course.code} - {course.name}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Próximas Sesiones</h2>
        <ul className="list-disc pl-6">
          {data.upcoming_sessions.map(session => (
            <li key={session.id}>
              {session.course} - {new Date(session.date).toLocaleDateString()} {session.start_time} - {session.end_time} {session.is_active ? "(Activa)" : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
