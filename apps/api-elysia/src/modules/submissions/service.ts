import type { SubmissionStatus, SubmissionType } from "@common/db/schema";
import * as repo from "./repository";

export type AuthorBioInput = {
  penName?: string;
  bio: string;
  phone: string;
  socialLinks?: string;
};

export type CreateSubmissionInput = {
  title: string;
  description: string;
  type: SubmissionType;
  fileUrl: string;
  fileName: string;
  sellingPoint?: string;
  coverLetter?: string;
  authorBio: AuthorBioInput;
} & (
  | {
      type: "BOOK";
      bookDetail: {
        genre: string;
        pageCount: number;
        language?: string;
      };
    }
  | {
      type: "ESSAY";
      essayDetail: { topic: string; wordCount?: number };
    }
);

export async function getSubmissions(params: {
  userId?: string;
  status?: SubmissionStatus;
  type?: SubmissionType;
  page: number;
  limit: number;
}) {
  const { userId, status, type, page, limit } = params;
  const offset = (page - 1) * limit;

  const data = await repo.findSubmissions({
    userId,
    status,
    type,
    offset,
    limit,
  });

  return {
    data,
    meta: {
      page,
      limit,
    },
  };
}

export async function getSubmissionDetail(
  id: string,
  currentUser: { id: string; role: string },
) {
  const sub = await repo.findSubmissionById(id);

  if (!sub) return null;

  // Ownership Check
  if (currentUser.role === "USER" && sub.userId !== currentUser.id) {
    throw new Error("FORBIDDEN");
  }

  const related = await repo.findSubmissionDetail(id, sub.type);

  return {
    ...sub,
    ...related,
  };
}

export async function createSubmission(
  userId: string,
  data: CreateSubmissionInput,
) {
  const status: SubmissionStatus = "AWAITING_REVIEW";

  return await repo.insertSubmission({
    userId,
    status,
    ...data,
  });
}

export async function updateDraft(
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    bookDetail?: {
      genre?: string;
      pageCount?: number;
      language?: string;
      isbn?: string;
    };
    essayDetail?: { topic?: string; wordCount?: number };
    isSubmit?: boolean;
  },
) {
  const sub = await repo.findSubmissionById(id);

  if (!sub) throw new Error("NOT_FOUND");
  if (sub.userId !== userId) throw new Error("FORBIDDEN");

  const updatePayload: any = {};
  if (data.title) updatePayload.title = data.title;
  if (data.description) updatePayload.description = data.description;

  if (data.isSubmit) {
    updatePayload.status = "AWAITING_REVIEW";
    updatePayload.submittedAt = new Date();
  }

  await repo.updateDraftSubmission(id, userId, sub.type, {
    updatePayload,
    bookDetail: data.bookDetail,
    essayDetail: data.essayDetail,
    fileUrl: data.fileUrl,
    fileName: data.fileName,
    isSubmit: data.isSubmit,
  });

  return { success: true };
}

export async function resubmitSubmission(
  id: string,
  userId: string,
  data: { fileUrl: string; fileName: string; note: string },
) {
  const sub = await repo.findSubmissionById(id);

  if (!sub) throw new Error("NOT_FOUND");
  if (sub.userId !== userId) throw new Error("FORBIDDEN");
  if (sub.status !== "ACTION_REQUIRED")
    throw new Error("BAD_REQUEST_NOT_ACTION_REQUIRED");

  await repo.processResubmission(
    id,
    userId,
    sub.title,
    sub.currentReviewerId,
    data,
  );

  return { success: true };
}

export async function updateSubmissionStatus(
  id: string,
  adminId: string,
  status: SubmissionStatus,
  note?: string,
) {
  const sub = await repo.findSubmissionById(id);

  if (!sub) throw new Error("NOT_FOUND");

  if (
    (status === "ACTION_REQUIRED" || status === "REJECTED") &&
    (!note || note.trim() === "")
  ) {
    throw new Error("BAD_REQUEST_NOTE_REQUIRED");
  }

  await repo.processStatusUpdate(
    id,
    adminId,
    sub.userId,
    sub.title,
    sub.status,
    status,
    note,
  );

  return { success: true };
}
