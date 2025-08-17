// frontend/lib/api.js

const API_URL = "http://127.0.0.1:8000/api/auth"; // tu backend

// Guardar tokens en localStorage
export function saveTokens(access, refresh) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
}

// Obtener access token
export function getAccessToken() {
  return localStorage.getItem("access");
}

// Refrescar token si expiró
export async function refreshToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const res = await fetch(`${API_URL}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (res.ok) {
    const data = await res.json();
    saveTokens(data.access, refresh); // actualizamos el access
    return data.access;
  } else {
    console.error("Error refrescando token");
    return null;
  }
}

// Fetch con auth automático
export async function authFetch(url, options = {}) {
  let token = getAccessToken();
  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, options);

  // Si expiró el token, intentamos refrescar
  if (res.status === 401) {
    token = await refreshToken();
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, options); // reintenta la request
    }
  }

  return res;
}
