# AGENTS.md — Web Publishing Platform

> **WAJIB DIBACA PERTAMA.** File ini adalah pintu masuk utama untuk memahami konteks proyek.
> Sebelum melakukan tindakan apapun (menulis kode, menambah fitur, merancang API, membuat schema),
> PAHAMI dulu dokumen-dokumen di bawah ini secara menyeluruh.

---

## 📌 Dokumen Referensi Utama

| Dokumen | Path | Isi |
|---------|------|-----|
| **PRD** *(Patokan utama)* | [`docs/prd.md`](../docs/prd.md) | Product Requirements Document — tujuan bisnis, alur submission, fitur, tech stack, entitas utama |
| **Schema DB** | [`docs/schema.md`](../docs/schema.md) | ERD lengkap, semua tabel & relasi, keputusan desain schema |

> [!IMPORTANT]
> **PRD adalah sumber kebenaran utama.** Setiap keputusan teknis harus dapat ditelusuri kembali ke PRD.
> Jika ada konflik antara kode dan PRD, PRD yang benar — bukan kodenya.

---

## 🏗️ Ringkasan Arsitektur

```
PublishingApp/              <- Monorepo (Turborepo + pnpm)
├── apps/
│   ├── api-elysia/         <- Backend REST API (Elysia.js + Drizzle ORM + PostgreSQL)
│   └── front-sveltekit/    <- Frontend (SvelteKit — public front + dashboard)
├── packages/               <- Shared packages (kosong di v1, siap diisi)
└── docs/
    ├── prd.md              <- ⭐ PRD (BACA INI DULU)
    └── schema.md           <- ERD & schema lengkap
```

---

## 🎯 Tujuan Produk (ringkasan dari PRD)

Platform digital penerbit dengan **tiga fungsi utama:**
1. **Etalase publik** — katalog buku & esai, profil penerbit (tanpa login)
2. **Kanal submission naskah** — penulis submit buku/esai secara mandiri (dengan login)
3. **Dashboard editorial** — admin/editor mengelola naskah & katalog

**Tiga role pengguna:** `public (guest)` · `user (penulis)` · `admin (editor)`

---

## 🔄 State Machine Submission (WAJIB DIPAHAMI)

```
[DRAFT] -> [AWAITING_REVIEW] -> [IN_REVIEW]
                                    |-- approve  -> [APPROVED]
                                    |-- revisi   -> [ACTION_REQUIRED] -> user resubmit -> [RESUBMITTED] -> [IN_REVIEW]
                                    `-- tolak    -> [REJECTED]
```

**Aturan kritis:**
- Feedback **wajib** diisi admin saat `ACTION_REQUIRED` atau `REJECTED`
- Setiap perubahan status **wajib** tercatat di `submission_status_history` (audit trail — tidak boleh di-overwrite)
- Setiap perubahan status **wajib** memicu notifikasi (in-app + email async)
- `APPROVED` != otomatis tampil di katalog publik — ada langkah publish terpisah oleh admin

---

## 🗂️ Modul & Schema Database

Schema database dipisah per modul di `apps/api-elysia/src/common/db/schema/`:

| File | Modul | Tabel |
|------|-------|-------|
| `auth.ts` | Auth (Better Auth) | `user`, `session`, `account`, `verification` |
| `submissions.ts` | Submission | `submission`, `book_detail`, `essay_detail`, `submission_file`, `submission_status_history` |
| `catalog.ts` | Catalog | `catalog_entry` |
| `content.ts` | Content/CMS | `publisher_profile`, `upload_guide` |
| `notifications.ts` | Notification | `notification` |

---

## ⚙️ Tech Stack Aktual

| Layer | Teknologi |
|-------|-----------|
| Monorepo | Turborepo + pnpm |
| Backend | Elysia.js (bukan NestJS — disesuaikan dari PRD) |
| Frontend | SvelteKit (bukan Next.js — disesuaikan dari PRD) |
| Auth | Better Auth (passwordless magic link) |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| File Storage | S3-compatible object storage |
| Notifikasi | Queue async (email) + in-app (tabel `notification`) |
| Infra | Docker + docker-compose |

> [!NOTE]
> PRD menyebutkan NestJS + Next.js sebagai rekomendasi, namun implementasi aktual menggunakan
> Elysia.js + SvelteKit. Prinsip bisnis & alur dari PRD tetap berlaku sepenuhnya.

---

## 🚦 Aturan Pengembangan

1. **Baca PRD & schema.md sebelum mulai** — jangan asumsi tanpa dasar dokumen.
2. **Audit trail tidak boleh di-overwrite** — selalu INSERT baru di `submission_status_history`.
3. **RBAC di level API** — jangan hanya lindungi di UI; validasi role di setiap endpoint.
4. **Notifikasi adalah side effect wajib** — setiap transisi status harus trigger notifikasi.
5. **Schema per modul** — jangan campur semua tabel dalam satu file schema.
6. **Catalog entry terpisah dari submission** — `approved` != `published`.
7. **Better Auth tables jangan dimodifikasi** — hanya extend `user` dengan kolom custom (`role`).

---

## 📖 Cara Membaca Dokumen Ini

```
Mulai di sini (AGENTS.md)
    |
    v
Pahami PRD -> docs/prd.md
    |
    v
Pahami Schema -> docs/schema.md
    |
    v
Lihat implementasi schema -> apps/api-elysia/src/common/db/schema/
    |
    v
Baru tulis kode
```
