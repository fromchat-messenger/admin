import { API_BASE_URL } from "@/config";
import { notifyServerLikelyReachable } from "@/ws/adminWebSocketCoordinator";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function authHeaders(token: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(
  path: string,
  token: string | null,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(token),
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  if (res.ok && token) {
    notifyServerLikelyReachable(true);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || body.message || detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, String(detail));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}