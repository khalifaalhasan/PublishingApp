/**
 * Schema: Auth Module
 *
 * Tables:
 *  - user        : Akun pengguna, di-extend dari Better Auth dengan field `role`
 *  - session     : Session aktif per user (dikelola Better Auth)
 *  - account     : OAuth / provider account (dikelola Better Auth)
 *  - verification: Token verifikasi magic link / OTP (dikelola Better Auth)
 *
 * CATATAN: Tabel session, account, verification adalah tabel internal Better Auth.
 * JANGAN ubah nama kolom — hanya extend tabel `user` dengan kolom custom jika perlu.
 * @see docs/prd.md §5.1 — Autentikasi
 * @see docs/schema.md §1.1 — User
 */

import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USER"]);

// ─── Tables ──────────────────────────────────────────────────────────────────

/**
 * user — Akun pengguna platform.
 * Di-extend dari skema Better Auth dengan tambahan kolom `role`.
 * Role default adalah USER; role ADMIN hanya bisa di-assign oleh admin lain.
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * session — Session aktif per user.
 * Dikelola sepenuhnya oleh Better Auth.
 */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

/**
 * account — Provider account (magic link / OAuth).
 * Dikelola sepenuhnya oleh Better Auth.
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * verification — Token verifikasi untuk magic link / OTP.
 * Dikelola sepenuhnya oleh Better Auth.
 */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
