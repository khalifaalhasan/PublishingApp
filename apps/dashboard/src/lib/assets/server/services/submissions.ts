import { env } from "$env/dynamic/private";
import type {
  SubmissionBodySchema,
  GetSubmissionParams,
} from "../../../types/submissions";

// Create
export async function createSubmission(
  fetchFn: typeof fetch,
  data: SubmissionBodySchema,
) {
  const res = await fetchFn(`${env.API_URL}/api/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to create submission: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

// update
export async function updateSubmission(
  fetchFn: typeof fetch,
  data: SubmissionBodySchema,
  id: string,
) {
  const res = await fetchFn(`${env.API_URL}/api/submissions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to update submissions: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

// resubmit
export async function resubmitSubmission(
  fetchFn: typeof fetch,
  data: SubmissionBodySchema,
  id: string,
) {
  const res = await fetchFn(`${env.API_URL}/api/submissions/${id}/resubmit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to resubmit submissions: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

// update status (admin)
export async function updateSubmissionStatus(
  fetchFn: typeof fetch,
  id: string,
  status: string,
) {
  const res = await fetchFn(`${env.API_URL}/api/submissions/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to update submission status: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

// delete
export async function deleteSubmission(fetchFn: typeof fetch, id: string) {
  const res = await fetchFn(`${env.API_URL}/api/submissions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(
      `Failed to delete submissions: ${res.status} ${res.statusText}`,
    );
  }
}

// getall
export async function getSubmissions(
  fetchFn: typeof fetch,
  params: GetSubmissionParams,
) {
  const searchParams = new URLSearchParams();

  if (params.userId) searchParams.set("userId", params.userId);
  if (params.status) searchParams.set("status", params.status);
  if (params.type) searchParams.set("type", params.type);
  searchParams.set("offset", String(params.offset));
  searchParams.set("limit", String(params.limit));

  const res = await fetchFn(
    `${env.API_URL}/api/submissions?${searchParams.toString()}`,
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch submissions: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

// getbyid
export async function getSubmissionDetail(fetchFn: typeof fetch, id: string) {
  const res = await fetchFn(`${env.API_URL}/api/submissions/${id}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch submission detail: ${res.status} ${res.statusText}`,
    );
  }
}
