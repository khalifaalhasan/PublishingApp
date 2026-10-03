import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/submissions/submission-form";
import {
  EDITABLE_STATUSES,
  toFormValues,
  type SubmissionLike,
} from "@/components/submissions/submission-form-shared";

export const metadata = { title: "Revisi naskah" };

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

// ASUMSI: GET /submissions/:id, respons berupa objek submission
// langsung atau dibungkus { data }. Sesuaikan dengan API contract kamu.
async function getSubmission(id: string): Promise<SubmissionLike | null> {
  const cookie = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${API_BASE}/submissions/${id}`, {
    headers: { Cookie: cookie },
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Gagal memuat naskah (${res.status}).`);

  const json = await res.json();
  return (json?.data ?? json) as SubmissionLike;
}

export default async function EditSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) notFound();

  const editable = EDITABLE_STATUSES.includes(submission.status);

  return (
    <div className="flex-1 bg-white text-neutral-900">
      <div className="w-full px-4 py-8 md:px-8 md:py-10">
        <Link
          href={`/submission/${id}`}
          className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          Kembali ke detail naskah
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Revisi naskah
        </h1>

        {editable ? (
          <>
            <p className="mt-1.5 text-sm text-neutral-500">
              Perbaiki sesuai catatan redaksi, lalu kirim ulang. Isian tersimpan
              otomatis di browser ini.
            </p>
            <div className="mt-8">
              <SubmissionForm
                mode="edit"
                submissionId={id}
                initialValues={toFormValues(submission)}
                version={submission.updatedAt}
              />
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-neutral-200 p-6">
            <p className="text-sm font-medium">
              Naskah ini belum bisa direvisi
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Revisi hanya dibuka saat redaksi meminta perbaikan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
