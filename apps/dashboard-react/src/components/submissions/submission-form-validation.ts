// Tanpa "use client": aman dipakai di server maupun client.
// Hapus `validate` dan `FormErrors` lama dari submission-form-shared.ts,
// lalu impor dari file ini.
import type { SubmissionFormValues } from "./submission-form-shared";

/**
 * Kunci error = id elemen di form.
 * Field bersarang memakai titik, contoh: "authorBio.phone".
 */
export type FormErrors = Record<string, string | undefined>;

// Atur sesuai kebutuhan redaksi
const MIN_TITLE = 3;
const MIN_SYNOPSIS = 30;

const isPositiveInt = (s: string) => {
  const n = Number(s);
  return s.trim() !== "" && Number.isInteger(n) && n > 0;
};

const isValidUrl = (raw: string) => {
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
};

/**
 * draft = true  → hanya judul yang wajib (supaya draf setengah jadi bisa disimpan).
 * draft = false → aturan penuh untuk pengiriman naskah, termasuk file wajib.
 */
export function validate(v: SubmissionFormValues, draft = false): FormErrors {
  const e: FormErrors = {};

  // Judul
  if (!v.title.trim()) {
    e.title = draft
      ? "Isi judul dulu untuk menyimpan draf."
      : "Judul wajib diisi.";
  } else if (!draft && v.title.trim().length < MIN_TITLE) {
    e.title = `Judul minimal ${MIN_TITLE} karakter.`;
  }

  if (draft) return e;

  // Sinopsis
  const synopsis = v.description.trim();
  if (!synopsis) e.description = "Sinopsis wajib diisi.";
  else if (synopsis.length < MIN_SYNOPSIS) {
    e.description = `Sinopsis minimal ${MIN_SYNOPSIS} karakter (sekarang ${synopsis.length}).`;
  }

  // File naskah
  if (!v.fileUrl) e.fileUrl = "File naskah wajib diunggah sebelum dikirim.";

  // Detail sesuai jenis
  if (v.type === "BOOK") {
    if (!v.genre.trim()) e.genre = "Genre wajib diisi.";

    if (!v.pageCount.trim()) e.pageCount = "Jumlah halaman wajib diisi.";
    else if (!isPositiveInt(v.pageCount)) {
      e.pageCount = "Jumlah halaman harus angka bulat lebih dari 0.";
    }

    if (!v.language.trim()) e.language = "Bahasa wajib diisi.";
  } else {
    if (!v.topic.trim()) e.topic = "Topik wajib diisi.";

    if (!v.wordCount.trim()) e.wordCount = "Jumlah kata wajib diisi.";
    else if (!isPositiveInt(v.wordCount)) {
      e.wordCount = "Jumlah kata harus angka bulat lebih dari 0.";
    }
  }

  // Profil penulis: semua opsional, tapi kalau diisi harus valid
  const phone = v.authorBio.phone.trim();
  if (phone && !/^\+?[0-9\s-]{8,16}$/.test(phone)) {
    e["authorBio.phone"] = "Nomor telepon tidak valid. Contoh: 0812-3456-7890.";
  }

  const links = v.authorBio.socialLinks.split(/[\s,]+/).filter(Boolean);
  if (links.length > 0 && !links.every(isValidUrl)) {
    e["authorBio.socialLinks"] =
      "Gunakan tautan yang valid, pisahkan dengan koma.";
  }

  return e;
}
