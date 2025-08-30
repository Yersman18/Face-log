// Update Profile Page
"use client";
import { useState, useEffect } from "react";
import { authFetch, API_URL } from "@/lib/api";

export default function UpdateProfilePage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    student_id: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar datos actuales del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/auth/profile/`);
        const data = await res.json();
        if (res.ok) {
          setForm({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            student_id: data.student_id || "",
          });
        } else {
          setMessage("❌ Error al cargar perfil");
        }
      } catch (error) {
        setMessage("❌ Error en la conexión");
      }
    };
    fetchProfile();
  }, []);

  // Manejar cambios
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/api/auth/profile/update/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Perfil actualizado correctamente");
      } else {
        setMessage("❌ Error: " + JSON.stringify(data));
      }
    } catch (error) {
      setMessage("❌ Error en la conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Actualizar Perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="first_name"
          placeholder="Nombre"
          value={form.first_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="last_name"
          placeholder="Apellido"
          value={form.last_name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="student_id"
          placeholder="ID Estudiante"
          value={form.student_id}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "⏳ Guardando cambios..." : "Guardar cambios"}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
