const API_URL = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      body.error ?? body.message ?? `HTTP ${res.status}`,
    ) as Error & { status: number; action?: string };
    err.status = res.status;
    if (body.action) err.action = body.action;
    throw err;
  }
  return body as T;
}

const withBody = (method: string, data?: unknown) => ({
  method,
  body: JSON.stringify(data ?? {}),
});

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, withBody("POST", data)),
  patch: <T>(path: string, data?: unknown) =>
    request<T>(path, withBody("PATCH", data)),
  del: <T>(path: string, data?: unknown) =>
    request<T>(path, withBody("DELETE", data)),
};
