/**
 * Database Schema — Web Publishing Platform
 *
 * Schema dipisah per modul/fitur. Urutan import penting untuk foreign key dependency:
 *
 *  1. auth.ts          — user, session, account, verification (Better Auth)
 *  2. submissions.ts   — submission, book_detail, essay_detail, submission_file, submission_status_history
 *  3. catalog.ts       — catalog_entry
 *  4. content.ts       — publisher_profile, upload_guide
 *  5. notifications.ts — notification
 *
 * @see docs/prd.md     — PRD & product requirements (BACA INI DULU)
 * @see docs/schema.md  — ERD lengkap & keputusan desain schema
 */

export * from "./auth";
export * from "./submissions";
export * from "./catalog";
export * from "./content";
export * from "./notifications";
// Reference implementation — boleh dihapus setelah module posts digantikan module submission
export * from "./posts";
