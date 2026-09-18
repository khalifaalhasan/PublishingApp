export interface SubmissionBodySchema {
  title: string;
  description: string;
  type: "BOOK" | "ESSAY";
  isDraft: boolean;
  fileUrl: string;
  fileName: string;
  sellingPoint: string;
  coverLetter: string;
  authorBio: {
    penName: string;
    bio: string;
    phone: string;
    socialLinks: string;
  };
  bookDetail: {
    isbn: string;
    publicationDate: string;
    publisher: string;
  };
  essayDetail: {
    topic: string;
    wordCount: number;
  };
}

export interface GetSubmissionParams {
  userId: string;
  status: SubmissionStatus;
  type: SubmissionType;
  offset: number;
  limit: number;
}

export type SubmissionStatus =
  | "DRAFT"
  | "AWAITING_REVIEW"
  | "IN_REVIEW"
  | "ACTION_REQUIRED"
  | "RESUBMITTED"
  | "APPROVED"
  | "REJECTED";

export type SubmissionType = "BOOK" | "ESSAY";
