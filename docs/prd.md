# Product Requirements Document (PRD)
## Web Publishing Platform — [Nama Penerbit]

**Versi:** 1.0 (Draft)
**Tanggal:** 8 September 2026
**Status:** Draft untuk review

---

## 1. Latar Belakang & Problem Statement

Penerbit membutuhkan sebuah platform digital yang menjadi satu pintu untuk tiga kebutuhan sekaligus:

1. **Etalase publik** — katalog buku, katalog esai, dan profil penerbit yang bisa diakses siapa saja.
2. **Kanal submission** — tempat penulis (user) mengajukan naskah buku atau esai secara online, tanpa proses manual via email/WA yang sulit dilacak.
3. **Alat kontrol editorial** — dashboard bagi admin/editor untuk memantau dan memproses naskah yang masuk, dengan jejak audit yang jelas per status.

Saat ini (asumsi) proses submission naskah masih manual, sehingga sulit dilacak statusnya baik oleh penulis maupun editor. Platform ini menggantikan proses tersebut dengan sistem status yang terstruktur dan dapat diaudit.

---

## 2. Tujuan (Goals)

| # | Tujuan | Ukuran Keberhasilan |
|---|--------|---------------------|
| G1 | Menyediakan katalog buku & esai yang bisa diakses publik | Halaman katalog live, dapat difilter/dicari |
| G2 | Mempermudah penulis mengajukan naskah secara mandiri | User bisa submit tanpa bantuan admin |
| G3 | Memberi visibilitas status naskah end-to-end | User & admin melihat status yang sama secara real-time |
| G4 | Mempercepat proses review editorial | Admin punya satu dashboard untuk semua aktivitas submission |
| G5 | Autentikasi yang aman & rendah friksi | Login passwordless via email (magic link/OTP) |

### Non-Goals (di luar cakupan v1)
- Pembayaran/monetisasi (jual-beli buku, royalti penulis) — kemungkinan fase 2.
- Kolaborasi multi-penulis dalam satu naskah — v1 asumsi 1 naskah = 1 pengaju.
- Version control naskah tingkat paragraf (seperti Google Docs) — v1 hanya attachment file per submit/resubmit.
- Aplikasi mobile native — v1 web responsive saja.

---

## 3. Peran Pengguna (User Roles)

| Role | Deskripsi | Akses Utama |
|------|-----------|--------------|
| **Public (guest)** | Pengunjung tanpa akun | Lihat katalog buku, katalog esai, profil penerbit, panduan upload |
| **User (Penulis)** | Akun terdaftar, mengajukan naskah | Dashboard user: submit, tracking status, resubmit revisi, riwayat |
| **Admin (Editor)** | Pengelola editorial | Dashboard admin: review naskah, ubah status, lihat aktivitas user, kelola katalog & profil penerbit |

**Asumsi tambahan:**
- Satu akun hanya punya satu role (admin ATAU user), tidak dual-role. Kalau perlu superadmin vs editor, bisa jadi sub-role di fase 2.
- Registrasi user baru default role `user`. Role `admin` hanya bisa dibuat/diubah oleh admin lain (tidak ada self-registration admin).

---

## 4. Proses Bisnis Utama: Alur Submission Naskah

### 4.1 Diagram Status (State Machine)

```
[DRAFT] ---submit---> [AWAITING_REVIEW] ---admin ambil---> [IN_REVIEW]
                                                                |
                                        -----------------------+-----------------------
                                        |                       |                      |
                                     approve                 minta revisi           tolak langsung
                                        |                       |                      |
                                        v                       v                      v
                                  [APPROVED]           [ACTION_REQUIRED]          [REJECTED]
                                                                |
                                                          user resubmit
                                                                |
                                                                v
                                                        [RESUBMITTED] ---admin review lagi---> [IN_REVIEW]
                                                                                                (loop, atau REJECTED)
```

### 4.2 Definisi Status

| Status | Arti | Aktor yang trigger |
|--------|------|---------------------|
| `DRAFT` | Naskah masih disimpan user, belum diajukan | User |
| `AWAITING_REVIEW` | Sudah disubmit, menunggu diambil admin | User (submit) |
| `IN_REVIEW` | Sedang dinilai admin | Admin (mulai review) |
| `ACTION_REQUIRED` | Admin minta revisi, bola di tangan user | Admin |
| `RESUBMITTED` | User sudah upload ulang versi revisi | User |
| `APPROVED` | Naskah diterima, masuk pipeline penerbitan | Admin |
| `REJECTED` | Naskah ditolak (bisa dari `IN_REVIEW` atau `RESUBMITTED` langsung, tidak wajib lewat `ACTION_REQUIRED`) | Admin |

**Aturan bisnis:**
- Dari `IN_REVIEW`, admin punya 3 opsi: **approve**, **minta revisi** (→ `ACTION_REQUIRED`), atau **tolak** (→ `REJECTED`).
- `RESUBMITTED` otomatis/manual masuk lagi ke `IN_REVIEW` untuk dinilai admin (asumsi: butuh admin action "mulai review ulang", supaya tetap tercatat siapa reviewer & kapan).
- Tidak ada batas jumlah siklus revisi (`ACTION_REQUIRED` ↔ `RESUBMITTED`) di v1 — bisa ditambah limit di fase 2 kalau dibutuhkan.
- Setiap naskah punya riwayat status (audit log) — siapa mengubah, kapan, dan catatan/feedback (khusus untuk `ACTION_REQUIRED` dan `REJECTED`, feedback wajib diisi admin).
- Setiap perubahan status **wajib** memicu notifikasi ke user pemilik naskah (lihat §4.3).

### 4.3 Notifikasi

| Trigger | Penerima | Channel (asumsi v1) |
|---------|----------|----------------------|
| Naskah masuk `AWAITING_REVIEW` | Admin (semua/relevan) | In-app + email |
| Status berubah (`IN_REVIEW`, `ACTION_REQUIRED`, `APPROVED`, `REJECTED`) | User pemilik naskah | In-app + email |
| User `RESUBMITTED` | Admin yang sebelumnya menangani | In-app + email |

Asumsi: notifikasi in-app disimpan di tabel `notifications`, ditandai read/unread, dan email dikirim async (queue) supaya tidak blocking request.

### 4.4 Objek yang Diajukan

Karena ada dua jenis konten (buku & esai), naskah punya `type`: `BOOK` atau `ESSAY`. Field spesifik bisa berbeda tipis (buku: jumlah halaman, kategori genre; esai: topik). Struktur status & alur sama untuk keduanya — direpresentasikan sebagai satu entitas `submission` dengan `type` sebagai pembeda, bukan dua entitas terpisah. (Ini keputusan desain, akan dikonfirmasi lagi di tahap ERD.)

---

## 5. Modul & Fitur

### 5.1 Autentikasi
- Register & Login **passwordless**, hanya via email (magic link atau OTP — direkomendasikan **magic link** karena lebih simpel untuk implementasi Better Auth dan UX-nya lebih rendah friksi daripada OTP manual).
- Session management via Better Auth.
- Role ditentukan saat akun dibuat (`admin` / `user`); tidak ada pilihan role saat register publik (register publik = otomatis `user`).
- Email verification implisit karena passwordless = link/kode yang dikirim ke email itu sendiri sudah jadi bukti kepemilikan email.

### 5.2 Public Front
- **Landing page**
- **Katalog Buku** — list + detail, filter (kategori/genre), search
- **Katalog Esai** — list + detail, filter (topik), search
- **Profil Penerbit** — about, visi-misi, kontak, tim (opsional)
- **Panduan Upload Esai & Buku** — halaman statis/CMS-lite berisi syarat & format naskah
- **CTA Login/Register** untuk mulai submit naskah

### 5.3 Dashboard User
- Ringkasan status semua naskah yang pernah diajukan
- Form pengajuan naskah baru (judul, tipe [buku/esai], deskripsi, file upload, metadata sesuai tipe)
- Simpan sebagai draft / submit langsung
- Detail per naskah: histori status, feedback admin, tombol resubmit saat status `ACTION_REQUIRED`
- Notifikasi (in-app)
- Edit profil dasar (nama, email)

### 5.4 Dashboard Admin
- **Aktivitas user** — log semua aktivitas submission (siapa submit apa, kapan, status apa) — sesuai requirement eksplisit user
- Daftar naskah masuk dengan filter status/tipe/tanggal
- Detail naskah + aksi: mulai review, approve, minta revisi (+catatan), tolak (+alasan)
- Kelola katalog (publish/unpublish buku & esai yang sudah `APPROVED` ke katalog publik)
- Kelola profil penerbit & halaman panduan upload
- Kelola user (lihat daftar, nonaktifkan akun — opsional v1)
- Notifikasi (in-app)

**Catatan desain:** "Approved" di alur submission ≠ otomatis tampil di katalog publik. Diasumsikan ada langkah terpisah "publish ke katalog" oleh admin, supaya admin punya kontrol kapan buku/esai itu benar-benar tayang ke publik (misal nunggu cover/layout selesai). Ini asumsi yang perlu dikonfirmasi.

---

## 6. Functional Requirements (ringkas)

- FR1: Sistem harus mendukung login/register tanpa password, hanya email.
- FR2: Sistem harus membatasi akses dashboard admin hanya untuk role `admin`.
- FR3: User harus bisa membuat, menyimpan draft, dan submit naskah (buku/esai).
- FR4: Sistem harus mencatat setiap perubahan status naskah beserta aktor & waktunya (audit trail).
- FR5: Sistem harus mengirim notifikasi in-app & email pada setiap perubahan status.
- FR6: Admin harus bisa mengubah status naskah sesuai state machine di §4.
- FR7: Publik harus bisa melihat katalog buku & esai tanpa login.
- FR8: Naskah yang tampil di katalog publik hanya yang berstatus `APPROVED` dan sudah di-publish admin.
- FR9: User hanya bisa melihat & mengelola naskah miliknya sendiri.

## 7. Non-Functional Requirements

- **Security**: proteksi role-based access control (RBAC) di level API, bukan cuma UI. Rate limiting pada endpoint auth (kirim magic link) untuk cegah abuse.
- **Performance**: katalog publik harus di-cache/SSG/ISR karena traffic-nya publik & jarang berubah.
- **Auditability**: seluruh perubahan status naskah harus tercatat permanen (tidak overwrite, insert log baru).
- **Scalability**: struktur mendukung penambahan tipe konten baru di masa depan (misal jurnal) tanpa redesain besar.
- **Observability**: mengingat fokus kamu ke SRE/observability — struktur logging & tracing di request penting untuk backend (relevan buat portofolio juga).

## 8. Rekomendasi Tech Stack

Menyesuaikan stack yang sudah kamu pakai di project lain (portal-informasi-si, mini-commerce):

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js (App Router) — public front (SSG/ISR) + dashboard (CSR/SSR)
- **Backend**: NestJS — REST API, modular per domain (auth, submissions, catalog, notifications)
- **Auth**: Better Auth (passwordless email/magic link), diintegrasikan sebagai module di NestJS atau adapter Next.js tergantung arsitektur auth-mu (perlu diputuskan: auth server terpisah atau nempel di salah satu app)
- **Database**: PostgreSQL + Prisma
- **File storage**: naskah upload (PDF/DOCX) — S3-compatible object storage (bukan disimpan di DB)
- **Notifikasi**: queue (misal BullMQ + Redis) untuk email async
- **Infra**: Docker + Portainer, sesuai infra existing kamu di Jatiluhur/Palembang

---

## 9. Entitas Utama (preview — detail di tahap ERD)

- `User` (id, email, role, name, ...)
- `Submission` (id, userId, type[BOOK/ESSAY], title, status, currentFileId, ...)
- `SubmissionStatusHistory` (id, submissionId, fromStatus, toStatus, actorId, note, createdAt)
- `SubmissionFile` (id, submissionId, url, version, uploadedAt)
- `CatalogEntry` (id, submissionId, isPublished, publishedAt, ...) — jembatan submission approved → tampil publik
- `PublisherProfile` (singleton/konten CMS-lite)
- `UploadGuide` (konten CMS-lite untuk panduan)
- `Notification` (id, userId, type, message, isRead, createdAt)

---

## 10. Open Questions (perlu konfirmasi kamu)

1. Magic link atau OTP untuk passwordless login?
2. Apakah "approved" langsung publish ke katalog, atau ada langkah publish terpisah oleh admin? (PRD ini asumsi: **terpisah**)
3. Apakah admin bisa reject dari status `AWAITING_REVIEW` langsung (belum sempat `IN_REVIEW`), atau reject wajib lewat `IN_REVIEW` dulu?
4. Ada batas ukuran/format file upload naskah (PDF only? Word juga?)
5. Perlu multi-admin dengan pembagian tugas (misal per kategori), atau semua admin punya akses sama rata di v1?
6. Auth service: nempel di NestJS sebagai module, atau app terpisah?

---

*Dokumen ini adalah draft awal. Setelah direview, lanjut ke tahap ERD (schema database) dan API contract.*