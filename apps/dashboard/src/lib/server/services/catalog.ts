import { env } from "$env/dynamic/private";
import type { CatalogEntry } from "../../types/catalog";

export async function getPublicCatalog(fetchFn: typeof fetch, params: any) {
  const searchParams = new URLSearchParams();

  if (params.type) searchParams.set("type", params.type);
  searchParams.set("offset", String(params.offset));
  searchParams.set("limit", String(params.limit));

  const res = await fetchFn(
    `${env.API_URL}/api/submissions?${searchParams.toString()}`,
  );
  if (!res.ok) {
    throw new Error(
      `Failed to fetch public catalog: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

export async function getCatalogBySlug(fetchFn: typeof fetch, slug: string) {
  const res = await fetchFn(`${env.API_URL}/api/catalog/${slug}`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch catalog by slug: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}

export async function insertCatalogEntry(
  fetchFn: typeof fetch,
  data: CatalogEntry,
) {
  const res = await fetchFn(`${env.API_URL}/api/catalog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(
      `Failed to insert catalog entry: ${res.status} ${res.statusText}`,
    );
  }
  return res.json();
}
