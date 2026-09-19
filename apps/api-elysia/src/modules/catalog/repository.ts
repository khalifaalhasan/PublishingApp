import {
  bookDetail,
  catalogEntry,
  essayDetail,
  submission,
} from "@/common/db/schema";
import { db } from "@common/db";
import { eq, and, sql } from "drizzle-orm";

export const catalogRepository = {
  async getPublicCatalog(options: {
    type?: "BOOK" | "ESSAY";
    limit: number;
    offset: number;
  }) {
    const { type, limit, offset } = options;

    const items = await db
      .select({
        id: catalogEntry.id,
        slug: catalogEntry.slug,
        coverImageUrl: catalogEntry.coverImageUrl,
        publishedAt: catalogEntry.publishedAt,
        submissionId: submission.id,
        title: submission.title,
        description: submission.description,
        type: submission.type,
        // Detail Buku (akan null jika tipe ESSAY)
        bookDetail: {
          genre: bookDetail.genre,
          pageCount: bookDetail.pageCount,
          language: bookDetail.language,
          isbn: bookDetail.isbn,
        },
        // Detail Esai (akan null jika tipe BOOK)
        essayDetail: {
          topic: essayDetail.topic,
          wordCount: essayDetail.wordCount,
        },
      })
      .from(catalogEntry)
      .innerJoin(submission, eq(catalogEntry.submissionId, submission.id))
      .leftJoin(bookDetail, eq(submission.id, bookDetail.submissionId))
      .leftJoin(essayDetail, eq(submission.id, essayDetail.submissionId))
      .where(
        and(
          eq(catalogEntry.isPublished, true),
          eq(submission.status, "APPROVED"),
          type ? eq(submission.type, type) : undefined,
        ),
      )
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(catalogEntry)
      .innerJoin(submission, eq(catalogEntry.submissionId, submission.id))
      .where(
        and(
          eq(catalogEntry.isPublished, true),
          eq(submission.status, "APPROVED"),
          type ? eq(submission.type, type) : undefined,
        ),
      );

    const total = Number(totalResult[0]?.count || 0);

    return { items, total };
  },

  async getCatalogBySlug(slug: string) {
    const result = await db
      .select({
        id: catalogEntry.id,
        slug: catalogEntry.slug,
        coverImageUrl: catalogEntry.coverImageUrl,
        publishedAt: catalogEntry.publishedAt,
        submissionId: submission.id,
        title: submission.title,
        description: submission.description,
        type: submission.type,
        bookDetail: {
          genre: bookDetail.genre,
          pageCount: bookDetail.pageCount,
          language: bookDetail.language,
          isbn: bookDetail.isbn,
        },
        essayDetail: {
          topic: essayDetail.topic,
          wordCount: essayDetail.wordCount,
        },
      })
      .from(catalogEntry)
      .innerJoin(submission, eq(catalogEntry.submissionId, submission.id))
      .leftJoin(bookDetail, eq(submission.id, bookDetail.submissionId))
      .leftJoin(essayDetail, eq(submission.id, essayDetail.submissionId))
      .where(
        and(
          eq(catalogEntry.slug, slug),
          eq(catalogEntry.isPublished, true),
          eq(submission.status, "APPROVED"),
        ),
      )
      .limit(1);

    return result[0] || null;
  },

  // for insert catalog entry, we need to find the submission title first
  async findSubmissionTitle(submissionId: string) {
    const result = await db
      .select({ title: submission.title })
      .from(submission)
      .where(eq(submission.id, submissionId))
      .limit(1);

    return result[0] || null;
  },

  async findCatalogBySlug(slug: string) {
    const result = await db
      .select()
      .from(catalogEntry)
      .where(eq(catalogEntry.slug, slug))
      .limit(1);

    return result[0] || null;
  },

  async insertCatalogEntry(data: {
    submissionId: string;
    slug: string;
    publishedById: string;
    isPublished?: boolean;
  }) {
    const result = await db
      .insert(catalogEntry)
      .values({
        submissionId: data.submissionId,
        slug: data.slug,
        isPublished: data.isPublished ?? false,
        publishedById: data.publishedById,
      })
      .returning();

    return result[0];
  },
};
