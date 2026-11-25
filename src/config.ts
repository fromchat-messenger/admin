export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://127.0.0.1:8300";

export function apiWebSocketUrl(path: string): string {
  const base = API_BASE_URL.replace(/^http/, "ws");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}