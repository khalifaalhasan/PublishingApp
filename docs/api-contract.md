# API Contract v1.0 — Web Publishing Platform

## 1. Overview

API ini menggunakan pendekatan **Resource-Based API**.

Endpoint disusun berdasarkan resource yang dikelola, sedangkan hak akses ditentukan melalui:

1. **Authentication**
2. **Role-Based Access Control (RBAC)**
3. **Ownership Authorization**

API tidak menggunakan prefix berdasarkan actor seperti:

```text
/public/*
/user/*
/admin/*
```

Karena actor yang berbeda dapat berinteraksi dengan resource yang sama, tetapi memiliki permission dan scope akses yang berbeda.

---

## 2. Base Configuration

### Base URL

```text
https://api.namapenerbit.com/api/v1
```

### Authentication

Authentication menggunakan **Better Auth** dengan mekanisme:

- Session Token / Cookie
- Bearer Token

Endpoint yang membutuhkan authentication akan menggunakan current authenticated user dari session atau token.

---

## 3. Roles

Sistem memiliki role berikut:

| Role     | Description                      |
| -------- | -------------------------------- |
| `PUBLIC` | Guest atau user yang belum login |
| `USER`   | Penulis                          |
| `ADMIN`  | Editor / Administrator           |

> `PUBLIC` bukan role yang harus disimpan di database. Istilah ini digunakan untuk menandai endpoint yang dapat diakses tanpa authentication.

---

# 4. Authorization Model

## 4.1 Public Access

Endpoint public dapat diakses tanpa authentication.

Contoh:

```http
GET /catalog
GET /catalog/:slug
GET /publisher-profile
GET /upload-guides
```

Authorization layer harus melakukan bypass authentication guard untuk endpoint tersebut.

---

## 4.2 RBAC

RBAC menentukan role mana yang dapat melakukan action tertentu.

Contoh:

```text
POST /catalog
```

Hanya dapat diakses oleh:

```text
ADMIN
```

Sedangkan:

```text
POST /submissions
```

Hanya dapat diakses oleh:

```text
USER
```

---

## 4.3 Ownership Authorization

Untuk resource yang dimiliki oleh user, sistem harus melakukan validasi ownership.

Contoh:

```text
USER dapat mengakses Submission
jika:

submission.userId === currentUser.id
```

Dengan demikian, USER tidak dapat mengakses submission milik user lain hanya dengan mengganti parameter `:id`.

ADMIN memiliki akses terhadap seluruh submission sesuai permission yang dimiliki.

---

# 5. Authentication API

## 5.1 Request Magic Link

**Endpoint**

```http
POST /auth/magic-link
```

**Access:** `PUBLIC`

### Deskripsi

Meminta magic link untuk login tanpa password.

Jika email belum terdaftar, sistem dapat secara otomatis membuat akun baru dengan role default:

```text
USER
```

### Request Body

```json
{
  "email": "penulis@example.com"
}
```

### Response — `200 OK`

```json
{
  "message": "Magic link sent to email"
}
```

---

## 5.2 Get Current User

**Endpoint**

```http
GET /auth/me
```

**Access:** Authenticated User (`USER`, `ADMIN`)

### Deskripsi

Mengambil informasi user berdasarkan session atau token yang sedang aktif.

### Response — `200 OK`

```json
{
  "id": "uuid",
  "email": "penulis@example.com",
  "name": "Nama Penulis",
  "role": "USER",
  "emailVerified": true
}
```

---

# 6. Publisher Profile API

## 6.1 Get Publisher Profile

**Endpoint**

```http
GET /publisher-profile
```

**Access:** `PUBLIC`

### Deskripsi

Mengambil informasi profil penerbit.

Publisher profile bersifat **singleton**, sehingga sistem hanya memiliki satu profil penerbit utama.

### Response — `200 OK`

```json
{
  "name": "Nama Penerbit",
  "about": "Tentang penerbit...",
  "vision": "Visi penerbit...",
  "mission": "Misi penerbit...",
  "contactEmail": "info@penerbit.com"
}
```

---

# 7. Upload Guides API

## 7.1 Get Upload Guides

**Endpoint**

```http
GET /upload-guides
```

**Access:** `PUBLIC`

### Query Parameters

| Parameter | Type                       | Required | Description          |
| --------- | -------------------------- | -------- | -------------------- |
| `type`    | `BOOK \| ESSAY \| GENERAL` | No       | Filter jenis panduan |

### Contoh Request

```http
GET /upload-guides?type=BOOK
```

### Deskripsi

Mengambil daftar panduan upload yang dikelola melalui CMS-lite.

---

# 8. Catalog API

Resource catalog digunakan untuk menampilkan karya yang telah diterbitkan.

Public hanya dapat melihat katalog yang memiliki:

```text
isPublished = true
```

ADMIN memiliki permission untuk membuat dan mengelola catalog entry.

---

## 8.1 Get Published Catalog

**Endpoint**

```http
GET /catalog
```

**Access:** `PUBLIC`

### Query Parameters

| Parameter | Type            | Required | Description             |
| --------- | --------------- | -------- | ----------------------- |
| `type`    | `BOOK \| ESSAY` | No       | Filter tipe karya       |
| `page`    | `number`        | No       | Nomor halaman           |
| `limit`   | `number`        | No       | Jumlah data per halaman |

### Contoh Request

```http
GET /catalog?type=BOOK&page=1&limit=10
```

### Response — `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "slug": "judul-buku-keren",
      "title": "Judul Buku Keren",
      "type": "BOOK",
      "coverImageUrl": "https://storage.example.com/cover.jpg",
      "authorName": "Nama Penulis",
      "detail": {
        "genre": "Fiksi",
        "pageCount": 200
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

## 8.2 Get Catalog Detail

**Endpoint**

```http
GET /catalog/:slug
```

**Access:** `PUBLIC`

### Deskripsi

Mengambil detail karya berdasarkan slug.

Endpoint hanya menampilkan catalog entry dengan:

```text
isPublished = true
```

### Response — `200 OK`

```json
{
  "id": "uuid",
  "slug": "judul-buku-keren",
  "title": "Judul Buku Keren",
  "description": "Deskripsi lengkap karya...",
  "type": "BOOK",
  "coverImageUrl": "https://storage.example.com/cover.jpg",
  "authorName": "Nama Penulis",
  "detail": {
    "genre": "Fiksi",
    "pageCount": 200,
    "language": "ID"
  }
}
```

---

## 8.3 Create Catalog Entry

**Endpoint**

```http
POST /catalog
```

**Access:** `ADMIN`

### Deskripsi

Membuat `CatalogEntry` dari submission yang telah disetujui.

Submission harus memiliki status:

```text
APPROVED
```

### Request Body

```json
{
  "submissionId": "uuid-submission",
  "slug": "judul-naskah-terbaik",
  "coverImageUrl": "https://storage.example.com/cover.jpg",
  "isPublished": true
}
```

### Business Rules

- Submission harus memiliki status `APPROVED`.
- Satu submission tidak boleh memiliki lebih dari satu `CatalogEntry`.
- `slug` harus unik.

---

## 8.4 Update Catalog Entry

**Endpoint**

```http
PATCH /catalog/:id
```

**Access:** `ADMIN`

### Request Body

```json
{
  "slug": "judul-naskah-terbaik",
  "coverImageUrl": "https://storage.example.com/cover-baru.jpg",
  "isPublished": true
}
```

---

# 9. Submission API

Resource `Submission` digunakan oleh USER dan ADMIN.

Perbedaan akses ditentukan oleh RBAC dan ownership policy.

---

## 9.1 Get Submissions

**Endpoint**

```http
GET /submissions
```

**Access:** `USER`, `ADMIN`

### Authorization Behavior

#### USER

USER hanya mendapatkan submission miliknya sendiri.

```text
WHERE submission.userId = currentUser.id
```

#### ADMIN

ADMIN dapat melihat seluruh submission.

### Query Parameters

| Parameter | Type              | Required | Description   |
| --------- | ----------------- | -------- | ------------- |
| `status`  | Submission Status | No       | Filter status |
| `type`    | `BOOK \| ESSAY`   | No       | Filter tipe   |
| `page`    | `number`          | No       | Nomor halaman |
| `limit`   | `number`          | No       | Jumlah data   |

### Contoh Request

```http
GET /submissions?status=AWAITING_REVIEW&type=BOOK&page=1&limit=10
```

---

## 9.2 Get Submission Detail

**Endpoint**

```http
GET /submissions/:id
```

**Access:** `USER`, `ADMIN`

### Authorization Rules

#### USER

Hanya dapat mengakses submission jika:

```text
submission.userId === currentUser.id
```

#### ADMIN

Dapat mengakses seluruh submission.

---

## 9.3 Create Submission

**Endpoint**

```http
POST /submissions
```

**Access:** `USER`

### Deskripsi

Membuat submission atau naskah baru.

Status submission ditentukan berdasarkan nilai `isDraft`.

| `isDraft` | Initial Status    |
| --------- | ----------------- |
| `true`    | `DRAFT`           |
| `false`   | `AWAITING_REVIEW` |

---

### Request Body — Book

```json
{
  "title": "Judul Naskah",
  "description": "Sinopsis singkat",
  "type": "BOOK",
  "isDraft": false,
  "fileUrl": "https://storage.example.com/naskah.pdf",
  "fileName": "naskah-final.pdf",
  "sellingPoint": "Kenapa buku ini layak terbit",
  "coverLetter": "Surat pengantar ke editor",
  "authorBio": {
    "penName": "Nama Pena",
    "bio": "Penulis dan editor lepas",
    "phone": "08123456789",
    "socialLinks": "https://instagram.com/penulis"
  },
  "bookDetail": {
    "genre": "Sastra",
    "pageCount": 150,
    "language": "ID"
  }
}
```

---

### Request Body — Essay

```json
{
  "title": "Judul Esai",
  "description": "Deskripsi singkat esai",
  "type": "ESSAY",
  "isDraft": false,
  "fileUrl": "https://storage.example.com/essay.pdf",
  "fileName": "essay-final.pdf",
  "authorBio": {
    "bio": "Dosen dan peneliti teknologi pendidikan",
    "phone": "08123456789"
  },
  "essayDetail": {
    "topic": "Teknologi dan Pendidikan",
    "wordCount": 2500
  }
}
```

---

## 9.4 Update Draft Submission

**Endpoint**

```http
PATCH /submissions/:id
```

**Access:** `USER`

### Authorization

USER harus menjadi pemilik submission.

```text
submission.userId === currentUser.id
```

### Business Rules

Submission hanya dapat diedit apabila status:

```text
DRAFT
```

Submission yang telah masuk ke workflow editorial tidak dapat diedit langsung oleh USER.

---

## 9.5 Resubmit Submission

**Endpoint**

```http
POST /submissions/:id/resubmit
```

**Access:** `USER`

### Authorization

USER harus menjadi pemilik submission.

### Business Rules

Endpoint hanya dapat digunakan apabila status submission:

```text
ACTION_REQUIRED
```

Setelah berhasil melakukan resubmit:

```text
ACTION_REQUIRED
        ↓
   RESUBMITTED
```

Sistem akan membuat notifikasi untuk editor.

### Request Body

```json
{
  "fileUrl": "https://storage.example.com/naskah-revisi-v2.pdf",
  "fileName": "naskah-revisi-v2.pdf",
  "note": "Sudah saya perbaiki sesuai saran editor."
}
```

---

## 9.6 Update Submission Status

**Endpoint**

```http
PATCH /submissions/:id/status
```

**Access:** `ADMIN`

### Deskripsi

Endpoint digunakan oleh editor untuk mengubah status submission dalam workflow editorial.

Setiap perubahan status harus:

1. Memperbarui status submission.
2. Mencatat perubahan pada `SubmissionStatusHistory`.
3. Menyimpan catatan editorial apabila tersedia.
4. Membuat notifikasi untuk penulis.

### Request Body

```json
{
  "status": "ACTION_REQUIRED",
  "note": "Tolong perbaiki bab 3 karena alur cerita belum konsisten."
}
```

### Business Rules

Field `note` wajib diisi apabila status:

```text
ACTION_REQUIRED
```

atau:

```text
REJECTED
```

---

# 10. Submission Status Workflow

```text
DRAFT
  │
  │ Submit
  ▼
AWAITING_REVIEW
  │
  │ Editor starts review
  ▼
IN_REVIEW
  │
  ├──────────────────────► ACTION_REQUIRED
  │                              │
  │                              │ User resubmits
  │                              ▼
  │                         RESUBMITTED
  │                              │
  │                              ▼
  │                         IN_REVIEW
  │
  ├──────────────────────► APPROVED
  │
  └──────────────────────► REJECTED
```

---

## Status Definitions

| Status            | Description                              |
| ----------------- | ---------------------------------------- |
| `DRAFT`           | Naskah masih disimpan sebagai draft      |
| `AWAITING_REVIEW` | Naskah telah dikirim dan menunggu editor |
| `IN_REVIEW`       | Naskah sedang direview                   |
| `ACTION_REQUIRED` | Penulis harus melakukan revisi           |
| `RESUBMITTED`     | Penulis telah mengirim revisi            |
| `APPROVED`        | Naskah telah disetujui                   |
| `REJECTED`        | Naskah ditolak                           |

---

# 11. File Upload API

## 11.1 Upload File

**Endpoint**

```http
POST /files/upload
```

**Access:** `USER`, `ADMIN`

### Content-Type

```text
multipart/form-data
```

### Deskripsi

Endpoint digunakan untuk mengunggah file ke Object Storage.

Jenis file yang dapat diterima:

- PDF
- Microsoft Word
- Gambar
- File pendukung lainnya

File yang berhasil diupload akan menghasilkan URL yang dapat digunakan pada endpoint lainnya.

### Response — `200 OK`

```json
{
  "url": "https://storage.example.com/bucket/path/filename.pdf",
  "fileName": "filename.pdf"
}
```

---

# 12. Notifications API

## 12.1 Get My Notifications

**Endpoint**

```http
GET /notifications
```

**Access:** `USER`, `ADMIN`

### Deskripsi

Mengambil seluruh notifikasi milik authenticated user.

Backend harus melakukan filtering berdasarkan:

```text
notification.userId === currentUser.id
```

---

## 12.2 Mark Notification as Read

**Endpoint**

```http
PATCH /notifications/:id/read
```

**Access:** `USER`, `ADMIN`

### Authorization

User hanya dapat mengubah notifikasi miliknya sendiri.

### Request Body

```json
{
  "isRead": true
}
```

---

# 13. Endpoint Summary

| Method  | Endpoint                    | Access      | Description                           |
| ------- | --------------------------- | ----------- | ------------------------------------- |
| `POST`  | `/auth/magic-link`          | PUBLIC      | Request magic link                    |
| `GET`   | `/auth/me`                  | USER, ADMIN | Get current user                      |
| `GET`   | `/publisher-profile`        | PUBLIC      | Get publisher profile                 |
| `GET`   | `/upload-guides`            | PUBLIC      | Get upload guides                     |
| `GET`   | `/catalog`                  | PUBLIC      | Get published catalog                 |
| `GET`   | `/catalog/:slug`            | PUBLIC      | Get catalog detail                    |
| `POST`  | `/catalog`                  | ADMIN       | Create catalog entry                  |
| `PATCH` | `/catalog/:id`              | ADMIN       | Update catalog entry                  |
| `GET`   | `/submissions`              | USER, ADMIN | Get submissions based on access scope |
| `GET`   | `/submissions/:id`          | USER, ADMIN | Get submission detail                 |
| `POST`  | `/submissions`              | USER        | Create submission                     |
| `PATCH` | `/submissions/:id`          | USER        | Update own draft                      |
| `POST`  | `/submissions/:id/resubmit` | USER        | Resubmit revised submission           |
| `PATCH` | `/submissions/:id/status`   | ADMIN       | Update submission status              |
| `POST`  | `/files/upload`             | USER, ADMIN | Upload file                           |
| `GET`   | `/notifications`            | USER, ADMIN | Get own notifications                 |
| `PATCH` | `/notifications/:id/read`   | USER, ADMIN | Mark notification as read             |

---

# 14. RBAC & Ownership Matrix

| Resource / Action         | PUBLIC |   USER   |  ADMIN   |
| ------------------------- | :----: | :------: | :------: |
| View Publisher Profile    |   ✅   |    ✅    |    ✅    |
| View Upload Guides        |   ✅   |    ✅    |    ✅    |
| View Published Catalog    |   ✅   |    ✅    |    ✅    |
| Create Catalog Entry      |   ❌   |    ❌    |    ✅    |
| Update Catalog Entry      |   ❌   |    ❌    |    ✅    |
| View Own Submissions      |   ❌   |    ✅    |    ❌    |
| View All Submissions      |   ❌   |    ❌    |    ✅    |
| View Submission Detail    |   ❌   | Own Only |   All    |
| Create Submission         |   ❌   |    ✅    |    ❌    |
| Update Draft              |   ❌   | Own Only |    ❌    |
| Resubmit Submission       |   ❌   | Own Only |    ❌    |
| Update Submission Status  |   ❌   |    ❌    |    ✅    |
| Upload File               |   ❌   |    ✅    |    ✅    |
| View Notifications        |   ❌   | Own Only | Own Only |
| Mark Notification as Read |   ❌   | Own Only | Own Only |

---

# 15. Core Authorization Principles

## Resource-Based Routing

URL API merepresentasikan resource:

```text
/submissions
/catalog
/notifications
```

Bukan actor:

```text
/user/submissions
/admin/submissions
/public/catalog
```

---

## RBAC Determines Permission

RBAC menentukan apakah role tertentu diperbolehkan melakukan sebuah action.

Contoh:

```text
PATCH /submissions/:id/status

USER  → Forbidden
ADMIN → Allowed
```

---

## Ownership Determines Resource Scope

Untuk USER, permission saja tidak cukup.

Sistem juga harus memastikan resource tersebut milik user yang sedang login.

```text
Authenticated User
        │
        ▼
Authorization Check
        │
        ▼
Ownership Check
        │
        ├── Owner → Allow
        │
        └── Not Owner → Deny
```

---

## Admin Has Elevated Scope

ADMIN menggunakan resource yang sama:

```http
GET /submissions
```

Namun memiliki scope akses berbeda.

```text
USER
  ↓
Own submissions only

ADMIN
  ↓
All submissions
```

Dengan pendekatan ini, API tetap:

- Konsisten
- Resource-oriented
- RESTful
- Mudah dikembangkan
- Tidak menduplikasi endpoint berdasarkan role
- Memisahkan dengan jelas antara routing, RBAC, dan ownership authorization

---

**API Contract Version:** `v1.0`

**Architecture:** `Resource-Based API + RBAC + Ownership Authorization`
