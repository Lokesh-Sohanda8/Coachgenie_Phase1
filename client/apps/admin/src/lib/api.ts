
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const TENANT = process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN;

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": TENANT!,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    // attempt refresh, then retry once
    const refreshed = await tryRefresh();
    if (!refreshed) { window.location.href = "/login"; return; }
    return request(path, options); // retry
  }

  if (!res.ok) throw await res.json();
  return res.json();
}

async function tryRefresh() {
  const refresh_token = sessionStorage.getItem("refresh_token");
  if (!refresh_token) return false;
  try {
    const data = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Tenant-Subdomain": TENANT! },
      body: JSON.stringify({ refresh_token }),
    }).then(r => r.json());
    sessionStorage.setItem("access_token", data.access_token);
    return true;
  } catch { return false; }
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body: unknown) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: "DELETE" }),
};