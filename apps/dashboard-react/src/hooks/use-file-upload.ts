import { useState } from "react";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const upload = async (
    file: File,
  ): Promise<{ publicUrl: string; fileName: string } | null> => {
    setIsUploading(true);
    setUploadError("");

    try {
      // Minta presigned URL dari backend dengan method GET

      const url = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(
        `${url}/upload/${encodeURIComponent(file.name)}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!res.ok) throw new Error("Gagal mendapatkan izin unggah.");

      const responseData = await res.json();
      console.log("Raw response dari backend:", responseData);
      const presignedUrl =
        responseData.url || responseData.data?.url || responseData.result?.url;

      if (!presignedUrl) {
        throw new Error(
          "URL presigned tidak ditemukan di dalam response backend!",
        );
      }

      // Amankan proses split dengan memastikan presignedUrl adalah string
      const publicUrl =
        typeof presignedUrl === "string" ? presignedUrl.split("?")[0] : "";
      // 2. Unggah file langsung ke Cloud Storage
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah file naskah.");

      // Berhasil, kembalikan data url dan nama file
      return { publicUrl, fileName: file.name };
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat unggah.",
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    uploadError,
    setUploadError,
  };
}
