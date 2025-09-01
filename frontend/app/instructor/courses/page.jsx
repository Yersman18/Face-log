"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { BookOpen, PlusCircle, Pencil, Trash2, Check, X } from "lucide-react";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCourse, setNewCourse] = useState({ name: "", code: "" });
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", code: "" });

  // Cargar cursos del instructor
  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/attendance/courses/");
      if (!res.ok) throw new Error("Error al cargar cursos");

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los cursos");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Activar / Desactivar curso
  const toggleCourse = async (courseId) => {
    try {
      const res = await authFetch(`/attendance/courses/${courseId}/toggle/`, {
        method: "POST",
      });

      if (!res.ok) throw new Error(await res.text());

      loadCourses();
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err);
      alert("No se pudo cambiar el estado del curso.");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Crear curso nuevo
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.code) return;

    setCreating(true);
    try {
      const res = await authFetch("/attendance/courses/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (!res.ok) throw new Error(await res.text());

      setNewCourse({ name: "", code: "" });
      await loadCourses();
    } catch (err) {
      console.error(err);
      alert("❌ Error creando curso: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  // Editar curso
  const handleSaveEdit = async (courseId) => {
    try {
      const res = await authFetch(`/attendance/courses/${courseId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (!res.ok) throw new Error(await res.text());

      const updated = await res.json();
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("❌ Error guardando curso: " + err.message);
    }
  };

  // Eliminar curso
  const handleDeleteCourse = async (courseId) => {
    if (!confirm("¿Seguro que deseas eliminar este curso?")) return;

    try {
      const res = await authFetch(`/attendance/courses/${courseId}/`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(await res.text());

      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      console.error(err);
      alert("❌ Error eliminando curso: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">
      <header className="max-w-5xl mx-auto mb-8 flex items-center space-x-3">
        <BookOpen className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold">Mis Cursos</h1>
      </header>

      <main className="max-w-5xl mx-auto space-y-10">
        {/* Formulario para crear curso */}
        <form
          onSubmit={handleCreateCourse}
          className="bg-white/10 border border-white/20 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <PlusCircle className="w-5 h-5 mr-2 text-green-400" />
            Crear nuevo curso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre del curso"
              value={newCourse.name}
              onChange={(e) =>
                setNewCourse({ ...newCourse, name: e.target.value })
              }
              className="p-2 rounded-lg text-black"
              required
            />
            <input
              type="text"
              placeholder="Código del curso"
              value={newCourse.code}
              onChange={(e) =>
                setNewCourse({ ...newCourse, code: e.target.value })
              }
              className="p-2 rounded-lg text-black"
              required
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold disabled:opacity-60"
          >
            {creating ? "Creando..." : "Crear curso"}
          </button>
        </form>

        {/* Lista de cursos */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Cursos creados</h2>
          {loading ? (
            <p>Cargando cursos...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-blue-300">No tienes cursos creados aún.</p>
          ) : (
            <ul className="space-y-3">
              {courses.map((c) => (
                <li
                  key={c.id}
                  className="bg-white/10 border border-white/20 rounded-xl p-4 flex justify-between items-center"
                >
                  {editingId === c.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        className="p-1 rounded text-black"
                      />
                      <input
                        type="text"
                        value={editData.code}
                        onChange={(e) =>
                          setEditData({ ...editData, code: e.target.value })
                        }
                        className="p-1 rounded text-black"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-sm text-blue-300">{c.code}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(c.id)}
                          className="bg-green-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Check size={16} /> Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <X size={16} /> Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setEditData({ name: c.name, code: c.code });
                          }}
                          className="bg-blue-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Pencil size={16} /> Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="bg-red-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => toggleCourse(c.id)}
                      className={`px-3 py-1 rounded-lg text-sm text-white ${
                        c.is_active
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {c.is_active ? "Desactivar" : "Activar"}
                    </button>
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
