/**
 * Schema: Catalog Module
 *
 * Tables:
 *  - catalog_entry : Jembatan antara submission yang APPROVED dengan tampilan publik di katalog.
 *                    Satu submission APPROVED menghasilkan satu catalog_entry.
 *                    isPublished = false artinya approved tapi belum ditayangkan ke publik.
 *
 * Keputusan desain:
 *   APPROVED (editorial) != isPublished (tampil publik).
 *   Admin perlu melakukan langkah "publish" secara eksplisit agar buku/esai muncul di katalog,
 *   memberi fleksibilitas untuk menunggu cover/layout siap sebelum tayang.
 *
 * @see docs/prd.md §5.4 — Dashboard Admin (kelola katalog)
 * @see docs/prd.md §6 — FR8: hanya submission APPROVED & published yang tampil di katalog
 * @see docs/schema.md §1.7 — CatalogEntry
 */

import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { submission } from "./submissions";

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * catalog_entry — Entry katalog publik untuk submission yang telah disetujui.
 * Relasi 1-to-1 dengan submission; hanya dibuat saat submission.status = 'APPROVED'.
 * `isPublished` mengontrol visibilitas di halaman katalog publik.
 * `slug` digunakan sebagai URL publik (contoh: /katalog/buku/judul-buku).
 */
export const catalogEntry = pgTable("catalog_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id")
    .notNull()
    .unique()
    .references(() => submission.id, { onDelete: "restrict" }),
  slug: text("slug").notNull().unique(),
  coverImageUrl: text("cover_image_url"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  publishedById: text("published_by_id").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type CatalogEntry = typeof catalogEntry.$inferSelect;
export type NewCatalogEntry = typeof catalogEntry.$inferInsert;
