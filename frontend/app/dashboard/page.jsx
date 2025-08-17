"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("access");
    if (!token) {
      router.push("/login");
    } else {
      // Traer perfil
      api.get("/authentication/profile/")
        .then(res => setUser(res.data))
        .catch(() => router.push("/login"));
    }
  }, [router]);

  if (!user) return <p className="p-4">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Bienvenido {user.username}</h1>
      <p className="mt-2">Rol: {user.role}</p>
    </div>
  );
}
