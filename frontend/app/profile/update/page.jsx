"use client";
import { useState, useEffect } from "react";
import { authFetch, API_URL } from "@/lib/api";

export default function UpdateProfilePage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    student_id: "",
    role: "",
  });
  const [message, setMessage] = useState("");

  // Cargar datos actuales del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${API_URL}/auth/profile/`);
        const data = await res.json();
        if (res.ok) {
          setForm({
            username: data.username || "",
            email: data.email || "",
            student_id: data.student_id || "",
            role: data.role || "",
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

  // Manejar cambios en formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Enviar actualización
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await authFetch(`${API_URL}/auth/profile/update/`, {
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
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Actualizar Perfil</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          name="username"
          placeholder="Usuario"
          value={form.username}
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

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="student">Estudiante</option>
          <option value="instructor">Instructor</option>
          <option value="admin">Administrador</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded"
        >
          Guardar cambios
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
