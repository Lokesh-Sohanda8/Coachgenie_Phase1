// // Central fetch wrapper — adds auth + tenant headers automatically

// import { useAuthStore } from "@/lib/stores/auth.store";

// const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// function getHeaders(): HeadersInit {
//   const token    = useAuthStore.getState().accessToken;
//   const tenantId = useAuthStore.getState().tenantId
//     ?? process.env.NEXT_PUBLIC_TENANT_ID
//     ?? "";

//   return {
//     "Content-Type":  "application/json",
//     "x-tenant-id":   tenantId,
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

// async function handleResponse<T>(res: Response): Promise<T> {
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(
//       (err as { message?: string; detail?: string }).message
//       ?? (err as { detail?: string }).detail
//       ?? `HTTP ${res.status}`
//     );
//   }
//   return res.json() as Promise<T>;
// }

// export const api = {
//   get: <T>(path: string) =>
//     fetch(`${BASE}${path}`, { headers: getHeaders() })
//       .then(r => handleResponse<T>(r)),

//   post: <T>(path: string, body?: unknown) =>
//     fetch(`${BASE}${path}`, {
//       method:  "POST",
//       headers: getHeaders(),
//       body:    body !== undefined ? JSON.stringify(body) : undefined,
//     }).then(r => handleResponse<T>(r)),

//   patch: <T>(path: string, body?: unknown) =>
//     fetch(`${BASE}${path}`, {
//       method:  "PATCH",
//       headers: getHeaders(),
//       body:    body !== undefined ? JSON.stringify(body) : undefined,
//     }).then(r => handleResponse<T>(r)),

//   delete: <T>(path: string) =>
//     fetch(`${BASE}${path}`, {
//       method:  "DELETE",
//       headers: getHeaders(),
//     }).then(r => handleResponse<T>(r)),
// };

// Code starts from here
// apps/admin/src/lib/api.ts
// import { useAuthStore } from "@/store/authStore";

// import { useAuthStore } from "@/lib/stores/auth.store";

// const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// function getHeaders(): HeadersInit {
//   const token = useAuthStore.getState().accessToken;
//   return {
//     "Content-Type":       "application/json",
//     "X-Tenant-Subdomain": process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN ?? "demo",
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// }

// async function handle<T>(res: Response): Promise<T> {
//   if (!res.ok) {
//     const e = await res.json().catch(() => ({}));
//     throw new Error((e as { detail?: string; message?: string }).detail ?? `HTTP ${res.status}`);
//   }
//   return res.json() as Promise<T>;
// }

// export const api = {
//   get:    <T>(path: string)              => fetch(`${BASE}${path}`, { headers: getHeaders() }).then(r => handle<T>(r)),
//   post:   <T>(path: string, body?: unknown) => fetch(`${BASE}${path}`, { method: "POST",  headers: getHeaders(), body: body !== undefined ? JSON.stringify(body) : undefined }).then(r => handle<T>(r)),
//   patch:  <T>(path: string, body?: unknown) => fetch(`${BASE}${path}`, { method: "PATCH", headers: getHeaders(), body: body !== undefined ? JSON.stringify(body) : undefined }).then(r => handle<T>(r)),
//   delete: <T>(path: string)              => fetch(`${BASE}${path}`, { method: "DELETE", headers: getHeaders() }).then(r => handle<T>(r)),
// };


import { useAuthStore } from "@/lib/stores/auth.store";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

function getHeaders(): HeadersInit {
  const token = useAuthStore.getState().accessToken;
  return {
    "Content-Type":       "application/json",
    "X-Tenant-Subdomain": process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN ?? "demo",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    useAuthStore.getState().clear();
    document.cookie = "cg_access_token=; path=/; max-age=0";
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string; detail?: string };
    throw new Error(err.message ?? err.detail ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string) =>
    fetch(`${BASE}${path}`, { headers: getHeaders() }).then(r => handleResponse<T>(r)),

  post:   <T>(path: string, body?: unknown) =>
    fetch(`${BASE}${path}`, { method: "POST", headers: getHeaders(), body: body !== undefined ? JSON.stringify(body) : undefined }).then(r => handleResponse<T>(r)),

  patch:  <T>(path: string, body?: unknown) =>
    fetch(`${BASE}${path}`, { method: "PATCH", headers: getHeaders(), body: body !== undefined ? JSON.stringify(body) : undefined }).then(r => handleResponse<T>(r)),

  delete: <T>(path: string) =>
    fetch(`${BASE}${path}`, { method: "DELETE", headers: getHeaders() }).then(r => handleResponse<T>(r)),
};