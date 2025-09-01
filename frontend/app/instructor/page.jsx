// app/instructor/page.jsx
"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { Building2, Users, CalendarDays, Activity, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default function InstructorDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await authFetch("/attendance/instructor/dashboard/", { method: "GET" });

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = "/login";
            return;
          }
          if (res.status === 403) {
            // Usuario logueado pero NO es instructor → mándalo al dashboard de estudiante
            window.location.href = "/dashboard";
            return;
          }
          const txt = await res.text();
          throw new Error(`❌ Respuesta no OK: ${res.status} "${txt}"`);
        }

        const data = await res.json();
        setSummary(data.summary || null);
        setRecent(data.recent_attendances || []);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el dashboard del instructor.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-2xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-6">
      <header className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center space-x-3">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-xl">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard del Instructor</h1>
            <p className="text-blue-200 text-sm">Resumen general de cursos y asistencias</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Tarjetas de resumen */}
        {summary && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card
                title="Cursos"
                value={summary.total_courses}
                icon={<Activity className="w-5 h-5" />}
              />
              <Card
                title="Cursos activos"
                value={summary.active_courses}
                icon={<Activity className="w-5 h-5" />}
              />
              <Card
                title="Estudiantes"
                value={summary.total_students}
                icon={<Users className="w-5 h-5" />}
              />
              <Card
                title="Sesiones"
                value={summary.total_sessions}
                icon={<CalendarDays className="w-5 h-5" />}
              />
              <Card
                title="Sesiones activas"
                value={summary.active_sessions}
                icon={<CalendarDays className="w-5 h-5" />}
              />
            </div>
            <div className="mt-6">
                <Link
                  href="/instructor/courses"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition"
                >
                  📚 Gestionar Cursos
                </Link>
                <Link
                  href="/instructor/sessions"
                  className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition"
                >
                  📅 Gestionar Sesiones
                </Link>
              </div>
          </>

        )}

        {/* Últimas asistencias */}
        <section className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-xl">
          <h2 className="text-white font-semibold mb-4">Últimas asistencias</h2>

          {recent.length === 0 ? (
            <p className="text-blue-200 text-sm">No hay registros recientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-blue-100">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="py-3 pr-4">Aprendiz</th>
                    <th className="py-3 pr-4">Curso</th>
                    <th className="py-3 pr-4">Fecha</th>
                    <th className="py-3 pr-4">Estado</th>
                    <th className="py-3 pr-4">Verificación</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, idx) => (
                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 pr-4">{r.student_name}</td>
                      <td className="py-3 pr-4">{r.course}</td>
                      <td className="py-3 pr-4">{r.date}</td>
                      <td className="py-3 pr-4">{r.status}</td>
                      <td className="py-3 pr-4">
                        {r.verified_by_face ? (
                          <span className="inline-flex items-center">
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Facial
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <XCircle className="w-4 h-4 mr-1" /> Manual/No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between text-blue-200">
        <span className="text-sm">{title}</span>
        <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white mt-2">{value}</div>
    </div>
  );
}


