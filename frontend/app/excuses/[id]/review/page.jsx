// frontend/app/excuses/[id]/review/page.jsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authFetch } from "@/lib/api";

export default function ExcuseReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [excuse, setExcuse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Traer la excusa al cargar
  useEffect(() => {
    const fetchExcuse = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excuses/${id}/`);
        if (!res.ok) throw new Error("Error al obtener excusa");
        const data = await res.json();
        setExcuse(data);
      } catch (err) {
        console.error(err);
        setError("❌ No se pudo cargar la excusa");
      }
    };

    if (id) fetchExcuse();
  }, [id]);

  // Enviar revisión
  const handleReview = async (newStatus) => {
    setLoading(true);
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/excuses/${id}/review/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Error al revisar excusa");

      alert("✅ Excusa actualizada correctamente");
      router.push(`/excuses/${id}`);
    } catch (err) {
      console.error(err);
      setError("❌ No se pudo actualizar la excusa");
    } finally {
      setLoading(false);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!excuse) return <p>Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">📋 Revisar excusa</h1>

      <div className="p-4 border rounded shadow mb-4">
        <p><b>Motivo:</b> {excuse.reason}</p>
        <p><b>Estado actual:</b> {excuse.status}</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleReview("approved")}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          ✅ Aprobar
        </button>
        <button
          onClick={() => handleReview("rejected")}
          className="px-4 py-2 bg-red-600 text-white rounded"
          disabled={loading}
        >
          ❌ Rechazar
        </button>
      </div>
    </div>
  );
}
