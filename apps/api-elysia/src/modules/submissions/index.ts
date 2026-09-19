import type { SubmissionStatus, SubmissionType } from "@common/db/schema";
import { withAuth } from "@common/middleware/auth-guard";
import { Elysia } from "elysia";
import * as schemas from "./schemas";
import * as service from "./service";

export const submissionsModule = new Elysia({ prefix: "/api/submissions" })
  .use(withAuth)

  // GET /submissions - User gets own, Admin gets all
  .get(
    "/",
    async ({ query, user, log }) => {
      const page = Number(query.page) || 1;
      const limit = Number(query.limit) || 10;
      const status = query.status as SubmissionStatus | undefined;
      const type = query.type as SubmissionType | undefined;

      const userId = user.role === "USER" ? user.id : undefined;

      log.info(`Fetching submissions for user ${userId || "ADMIN"}`);

      const result = await service.getSubmissions({
        userId,
        status,
        type,
        page,
        limit,
      });

      return result;
    },
    {
      auth: ["ADMIN"],
      query: schemas.getSubmissionsQuerySchema,
      detail: {
        tags: ["Submissions"],
        summary: "Get submissions",
      },
    },
  )

  // GET /submissions/:id - User gets own, Admin gets any
  .get(
    "/:id",
    async ({ params, user, set, log }) => {
      try {
        log.info(`Fetching submission detail ${params.id}`);
        const submission = await service.getSubmissionDetail(params.id, {
          id: user.id,
          role: user.role,
        });

        if (!submission) {
          set.status = 404;
          return { error: "Not Found", message: "Submission not found" };
        }

        return { data: submission };
      } catch (error: any) {
        if (error.message === "FORBIDDEN") {
          set.status = 403;
          return {
            error: "Forbidden",
            message: "You can only view your own submissions",
          };
        }

        throw error;
      }
    },
    {
      auth: ["ADMIN", "USER"],
      params: schemas.submissionIdParamSchema,
      detail: {
        tags: ["Submissions"],
        summary: "Get submission detail",
      },
    },
  )

  // POST /submissions - Create submission
  .post(
    "/",
    async ({ body, user, set, log }) => {
      try {
        log.info(`Creating new submission for user ${user.id}`);
        const newSub = await service.createSubmission(user.id, body);
        set.status = 201;
        return {
          message: "Submission created successfully",
          data: newSub,
        };
      } catch (error: any) {
        set.status = 400;
        return { error: "Bad Request", message: error.message };
      }
    },
    {
      auth: "USER",
      body: schemas.createSubmissionBodySchema,
      detail: {
        tags: ["Submissions"],
        summary: "Create submission",
      },
    },
  )

  // PATCH /submissions/:id - Update draft
  .patch(
    "/:id",
    async ({ params, body, user, set, log }) => {
      try {
        log.info(`Updating draft submission ${params.id}`);
        await service.updateDraft(params.id, user.id, body);
        return { message: "Submission updated successfully" };
      } catch (error: any) {
        if (error.message === "NOT_FOUND") set.status = 404;
        else if (error.message === "FORBIDDEN") set.status = 403;
        else set.status = 400;
        return { error: "Error", message: error.message };
      }
    },
    {
      auth: "USER",
      params: schemas.submissionIdParamSchema,
      body: schemas.updateDraftBodySchema,
      detail: {
        tags: ["Submissions"],
        summary: "Update draft submission",
      },
    },
  )

  // POST /submissions/:id/resubmit - Resubmit revised submission
  .post(
    "/:id/resubmit",
    async ({ params, body, user, set, log }) => {
      try {
        log.info(`Resubmitting submission ${params.id}`);
        await service.resubmitSubmission(params.id, user.id, body);
        return { message: "Submission resubmitted successfully" };
      } catch (error: any) {
        if (error.message === "NOT_FOUND") set.status = 404;
        else if (error.message === "FORBIDDEN") set.status = 403;
        else set.status = 400;
        return { error: "Error", message: error.message };
      }
    },
    {
      auth: "USER",
      params: schemas.submissionIdParamSchema,
      body: schemas.resubmitBodySchema,
      detail: {
        tags: ["Submissions"],
        summary: "Resubmit revised submission",
      },
    },
  )

  // PATCH /submissions/:id/status - Admin update status
  .patch(
    "/:id/status",
    async ({ params, body, user, set, log }) => {
      try {
        log.info(
          `Admin ${user.id} updating submission ${params.id} status to ${body.status}`,
        );
        await service.updateSubmissionStatus(
          params.id,
          user.id,
          body.status,
          body.note,
        );
        return { message: "Status updated successfully" };
      } catch (error: any) {
        if (error.message === "NOT_FOUND") set.status = 404;
        else set.status = 400;
        return { error: "Error", message: error.message };
      }
    },
    {
      auth: "ADMIN",
      params: schemas.submissionIdParamSchema,
      body: schemas.updateStatusBodySchema,
      detail: {
        tags: ["Submissions (Admin)"],
        summary: "Update submission status",
      },
    },
  );
