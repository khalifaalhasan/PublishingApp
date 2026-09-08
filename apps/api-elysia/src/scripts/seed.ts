import { db } from "@common/db";
import {
  bookDetail,
  catalogEntry,
  essayDetail,
  publisherProfile,
  submission,
  submissionStatusHistory,
  uploadGuide,
  user,
} from "@common/db/schema";
import { appLogger } from "@common/logger";

/**
 * Database Seed Script (OPTIONAL)
 * Populates the database with sample data for development.
 * * Usage: bun run db:seed
 *
 * WARNING: Only run this in development environments.
 */

async function seed() {
  appLogger.info("[SEED] Starting database seeding...");

  try {
    // Create sample users
    appLogger.info("[SEED] Creating sample users...");
    const [admin, author1, author2] = await db
      .insert(user)
      .values([
        {
          id: "seed-admin",
          name: "Admin Utama",
          email: "admin@example.com",
          emailVerified: true,
          role: "ADMIN",
        },
        {
          id: "seed-author-1",
          name: "Penulis Satu",
          email: "penulis1@example.com",
          emailVerified: true,
          role: "USER",
        },
        {
          id: "seed-author-2",
          name: "Penulis Dua",
          email: "penulis2@example.com",
          emailVerified: true,
          role: "USER",
        },
      ])
      .onConflictDoNothing()
      .returning();

    if (admin && author1 && author2) {
      appLogger.info(
        `[SEED] Created users: ${admin.email}, ${author1.email}, ${author2.email}`,
      );

      // Create Publisher Profile
      appLogger.info("[SEED] Creating Publisher Profile...");
      await db
        .insert(publisherProfile)
        .values({
          name: "Penerbit Antigravity",
          about:
            "Penerbit digital inovatif yang memajukan literasi dan karya penulis lokal.",
          vision: "Menjadi platform penerbitan paling terpercaya.",
          mission:
            "Memberikan kemudahan bagi penulis untuk menerbitkan karya mereka ke seluruh dunia.",
          contactEmail: "hello@penerbit-antigravity.id",
          contactPhone: "08111222333",
          address: "Jl. Teknologi No. 1, Jakarta Selatan",
        })
        .onConflictDoNothing();

      // Create Upload Guides
      appLogger.info("[SEED] Creating Upload Guides...");
      await db
        .insert(uploadGuide)
        .values([
          {
            type: "BOOK",
            content:
              "# Panduan Upload Naskah Buku\n\n1. Format naskah harus rapi.\n2. Minimal 100 halaman.",
            updatedById: admin.id,
          },
          {
            type: "ESSAY",
            content:
              "# Panduan Upload Esai\n\n1. Tema bebas dan tidak SARA.\n2. Jumlah kata antara 1000 - 3000 kata.",
            updatedById: admin.id,
          },
          {
            type: "GENERAL",
            content:
              "# Syarat & Ketentuan Umum\n\nKarya merupakan hasil asli (orisinal) penulis dan belum pernah dipublikasikan sebelumnya.",
            updatedById: admin.id,
          },
        ])
        .onConflictDoNothing();

      // Create Submissions & details
      appLogger.info("[SEED] Creating Submissions & Details...");

      // 1. DRAFT Book Submission
      const [bookDraft] = await db
        .insert(submission)
        .values({
          userId: author1.id,
          type: "BOOK",
          title: "Panduan Menjadi Developer Handal",
          description:
            "Buku ini membahas langkah-langkah menjadi developer handal menggunakan Elysia.js dan SvelteKit.",
          status: "DRAFT",
        })
        .returning();

      await db.insert(bookDetail).values({
        submissionId: bookDraft.id,
        genre: "Teknologi",
        pageCount: 150,
        language: "Indonesia",
      });

      // 2. APPROVED Book Submission (also in Catalog)
      const [bookApproved] = await db
        .insert(submission)
        .values({
          userId: author2.id,
          type: "BOOK",
          title: "Misteri Hutan Pinus",
          description:
            "Sebuah novel misteri yang menceritakan hilangnya seorang detektif di hutan pinus.",
          status: "APPROVED",
          currentReviewerId: admin.id,
        })
        .returning();

      await db.insert(bookDetail).values({
        submissionId: bookApproved.id,
        genre: "Fiksi / Misteri",
        pageCount: 220,
        language: "Indonesia",
        isbn: "978-602-0000-00-1",
      });

      await db.insert(submissionStatusHistory).values({
        submissionId: bookApproved.id,
        fromStatus: "DRAFT",
        toStatus: "APPROVED",
        actorId: admin.id,
        note: "Naskah yang sangat baik dan siap untuk diterbitkan.",
      });

      await db.insert(catalogEntry).values({
        submissionId: bookApproved.id,
        slug: "misteri-hutan-pinus",
        isPublished: true,
        publishedById: admin.id,
      });

      // 3. IN_REVIEW Essay Submission
      const [essayReview] = await db
        .insert(submission)
        .values({
          userId: author1.id,
          type: "ESSAY",
          title: "Dampak AI Pada Pendidikan Anak",
          description:
            "Esai pendek yang menelaah sisi positif dan negatif penggunaan AI pada pendidikan dasar.",
          status: "IN_REVIEW",
          currentReviewerId: admin.id,
        })
        .returning();

      await db.insert(essayDetail).values({
        submissionId: essayReview.id,
        topic: "Pendidikan & Teknologi",
        wordCount: 1500,
      });

      await db.insert(submissionStatusHistory).values({
        submissionId: essayReview.id,
        fromStatus: "AWAITING_REVIEW",
        toStatus: "IN_REVIEW",
        actorId: admin.id,
      });

      appLogger.info(
        "[SEED] Successfully seeded platform data (Users, Profile, Submissions, Catalog)",
      );
    } else {
      appLogger.info("[SEED] Sample data already exists. No new seed created.");
    }
  } catch (error) {
    appLogger.error({ error }, "[SEED] Seeding failed");
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
