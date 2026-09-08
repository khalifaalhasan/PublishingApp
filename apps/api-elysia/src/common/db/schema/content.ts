/**
 * Schema: Content / CMS Module
 *
 * Tables:
 *  - publisher_profile : Profil penerbit (singleton — selalu hanya 1 row).
 *                        Berisi nama, deskripsi, visi-misi, kontak, logo.
 *  - upload_guide      : Panduan upload naskah (CMS-lite) per tipe konten.
 *                        Content disimpan dalam format Markdown.
 *
 * @see docs/prd.md §5.2 — Public Front (Profil Penerbit, Panduan Upload)
 * @see docs/prd.md §5.4 — Dashboard Admin (kelola profil penerbit & panduan upload)
 * @see docs/schema.md §1.8 — PublisherProfile
 * @see docs/schema.md §1.9 — UploadGuide
 */

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const uploadGuideTypeEnum = pgEnum("upload_guide_type", [
  "BOOK",
  "ESSAY",
  "GENERAL",
]);

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * publisher_profile — Profil penerbit (singleton).
 * Hanya boleh ada 1 row; di-enforce di level aplikasi.
 * Berisi informasi yang tampil di halaman "Tentang Kami" dan profil penerbit publik.
 */
export const publisherProfile = pgTable("publisher_profile", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  about: text("about").notNull(),
  vision: text("vision"),
  mission: text("mission"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  address: text("address"),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * upload_guide — Panduan upload naskah per tipe konten (CMS-lite).
 * Content disimpan dalam format Markdown dan dirender di halaman panduan publik.
 * Tiap tipe (BOOK, ESSAY, GENERAL) idealnya memiliki satu entri aktif.
 */
export const uploadGuide = pgTable("upload_guide", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: uploadGuideTypeEnum("type").notNull(),
  content: text("content").notNull(),
  updatedById: text("updated_by_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type PublisherProfile = typeof publisherProfile.$inferSelect;
export type NewPublisherProfile = typeof publisherProfile.$inferInsert;

export type UploadGuide = typeof uploadGuide.$inferSelect;
export type NewUploadGuide = typeof uploadGuide.$inferInsert;
export type UploadGuideType = (typeof uploadGuideTypeEnum.enumValues)[number];
