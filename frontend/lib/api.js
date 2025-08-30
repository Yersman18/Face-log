// frontend/lib/api.js

// URL base del backend (sin /api)
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// URL base del API
const BASE_API_URL = `${API_URL}/api`;
const AUTH_URL = `${BASE_API_URL}/auth`;

// Guardar tokens en localStorage
export function saveTokens(access, refresh) {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
}

// Obtener tokens
export function getAccessToken() {
  return localStorage.getItem("access");
}

export function getRefreshToken() {
  return localStorage.getItem("refresh");
}

// Refrescar token si expiró
export async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const res = await fetch(`${AUTH_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      saveTokens(data.access, refresh); // actualizamos el access
      return data.access;
    } else {
      console.warn("⚠️ Refresh token inválido o expirado, limpiando sesión.");
      clearTokens();
      return null;
    }
  } catch (err) {
    console.error("Error al refrescar token:", err);
    clearTokens();
    return null;
  }
}

// Limpiar tokens (logout)
export function clearTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

// Fetch con auth automático
export async function authFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${BASE_API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  let token = getAccessToken();

  if (!options.headers) options.headers = {};
  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, options);

  // Si expiró el token, intentamos refrescar
  if (res.status === 401) {
    token = await refreshToken();
    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, options); // reintenta la request
    } else {
      // si no hay token válido → forzar logout
      return new Response(
        JSON.stringify({ error: "No autorizado. Inicia sesión de nuevo." }),
        { status: 401 }
      );
    }
  }

  return res;
}
