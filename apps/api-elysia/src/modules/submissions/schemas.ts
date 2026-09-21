import { t } from "elysia";

export const authorBioSchema = t.Object({
  penName: t.Optional(t.String()),
  bio: t.String(),
  phone: t.String(),
  socialLinks: t.Optional(t.String()),
});

export const bookDetailSchema = t.Object({
  genre: t.String(),
  pageCount: t.Number(),
  language: t.Optional(t.String()),
  isbn: t.Optional(t.String()),
});

export const createBookDetailSchema = t.Object({
  genre: t.String(),
  pageCount: t.Number(),
  language: t.Optional(t.String()),
});

export const essayDetailSchema = t.Object({
  topic: t.String(),
  wordCount: t.Optional(t.Number()),
});

export const getSubmissionsQuerySchema = t.Object({
  page: t.Optional(t.String()),
  limit: t.Optional(t.String()),
  status: t.Optional(t.String()),
  type: t.Optional(t.String()),
});

export const submissionIdParamSchema = t.Object({
  id: t.String({ format: "uuid" }),
});

export const createBookSubmissionBodySchema = t.Intersect([
  t.Object({
    title: t.String(),
    description: t.String(),
    type: t.Literal("BOOK"),
    isDraft: t.Boolean(),
    fileUrl: t.Optional(t.String()),
    fileName: t.Optional(t.String()),
    sellingPoint: t.Optional(t.String()),
    coverLetter: t.Optional(t.String()),
    authorBio: authorBioSchema,
  }),
  t.Object({
    bookDetail: createBookDetailSchema,
  }),
]);

export const createEssaySubmissionBodySchema = t.Intersect([
  t.Object({
    title: t.String(),
    description: t.String(),
    type: t.Literal("ESSAY"),
    isDraft: t.Boolean(),
    fileUrl: t.String(),
    fileName: t.String(),
    sellingPoint: t.Optional(t.String()),
    coverLetter: t.Optional(t.String()),
    authorBio: authorBioSchema,
  }),
  t.Object({
    essayDetail: essayDetailSchema,
  }),
]);

export const createSubmissionBodySchema = t.Union([
  createBookSubmissionBodySchema,
  createEssaySubmissionBodySchema,
]);

export const updateDraftBodySchema = t.Object({
  title: t.Optional(t.String()),
  description: t.Optional(t.String()),
  fileUrl: t.Optional(t.String()),
  fileName: t.Optional(t.String()),
  bookDetail: t.Optional(t.Partial(bookDetailSchema)),
  essayDetail: t.Optional(t.Partial(essayDetailSchema)),
  isSubmit: t.Optional(t.Boolean()),
});

export const resubmitBodySchema = t.Object({
  fileUrl: t.String(),
  fileName: t.String(),
  note: t.String(),
});

export const updateStatusBodySchema = t.Object({
  status: t.Union([
    t.Literal("IN_REVIEW"),
    t.Literal("ACTION_REQUIRED"),
    t.Literal("APPROVED"),
    t.Literal("REJECTED"),
  ]),
  note: t.Optional(t.String()),
});
