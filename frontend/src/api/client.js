const BASE = import.meta.env.VITE_API_URL || "";

export function getToken() {
  return localStorage.getItem("token");
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

export function setToken(token) {
  localStorage.setItem("token", token);
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem("refreshToken", token);
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
}

function formatApiError(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg || e.message || "Validation error").join(". ");
  }
  return "Request failed";
}

export async function api(path, options = {}) {
  const isForm = options.body instanceof FormData;
  const headers = { ...options.headers };
  if (!isForm) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(formatApiError(err.detail));
  }
  return res.status === 204 ? null : res.json();
}

export async function loginApi(email, password) {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export const fetchMe = () => api("/api/auth/me");
