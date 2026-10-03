import Link from "next/link";
import { SubmissionForm } from "@/components/submissions/submission-form";

export const metadata = { title: "Buat submission baru" };

export default function NewSubmissionPage() {
  return (
    <div className="flex-1 bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-2xl px-4 py-8 md:px-8 md:py-10">
        <Link
          href="/submission"
          className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          Kembali ke daftar
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Ajukan naskah
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Isian tersimpan otomatis di browser ini, jadi aman kalau halaman
          dimuat ulang.
        </p>

        <div className="mt-8">
          <SubmissionForm mode="create" />
        </div>
      </div>
    </div>
  );
}
