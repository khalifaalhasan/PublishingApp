// src/modules/catalog/catalog.schema.ts
import { t } from "elysia";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { catalogEntry } from "@/common/db/schema/catalog";

export const selectCatalogEntrySchema = createSelectSchema(catalogEntry, {
  coverImageUrl: t.Union([t.String({ format: "uri" }), t.Null()]),
  publishedAt: t.Union([t.String({ format: "date-time" }), t.Null()]),
});

const rawInsertSchema = createInsertSchema(catalogEntry, {
  slug: t.String({ minLength: 3 }),
  coverImageUrl: t.Optional(t.String({ format: "uri" })),
});

export const insertCatalogEntrySchema = t.Omit(rawInsertSchema, [
  "id",
  "createdAt",
  "updatedAt",
  "publishedAt",
  "publishedById",
]);

export const updatePublishStatusSchema = t.Object({
  isPublished: t.Boolean(),
  coverImageUrl: t.Optional(t.String({ format: "uri" })),
});

export const getCatalogQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  type: t.Optional(t.Union([t.Literal("BOOK"), t.Literal("ESSAY")])),
});

export const catalogSlugParamSchema = t.Object({
  slug: t.String(),
});

export const publishCatalogBodySchema = t.Object({
  submissionId: t.String(),
});
