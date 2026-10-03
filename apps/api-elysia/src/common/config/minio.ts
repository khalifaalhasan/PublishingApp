import { Client } from "minio";

const MINIO_ROOT_USER = process.env["ACCESS_KEY"] || "admin";
const MINIO_ROOT_PASSWORD = process.env["MINIO_ROOT_PASSWORD"];

export const minioClient = new Client({
  endPoint: process.env["MINIO_ENDPOINT"] || "localhost",
  port: Number(process.env["MINIO_PORT"]) || 8333,
  useSSL: process.env["MINIO_USE_SSL"] === "true" || false,
  accessKey: MINIO_ROOT_USER,
  secretKey: MINIO_ROOT_PASSWORD || "admin123",
});
