'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ endpoint correcto con /api/
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/student/dashboard/`
        );

        if (!res.ok) {
          const errMsg = await res.text();
          console.error("❌ Respuesta no OK:", res.status, errMsg);
          throw new Error('Error al cargar datos');
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("❌ Error cargando dashboard:", err);
        setError('No se pudo cargar el dashboard');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) return <p className="p-6">Cargando dashboard...</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!data) return null;

  const { student_info, attendance_stats, courses, upcoming_sessions } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-xl p-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Bienvenido, {student_info.name}
        </h1>
        <p className="text-gray-600">Este es tu panel personal de aprendiz</p>
      </div>

      {/* Perfil */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📋 Perfil del Aprendiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
          <p><strong>Ficha:</strong> {student_info.ficha}</p>
          <p><strong>Programa:</strong> {student_info.ficha_name}</p>
          <p><strong>Estado académico:</strong> {student_info.estado_academico}</p>
          <p><strong>Documento:</strong> {student_info.document}</p>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📊 Estadísticas de Asistencia</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-lg bg-blue-50">
            <p className="text-2xl font-bold text-blue-700">
              {attendance_stats.attendance_rate ?? 'N/A'}%
            </p>
            <p className="text-gray-600 text-sm">Asistencia</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50">
            <p className="text-2xl font-bold text-green-700">
              {attendance_stats.present ?? 0}
            </p>
            <p className="text-gray-600 text-sm">Presentes</p>
          </div>
          <div className="p-4 rounded-lg bg-red-50">
            <p className="text-2xl font-bold text-red-700">
              {attendance_stats.absent ?? 0}
            </p>
            <p className="text-gray-600 text-sm">Ausentes</p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50">
            <p className="text-2xl font-bold text-yellow-700">
              {attendance_stats.excused ?? 0}
            </p>
            <p className="text-gray-600 text-sm">Excusados</p>
          </div>
        </div>
      </section>

      {/* Próximas sesiones */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📅 Próximas Sesiones</h2>
        {upcoming_sessions.length === 0 ? (
          <p className="text-gray-600">No hay próximas sesiones</p>
        ) : (
          <ul className="space-y-3">
            {upcoming_sessions.map((session) => (
              <li
                key={session.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="font-medium text-gray-800">{session.course}</p>
                <p className="text-sm text-gray-600">
                  {session.date} ({session.start_time} - {session.end_time})
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cursos */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">📚 Cursos Inscritos</h2>
        {courses.length === 0 ? (
          <p className="text-gray-600">No estás inscrito en ningún curso.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <li
                key={course.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <p className="font-medium text-gray-800">{course.name}</p>
                <p className="text-sm text-gray-600">{course.code}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
