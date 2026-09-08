/**
 * Schema: Notification Module
 *
 * Tables:
 *  - notification : Notifikasi in-app untuk user dan admin.
 *                   Dibuat otomatis setiap kali terjadi perubahan status submission.
 *                   Email dikirim secara async via queue (BullMQ/Redis) — bukan di tabel ini.
 *
 * Trigger notifikasi (sesuai PRD §4.3):
 *  - Naskah masuk AWAITING_REVIEW  -> notif ke semua admin
 *  - Status berubah ke IN_REVIEW, ACTION_REQUIRED, APPROVED, REJECTED -> notif ke user pemilik naskah
 *  - User RESUBMITTED              -> notif ke admin yang sebelumnya menangani
 *
 * @see docs/prd.md §4.3 — Notifikasi
 * @see docs/schema.md §1.10 — Notification
 */

import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { submission } from "./submissions";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum("notification_type", [
  "STATUS_CHANGE",
  "NEW_SUBMISSION",
  "RESUBMISSION",
]);

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * notification — Notifikasi in-app per user.
 * Dibuat oleh sistem (bukan user) sebagai side effect dari setiap transisi status submission.
 * `isRead` di-toggle oleh user saat membaca notifikasi.
 * `relatedSubmissionId` opsional — memudahkan navigasi langsung ke naskah terkait.
 */
export const notification = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedSubmissionId: uuid("related_submission_id").references(
    () => submission.id,
    { onDelete: "set null" },
  ),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type Notification = typeof notification.$inferSelect;
export type NewNotification = typeof notification.$inferInsert;
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];
