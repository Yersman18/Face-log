// app/instructor/sessions/page.jsx
"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { CalendarDays, PlusCircle } from "lucide-react";

export default function InstructorSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSession, setNewSession] = useState({
    course: "",
    date: "",
    start_time: "",
    end_time: "",
  });
  const [creating, setCreating] = useState(false);

  // 🔹 Cargar cursos del instructor
  const loadCourses = async () => {
    try {
      const res = await authFetch("/attendance/courses/");
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("❌ Error cargando cursos:", err);
    }
  };

  // 🔹 Cargar sesiones
  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/attendance/sessions/");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("❌ Error cargando sesiones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadSessions();
  }, []);

  // 🔹 Crear nueva sesión
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSession.course || !newSession.date || !newSession.start_time || !newSession.end_time) {
      alert("Completa todos los campos");
      return;
    }

    setCreating(true);
    try {
      const res = await authFetch("/attendance/sessions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }

      setNewSession({ course: "", date: "", start_time: "", end_time: "" });
      loadSessions();
    } catch (err) {
      console.error("❌ Error creando sesión:", err);
      alert("Error creando sesión: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // 🔹 Iniciar sesión
  const startSession = async (sessionId) => {
    try {
      const res = await authFetch(`/attendance/sessions/${sessionId}/start/`, {
        method: "POST",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      loadSessions();
    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      alert("No se pudo iniciar la sesión: " + err.message);
    }
  };

  // 🔹 Cerrar sesión
  const closeSession = async (sessionId) => {
    try {
      const res = await authFetch(`/attendance/sessions/${sessionId}/close/`, {
        method: "POST",
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt);
      }
      loadSessions();
    } catch (err) {
      console.error("❌ Error al cerrar sesión:", err);
      alert("No se pudo cerrar la sesión: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <header className="max-w-5xl mx-auto mb-8 flex items-center space-x-3">
        <CalendarDays className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold">Sesiones de Asistencia</h1>
      </header>

      <main className="max-w-5xl mx-auto space-y-10">
        {/* Formulario para crear sesión */}
        <form
          onSubmit={handleCreateSession}
          className="bg-white/10 border border-white/20 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <PlusCircle className="w-5 h-5 mr-2 text-green-400" />
            Crear nueva sesión
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🔹 Selector de curso por código */}
            <select
              value={newSession.course}
              onChange={(e) => setNewSession({ ...newSession, course: e.target.value })}
              className="p-2 rounded-lg text-black"
              required
            >
              <option value="">Selecciona un curso</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              type="date"
              value={newSession.date}
              onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
              className="p-2 rounded-lg text-black"
              required
            />

            <input
              type="time"
              value={newSession.start_time}
              onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
              className="p-2 rounded-lg text-black"
              required
            />

            <input
              type="time"
              value={newSession.end_time}
              onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
              className="p-2 rounded-lg text-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {creating ? "Creando..." : "Crear sesión"}
          </button>
        </form>

        {/* Lista de sesiones */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Sesiones creadas</h2>
          {loading ? (
            <p>Cargando sesiones...</p>
          ) : sessions.length === 0 ? (
            <p className="text-blue-300">No tienes sesiones creadas aún.</p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold">{s.course_name || s.course?.name}</p>
                    <p className="text-sm text-blue-300">
                      {s.date} {s.start_time} - {s.end_time}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Estado */}
                    <span
                      className={`px-2 py-1 text-xs rounded-lg ${
                        s.is_active ? "bg-green-600/30 text-green-300" : "bg-red-600/30 text-red-300"
                      }`}
                    >
                      {s.is_active ? "Activa" : "Inactiva"}
                    </span>

                    {/* Botones dinámicos */}
                    {!s.attendance_started_at ? (
                      <button
                        onClick={() => startSession(s.id)}
                        className="px-3 py-1 rounded-lg text-sm bg-green-600 hover:bg-green-700 text-white"
                      >
                        Iniciar
                      </button>
                    ) : !s.attendance_closed_at ? (
                      <button
                        onClick={() => closeSession(s.id)}
                        className="px-3 py-1 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cerrar
                      </button>
                    ) : (
                      <span className="text-gray-400 text-sm">Finalizada</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
