import { minioClient } from "@/common/config/minio";
import Elysia from "elysia";

export const uploadModule = new Elysia({ prefix: "/api/upload" }).get(
  ":filename",
  async ({ params }) => {
    const url = await minioClient.presignedGetObject(
      process.env["MINIO_BUCKET_NAME"] || "assets",
      params.filename,
      24 * 60 * 60,
    );
    return { url };
  },
  {
    // TODO : Add auth middleware
    detail: {
      tags: ["Upload"],
      summary: "Get presigned URL for file",
    },
  },
);
