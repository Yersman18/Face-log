// frontend/app/attendance/courses/page.jsx
"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ code: "", name: "", description: "" });

  // Cargar cursos
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoading(true);
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/courses/`
        );
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        } else {
          console.error("Error cargando cursos", res.status);
        }
      } catch (err) {
        console.error("Error cargando cursos", err);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Crear curso
  async function handleCreateCourse() {
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/attendance/courses/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCourse),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setCourses((prev) => [...prev, data]);
        setShowCreateModal(false);
        setNewCourse({ code: "", name: "", description: "" });
      } else {
        const errorData = await res.json();
        alert("Error creando curso: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error("Error creando curso", err);
    }
  }

  if (loading) return <p className="p-6">Cargando cursos...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 Mis Cursos</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Crear Curso
        </button>
      </div>

      {/* Lista de cursos */}
      {courses.length === 0 ? (
        <p>No tienes cursos todavía.</p>
      ) : (
        <ul className="space-y-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="border p-4 rounded shadow-sm bg-white"
            >
              <h3 className="font-semibold">{course.name}</h3>
              <p className="text-sm text-gray-600">
                {course.description || "Sin descripción"}
              </p>
              <p className="text-xs text-gray-500">Código: {course.code}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Modal para crear curso */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Curso</h2>

            <input
              type="text"
              placeholder="Código del curso"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
              className="w-full border p-2 mb-3 rounded"
              required
            />

            <input
              type="text"
              placeholder="Nombre del curso"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              className="w-full border p-2 mb-3 rounded"
              required
            />

            <textarea
              placeholder="Descripción (opcional)"
              value={newCourse.description}
              onChange={(e) =>
                setNewCourse({ ...newCourse, description: e.target.value })
              }
              className="w-full border p-2 mb-3 rounded"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCourse}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
