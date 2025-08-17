"use client";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await authFetch("http://127.0.0.1:8000/api/auth/profile/");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.error("Error al traer el perfil");
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Perfil</h1>
      {profile ? (
        <pre className="bg-gray-100 p-4 mt-2">{JSON.stringify(profile, null, 2)}</pre>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
