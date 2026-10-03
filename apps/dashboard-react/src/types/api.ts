// ─────────────────────────────────────────────────────────────
// API Types — sesuai api-contract.md v1.0
// ─────────────────────────────────────────────────────────────

// ── Enums ────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";

export type SubmissionType = "BOOK" | "ESSAY";

export type SubmissionStatus =
  | "DRAFT"
  | "AWAITING_REVIEW"
  | "IN_REVIEW"
  | "ACTION_REQUIRED"
  | "RESUBMITTED"
  | "APPROVED"
  | "REJECTED";

// ── Auth ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified: boolean;
}

// ── Submission ───────────────────────────────────────────────

export interface Submission {
  id: string;
  title: string;
  description: string;
  type: SubmissionType;
  status: SubmissionStatus;
  fileUrl: string;
  fileName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionDetail extends Submission {
  sellingPoint?: string;
  coverLetter?: string;
  authorBio?: {
    penName?: string;
    bio?: string;
    phone?: string;
    socialLinks?: string;
  };
  bookDetail?: {
    genre?: string;
    pageCount?: number;
    language?: string;
  };
  essayDetail?: {
    topic?: string;
    wordCount?: number;
  };
  statusHistory?: StatusHistoryEntry[];
}

export interface StatusHistoryEntry {
  id: string;
  status: SubmissionStatus;
  note?: string;
  changedAt: string;
  changedBy?: string;
}

// ── Notification ─────────────────────────────────────────────

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  submissionId?: string;
}

// ── Shared ───────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
}
