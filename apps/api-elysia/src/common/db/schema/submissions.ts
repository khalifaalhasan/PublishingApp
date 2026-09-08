/**
 * Schema: Submission Module
 *
 * Tables:
 *  - submission                  : Naskah yang diajukan penulis (buku atau esai)
 *  - book_detail                 : Detail spesifik naskah bertipe BOOK (genre, pageCount, isbn, dst)
 *  - essay_detail                : Detail spesifik naskah bertipe ESSAY (topic, wordCount)
 *  - submission_file             : File naskah yang di-upload per versi (disimpan di object storage)
 *  - submission_status_history   : Audit trail setiap perubahan status naskah (immutable — INSERT only)
 *
 * Alur status submission (state machine):
 *   DRAFT -> AWAITING_REVIEW -> IN_REVIEW
 *                                 |-- approve        -> APPROVED
 *                                 |-- minta revisi   -> ACTION_REQUIRED -> user resubmit -> RESUBMITTED -> IN_REVIEW
 *                                 `-- tolak          -> REJECTED
 *
 * @see docs/prd.md §4 — Proses Bisnis Utama: Alur Submission Naskah
 * @see docs/schema.md §1.2–1.6
 */

import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const submissionTypeEnum = pgEnum("submission_type", ["BOOK", "ESSAY"]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "DRAFT",
  "AWAITING_REVIEW",
  "IN_REVIEW",
  "ACTION_REQUIRED",
  "RESUBMITTED",
  "APPROVED",
  "REJECTED",
]);

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * submission — Naskah yang diajukan penulis.
 * Entitas generik untuk buku & esai; detail spesifik tipe ada di book_detail / essay_detail.
 * `currentReviewerId` disimpan di sini (bukan hanya di history) agar query
 * "naskah yang sedang di-review oleh Admin X" tidak perlu subquery ke history.
 */
export const submission = pgTable("submission", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  type: submissionTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: submissionStatusEnum("status").notNull().default("DRAFT"),
  currentReviewerId: text("current_reviewer_id").references(() => user.id, {
    onDelete: "set null",
  }),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * book_detail — Detail spesifik untuk naskah bertipe BOOK.
 * Relasi 1-to-1 dengan submission; hanya ada jika submission.type = 'BOOK'.
 */
export const bookDetail = pgTable("book_detail", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .unique()
    .references(() => submission.id, { onDelete: "cascade" }),
  genre: text("genre").notNull(),
  pageCount: integer("page_count").notNull(),
  language: text("language"),
  isbn: text("isbn"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * essay_detail — Detail spesifik untuk naskah bertipe ESSAY.
 * Relasi 1-to-1 dengan submission; hanya ada jika submission.type = 'ESSAY'.
 */
export const essayDetail = pgTable("essay_detail", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .unique()
    .references(() => submission.id, { onDelete: "cascade" }),
  topic: text("topic").notNull(),
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * submission_file — File naskah yang di-upload per submit/resubmit.
 * URL mengarah ke object storage (S3-compatible), bukan blob di DB.
 * `version` naik setiap kali penulis melakukan resubmit.
 */
export const submissionFile = pgTable("submission_file", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submission.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  version: integer("version").notNull(),
  uploadedById: text("uploaded_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

/**
 * submission_status_history — Audit trail setiap perubahan status naskah.
 * IMMUTABLE: hanya boleh INSERT, tidak boleh UPDATE/DELETE.
 * `note` wajib diisi oleh aplikasi saat toStatus = 'ACTION_REQUIRED' atau 'REJECTED'.
 * @see docs/prd.md §4.2 — aturan bisnis audit trail
 */
export const submissionStatusHistory = pgTable("submission_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submission.id, { onDelete: "cascade" }),
  fromStatus: submissionStatusEnum("from_status"),
  toStatus: submissionStatusEnum("to_status").notNull(),
  actorId: text("actor_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type Submission = typeof submission.$inferSelect;
export type NewSubmission = typeof submission.$inferInsert;
export type SubmissionType = (typeof submissionTypeEnum.enumValues)[number];
export type SubmissionStatus = (typeof submissionStatusEnum.enumValues)[number];

export type BookDetail = typeof bookDetail.$inferSelect;
export type NewBookDetail = typeof bookDetail.$inferInsert;

export type EssayDetail = typeof essayDetail.$inferSelect;
export type NewEssayDetail = typeof essayDetail.$inferInsert;

export type SubmissionFile = typeof submissionFile.$inferSelect;
export type NewSubmissionFile = typeof submissionFile.$inferInsert;

export type SubmissionStatusHistory =
  typeof submissionStatusHistory.$inferSelect;
export type NewSubmissionStatusHistory =
  typeof submissionStatusHistory.$inferInsert;
