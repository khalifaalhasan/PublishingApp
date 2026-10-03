// Dipanggil dari browser: cookie sesi ikut terkirim lewat credentials: "include",
// dan browser otomatis menyertakan header Origin.
// ASUMSI: endpoint POST /submissions dan PATCH /submissions/:id.
// Sesuaikan path di bawah kalau API contract kamu berbeda.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

async function request(path: string, init: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(body?.message ?? `Permintaan gagal (${res.status}).`);
  }
  return body;
}

export function createSubmission(payload: unknown) {
  return request("/submissions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSubmission(id: string, payload: unknown) {
  return request(`/submissions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
