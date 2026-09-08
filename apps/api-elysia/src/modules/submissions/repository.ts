import { db } from "@common/db";
import {
  type SubmissionStatus,
  type SubmissionType,
  bookDetail,
  essayDetail,
  notification,
  submission,
  submissionFile,
  submissionStatusHistory,
} from "@common/db/schema";
import { and, desc, eq } from "drizzle-orm";

export async function findSubmissions(params: {
  userId?: string;
  status?: SubmissionStatus;
  type?: SubmissionType;
  offset: number;
  limit: number;
}) {
  const filters = [];
  if (params.userId) filters.push(eq(submission.userId, params.userId));
  if (params.status) filters.push(eq(submission.status, params.status));
  if (params.type) filters.push(eq(submission.type, params.type));

  const where = filters.length > 0 ? and(...filters) : undefined;

  return await db
    .select()
    .from(submission)
    .where(where)
    .limit(params.limit)
    .offset(params.offset)
    .orderBy(desc(submission.updatedAt));
}

export async function findSubmissionById(id: string) {
  const [sub] = await db.select().from(submission).where(eq(submission.id, id));
  return sub || null;
}

export async function findSubmissionDetail(id: string, type: SubmissionType) {
  let detail = null;
  if (type === "BOOK") {
    const [book] = await db
      .select()
      .from(bookDetail)
      .where(eq(bookDetail.submissionId, id));
    detail = book;
  } else if (type === "ESSAY") {
    const [essay] = await db
      .select()
      .from(essayDetail)
      .where(eq(essayDetail.submissionId, id));
    detail = essay;
  }

  const files = await db
    .select()
    .from(submissionFile)
    .where(eq(submissionFile.submissionId, id))
    .orderBy(desc(submissionFile.version));

  const history = await db
    .select()
    .from(submissionStatusHistory)
    .where(eq(submissionStatusHistory.submissionId, id))
    .orderBy(desc(submissionStatusHistory.createdAt));

  return { detail, files, history };
}

export async function insertSubmission(data: {
  userId: string;
  type: SubmissionType;
  title: string;
  description: string;
  status: SubmissionStatus;
  isDraft: boolean;
  fileUrl: string;
  fileName: string;
  bookDetail?: {
    genre: string;
    pageCount: number;
    language?: string;
    isbn?: string;
  };
  essayDetail?: { topic: string; wordCount?: number };
}) {
  return await db.transaction(async (tx) => {
    const [newSub] = await tx
      .insert(submission)
      .values({
        userId: data.userId,
        type: data.type,
        title: data.title,
        description: data.description,
        status: data.status,
        submittedAt: !data.isDraft ? new Date() : null,
      })
      .returning();

    if (!newSub) throw new Error("Failed to create submission");

    if (data.type === "BOOK" && data.bookDetail) {
      await tx.insert(bookDetail).values({
        submissionId: newSub.id,
        ...data.bookDetail,
      });
    } else if (data.type === "ESSAY" && data.essayDetail) {
      await tx.insert(essayDetail).values({
        submissionId: newSub.id,
        ...data.essayDetail,
      });
    }

    await tx.insert(submissionFile).values({
      submissionId: newSub.id,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      version: 1,
      uploadedById: data.userId,
    });

    if (!data.isDraft) {
      await tx.insert(submissionStatusHistory).values({
        submissionId: newSub.id,
        toStatus: "AWAITING_REVIEW",
        actorId: data.userId,
      });
    }

    return newSub;
  });
}

export async function updateDraftSubmission(
  id: string,
  userId: string,
  type: SubmissionType,
  data: {
    updatePayload: any;
    bookDetail?: any;
    essayDetail?: any;
    fileUrl?: string;
    fileName?: string;
    isSubmit?: boolean;
  },
) {
  return await db.transaction(async (tx) => {
    if (Object.keys(data.updatePayload).length > 0) {
      await tx
        .update(submission)
        .set(data.updatePayload)
        .where(eq(submission.id, id));
    }

    if (type === "BOOK" && data.bookDetail) {
      await tx
        .update(bookDetail)
        .set(data.bookDetail)
        .where(eq(bookDetail.submissionId, id));
    } else if (type === "ESSAY" && data.essayDetail) {
      await tx
        .update(essayDetail)
        .set(data.essayDetail)
        .where(eq(essayDetail.submissionId, id));
    }

    if (data.fileUrl && data.fileName) {
      const existingFiles = await tx
        .select()
        .from(submissionFile)
        .where(eq(submissionFile.submissionId, id));
      const existingFile = existingFiles[0];
      if (existingFile) {
        await tx
          .update(submissionFile)
          .set({
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            uploadedAt: new Date(),
          })
          .where(eq(submissionFile.id, existingFile.id));
      } else {
        await tx.insert(submissionFile).values({
          submissionId: id,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          version: 1,
          uploadedById: userId,
        });
      }
    }

    if (data.isSubmit) {
      await tx.insert(submissionStatusHistory).values({
        submissionId: id,
        fromStatus: "DRAFT",
        toStatus: "AWAITING_REVIEW",
        actorId: userId,
      });
    }
  });
}

export async function processResubmission(
  id: string,
  userId: string,
  title: string,
  reviewerId: string | null,
  data: { fileUrl: string; fileName: string; note: string },
) {
  return await db.transaction(async (tx) => {
    await tx
      .update(submission)
      .set({ status: "RESUBMITTED", updatedAt: new Date() })
      .where(eq(submission.id, id));

    const files = await tx
      .select()
      .from(submissionFile)
      .where(eq(submissionFile.submissionId, id))
      .orderBy(desc(submissionFile.version))
      .limit(1);
    const firstFile = files[0];
    const newVersion = firstFile ? firstFile.version + 1 : 1;

    await tx.insert(submissionFile).values({
      submissionId: id,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      version: newVersion,
      uploadedById: userId,
    });

    await tx.insert(submissionStatusHistory).values({
      submissionId: id,
      fromStatus: "ACTION_REQUIRED",
      toStatus: "RESUBMITTED",
      actorId: userId,
      note: data.note,
    });

    if (reviewerId) {
      await tx.insert(notification).values({
        userId: reviewerId,
        type: "RESUBMISSION",
        title: "Penulis Mengirim Revisi",
        message: `Revisi untuk naskah "${title}" telah dikirim oleh penulis.`,
        relatedSubmissionId: id,
      });
    }
  });
}

export async function processStatusUpdate(
  id: string,
  adminId: string,
  authorId: string,
  title: string,
  currentStatus: SubmissionStatus,
  newStatus: SubmissionStatus,
  note?: string,
) {
  return await db.transaction(async (tx) => {
    await tx
      .update(submission)
      .set({
        status: newStatus,
        currentReviewerId: adminId,
        updatedAt: new Date(),
      })
      .where(eq(submission.id, id));

    await tx.insert(submissionStatusHistory).values({
      submissionId: id,
      fromStatus: currentStatus,
      toStatus: newStatus,
      actorId: adminId,
      note: note,
    });

    await tx.insert(notification).values({
      userId: authorId,
      type: "STATUS_CHANGE",
      title: "Status Naskah Berubah",
      message: `Status naskah "${title}" berubah menjadi ${newStatus}. ${note ? "Ada catatan untuk Anda." : ""}`,
      relatedSubmissionId: id,
    });
  });
}
