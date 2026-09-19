import { Elysia } from "elysia";
import { withAuth } from "@common/middleware/auth-guard";
import * as service from "./service";
import * as schemas from "./schemas";

export const catalogModule = new Elysia({ prefix: "/catalog" })
  .get(
    "/",
    async ({ query, log }) => {
      log.info(
        `Fetching public catalog list (page: ${query.page}, limit: ${query.limit})`,
      );
      return await service.catalogService.fetchPublicCatalog(query);
    },
    {
      query: schemas.getCatalogQuerySchema,
      detail: {
        tags: ["Catalog"],
        summary: "Get public catalog list with pagination and filter",
      },
    },
  )
  .get(
    "/:slug",
    async ({ params, set, log }) => {
      try {
        log.info(`Fetching catalog detail for slug: ${params.slug}`);
        return await service.catalogService.fetchCatalogDetail(params.slug);
      } catch (error) {
        set.status = 404;
        return {
          success: false,
          error: error instanceof Error ? error.message : "Catalog not found",
        };
      }
    },
    {
      params: schemas.catalogSlugParamSchema,
      detail: {
        tags: ["Catalog"],
        summary: "Get catalog detail by slug",
      },
    },
  )
  .use(withAuth)
  .post(
    "/publish",
    async ({ body, user, set, log }) => {
      try {
        log.info(
          `Publishing submission ${body.submissionId} by admin ${user.id}`,
        );
        const result =
          await service.catalogService.createCatalogEntryFromSubmission(
            body.submissionId,
            user.id,
          );
        set.status = 201;
        return result;
      } catch (error: unknown) {
        set.status = 400;
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to publish catalog",
        };
      }
    },
    {
      auth: ["ADMIN"],
      body: schemas.publishCatalogBodySchema,
      detail: {
        tags: ["Catalog (Admin)"],
        summary: "Publish a submission to catalog",
      },
    },
  );
