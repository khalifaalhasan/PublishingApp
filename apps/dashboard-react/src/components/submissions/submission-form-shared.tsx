// Sengaja TANPA "use client": dipakai oleh Server Component (halaman edit)
// maupun Client Component (form). Nilai/konstanta yang diekspor dari file
// "use client" tidak bisa dipakai di server.

export type SubmissionType = "BOOK" | "ESSAY";

// Kita buat interface terpisah untuk authorBio agar lebih rapi
export interface AuthorBioFormValues {
  penName: string;
  bio: string;
  phone: string;
  socialLinks: string;
}

export interface SubmissionFormValues {
  type: SubmissionType;
  title: string;
  description: string;
  sellingPoint: string;
  coverLetter: string;

  // Penambahan field baru dari cURL
  fileUrl: string;
  fileName: string;
  authorBio: AuthorBioFormValues;

  // buku
  genre: string;
  pageCount: string;
  language: string;
  isbn: string;
  // esai
  topic: string;
  wordCount: string;
}

// Mengubah menjadi Record<string, string> untuk mendukung error nested,
// misalnya: e["authorBio.penName"] = "Nama pena harus diisi"
export type FormErrors = Record<string, string>;

export const EMPTY_VALUES: SubmissionFormValues = {
  type: "BOOK",
  title: "",
  description: "",
  sellingPoint: "",
  coverLetter: "",
  fileUrl: "",
  fileName: "",
  authorBio: {
    penName: "",
    bio: "",
    phone: "",
    socialLinks: "",
  },
  genre: "",
  pageCount: "",
  language: "Indonesia",
  isbn: "",
  topic: "",
  wordCount: "",
};

// Setelah DRAFT dihapus dari enum, naskah hanya bisa direvisi saat diminta redaksi.
export const EDITABLE_STATUSES = ["ACTION_REQUIRED"];

/** Bentuk minimal data submission yang dibaca halaman edit. */
export interface SubmissionLike {
  id: string;
  type: SubmissionType;
  status: string;
  title: string;
  description?: string | null;
  sellingPoint?: string | null;
  coverLetter?: string | null;

  // Penyesuaian dengan API
  fileUrl?: string | null;
  fileName?: string | null;
  authorBio?: {
    penName?: string | null;
    bio?: string | null;
    phone?: string | null;
    socialLinks?: string | null;
  } | null;

  updatedAt: string;
  bookDetail?: {
    genre?: string | null;
    pageCount?: number | null;
    language?: string | null;
    isbn?: string | null;
  } | null;
  essayDetail?: {
    topic?: string | null;
    wordCount?: number | null;
  } | null;
}

const str = (v: string | null | undefined) => v ?? "";
const num = (v: number | null | undefined) => (v == null ? "" : String(v));

export function toFormValues(s: SubmissionLike): SubmissionFormValues {
  return {
    type: s.type,
    title: s.title,
    description: str(s.description),
    sellingPoint: str(s.sellingPoint),
    coverLetter: str(s.coverLetter),

    // Penyesuaian ke form values
    fileUrl: str(s.fileUrl),
    fileName: str(s.fileName),
    authorBio: {
      penName: str(s.authorBio?.penName),
      bio: str(s.authorBio?.bio),
      phone: str(s.authorBio?.phone),
      socialLinks: str(s.authorBio?.socialLinks),
    },

    genre: str(s.bookDetail?.genre),
    pageCount: num(s.bookDetail?.pageCount),
    language: str(s.bookDetail?.language) || "Indonesia",
    isbn: str(s.bookDetail?.isbn),
    topic: str(s.essayDetail?.topic),
    wordCount: num(s.essayDetail?.wordCount),
  };
}

const opt = (v: string) => v.trim() || undefined;
const toInt = (v: string) => Number.parseInt(v, 10);
const isPositiveInt = (v: string) => {
  const n = Number(v);
  return v.trim() !== "" && Number.isInteger(n) && n > 0;
};

/**
 * ASUMSI bentuk payload: field umum di level atas, detail di `bookDetail`
 * atau `essayDetail`. Ini satu-satunya tempat yang perlu disesuaikan kalau
 * API kamu memakai struktur lain.
 *
 * NOTE: Saya tambahkan parameter `isDraft` dengan nilai default false.
 */
export function toPayload(v: SubmissionFormValues, isDraft: boolean = false) {
  const base = {
    title: v.title.trim(),
    description: v.description.trim(),
    type: v.type,
    isDraft, // Ditambahkan dari argument fungsi
    fileUrl: v.fileUrl.trim(),
    fileName: v.fileName.trim(),
    sellingPoint: opt(v.sellingPoint) || "",
    coverLetter: opt(v.coverLetter) || "",

    // Dibuat menjadi object sesuai format di cURL
    authorBio: {
      penName: v.authorBio.penName.trim(),
      bio: v.authorBio.bio.trim(),
      phone: v.authorBio.phone.trim(),
      socialLinks: v.authorBio.socialLinks.trim(),
    },
  };

  return v.type === "BOOK"
    ? {
        ...base,
        bookDetail: {
          genre: v.genre.trim(),
          pageCount: toInt(v.pageCount) || 1, // Fallback angka agar API tidak error
          language: v.language.trim() || "Indonesia",
          isbn: opt(v.isbn),
        },
      }
    : {
        ...base,
        essayDetail: {
          topic: v.topic.trim(),
          wordCount: toInt(v.wordCount) || 1,
        },
      };
}

export function validate(v: SubmissionFormValues): FormErrors {
  const e: FormErrors = {};

  if (v.title.trim().length < 3) e.title = "Judul minimal 3 karakter.";
  if (v.description.trim().length < 10) {
    e.description = "Sinopsis minimal 10 karakter.";
  }

  // Opsional: kamu bisa tambah validasi untuk file atau authorBio di sini
  // misal: if (!v.authorBio.phone) e["authorBio.phone"] = "Nomor telepon wajib diisi";

  if (v.type === "BOOK") {
    if (!v.genre.trim()) e.genre = "Isi genre buku.";
    if (!isPositiveInt(v.pageCount)) {
      e.pageCount = "Isi jumlah halaman dengan angka bulat lebih dari 0.";
    }
  } else {
    if (!v.topic.trim()) e.topic = "Isi topik esai.";
    if (!isPositiveInt(v.wordCount)) {
      e.wordCount = "Isi jumlah kata dengan angka bulat lebih dari 0.";
    }
  }

  return e;
}
