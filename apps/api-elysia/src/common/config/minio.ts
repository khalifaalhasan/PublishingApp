import { Client } from "minio";

export const minioClient = new Client({
  endPoint: process.env["MINIO_ENDPOINT"] || "localhost",
  port: Number(process.env["MINIO_PORT"]) || 10000,
  useSSL: process.env["MINIO_USE_SSL"] === "true" || false,
  accessKey: process.env["MINIO_ROOT_USER"],
  secretKey: process.env["MINIO_ROOT_PASSWORD"],
});

console.log("USER:", JSON.stringify(process.env["MINIO_ROOT_USER"]));
console.log("PASS:", JSON.stringify(process.env["MINIO_ROOT_PASSWORD"]));
