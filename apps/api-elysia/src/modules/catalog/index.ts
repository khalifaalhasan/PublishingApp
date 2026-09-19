/**
 * TODO :
 * Add Find by title
 * Add insert catalog entry
 */

import { Elysia } from "elysia";
import * as service from "./service";
import * as schemas from "./schemas";

export const catalogModule = new Elysia({ prefix: "/catalog" })
  .get(
    "/",
    async ({ query }) => {
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
    async ({ params, set }) => {
      try {
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
  );
