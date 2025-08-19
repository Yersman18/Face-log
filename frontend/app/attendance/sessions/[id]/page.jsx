"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { authFetch } from "@/lib/api";

export default function SessionDetail() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await authFetch(`http://127.0.0.1:8000/api/attendance/sessions/${id}/`);
        if (!res.ok) throw new Error("Error al obtener la sesión");
        const data = await res.json();
        setSession(data);
      } catch (err) {
        setError(err.message);
      }
    }
    if (id) fetchSession();
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!session) return <p>Cargando sesión...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle de la sesión</h1>
      <p><strong>Curso:</strong> {session.course?.name}</p>
      <p><strong>Fecha:</strong> {session.date}</p>
      <p><strong>Hora inicio:</strong> {session.start_time}</p>
      <p><strong>Activa:</strong> {session.is_active ? "Sí" : "No"}</p>
    </div>
  );
}
