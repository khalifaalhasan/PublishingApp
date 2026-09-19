import { minioClient } from "@/common/config/minio";
import { withAuth } from "@common/middleware/auth-guard";
import Elysia from "elysia";

export const uploadModule = withAuth(new Elysia({ prefix: "/api/upload" })).get(
  ":filename",
  async ({ params, log, user }) => {
    log.info(
      `User ${user?.id || "Unknown"} requesting presigned URL for ${params.filename}`,
    );
    const url = await minioClient.presignedGetObject(
      process.env["MINIO_BUCKET_NAME"] || "assets",
      params.filename,
      24 * 60 * 60,
    );
    return { url };
  },
  {
    auth: ["ADMIN"],
    detail: {
      tags: ["Upload"],
      summary: "Get presigned URL for file",
    },
  },
);
