"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import type { SubmissionDetail, SubmissionType } from "@/types/api";

// Sesuaikan payload dengan field yang ada di form pengiriman naskah Anda
export interface SubmissionPayload {
  title: string;
  description: string;
  type: SubmissionType;
  fileUrl?: string;
  fileName?: string;
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
}

/**
 * Action untuk CREATE naskah baru
 */
export async function createSubmission(payload: SubmissionPayload) {
  try {
    const newSubmission = await apiFetch<SubmissionDetail>("/submissions", {
      method: "POST",
      body: payload,
    });

    // Membersihkan cache halaman daftar naskah
    revalidatePath("/submission");

    // Kembalikan objek jika ingin handle toast success di client,
    // atau gunakan redirect langsung di bawah ini.
    return { success: true, data: newSubmission };
  } catch (error: any) {
    console.error("Create submission error:", error);
    return {
      success: false,
      error: error?.message || "Gagal membuat naskah baru. Silakan coba lagi.",
    };
  }
}

/**
 * Action untuk UPDATE/EDIT naskah yang sudah ada
 */
export async function updateSubmission(
  id: string,
  payload: Partial<SubmissionPayload>,
) {
  try {
    const updatedSubmission = await apiFetch<SubmissionDetail>(
      `/submissions/${id}`,
      {
        method: "PUT", // Atau "PATCH", sesuaikan dengan standar API backend Anda
        body: payload,
      },
    );

    // Revalidate halaman list dan halaman detail
    revalidatePath("/submission");
    revalidatePath(`/submission/${id}`);

    return { success: true, data: updatedSubmission };
  } catch (error: any) {
    console.error("Update submission error:", error);
    return {
      success: false,
      error: error?.message || "Gagal memperbarui naskah. Silakan coba lagi.",
    };
  }
}
