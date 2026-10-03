"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button, Input, Label } from "@repo/ui";
import { useFormDraft } from "@/hooks/use-form-draft";
import { createSubmission, updateSubmission } from "@/lib/submission-api";
import {
  EMPTY_VALUES,
  toPayload,
  validate,
  type FormErrors,
  type SubmissionFormValues,
} from "./submission-form-shared";
import { useFileUpload } from "@/hooks/use-file-upload";

interface Props {
  mode: "create" | "edit";
  submissionId?: string;
  initialValues?: SubmissionFormValues;
  /** Dipakai untuk membuang draf lama, mis. updatedAt dari server. */
  version?: string;
}

const textareaClass =
  "w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:border-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15 aria-[invalid=true]:border-red-500";

const inputClass = "h-11 bg-white px-3.5 aria-[invalid=true]:border-red-500";

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[13px] font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmissionForm({
  mode,
  submissionId,
  initialValues = EMPTY_VALUES,
  version,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const { values, setField, restored, clear, discard } =
    useFormDraft<SubmissionFormValues>(
      isEdit ? `submission:${submissionId}` : "submission:new",
      initialValues,
      version,
    );

  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  // Menyimpan status loading mana yang sedang berjalan
  const [submitting, setSubmitting] = useState<"draft" | "submit" | null>(null);

  // State perantara untuk mendeteksi tombol mana yang diklik
  const [isDraftAction, setIsDraftAction] = useState(false);

  const { upload, isUploading, uploadError } = useFileUpload();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Proses upload pakai hook
    const result = await upload(file);

    if (result) {
      // Jika berhasil, update nilai form
      update("fileUrl", result.publicUrl);
      update("fileName", result.fileName);
    }

    // Reset input agar user bisa pilih file ulang (meskipun file yang sama)
    e.target.value = "";
  }

  // Helper untuk field level pertama
  function update<K extends keyof SubmissionFormValues>(
    field: K,
    value: SubmissionFormValues[K],
  ) {
    setField(field, value);
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // Helper untuk field nested (authorBio)
  function updateBio(
    field: keyof SubmissionFormValues["authorBio"],
    value: string,
  ) {
    setField("authorBio", { ...values.authorBio, [field]: value });
    const errorKey = `authorBio.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: undefined }));
    }
  }

  const a11y = (field: string) => ({
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiError("");

    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const actionType = isDraftAction ? "draft" : "submit";
    setSubmitting(actionType);

    try {
      // isDraftAction diteruskan ke helper toPayload
      const payload = toPayload(values, isDraftAction);

      if (isEdit && submissionId) {
        await updateSubmission(submissionId, payload);
      } else {
        await createSubmission(payload);
      }
      clear(); // hapus draf hanya setelah server menerima
      router.push(
        isEdit && submissionId ? `/submission/${submissionId}` : "/submission",
      );
      router.refresh();
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim naskah. Coba lagi.",
      );
      setSubmitting(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      {restored && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm"
        >
          <span className="text-neutral-700">
            Isian dari sesi sebelumnya dipulihkan.
          </span>
          <button
            type="button"
            onClick={() => {
              discard();
              setErrors({});
            }}
            className="shrink-0 font-medium underline underline-offset-4 hover:text-neutral-600"
          >
            Buang draf
          </button>
        </div>
      )}

      {apiError && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {apiError}
        </div>
      )}

      {/* Jenis naskah */}
      <fieldset disabled={isEdit} className="space-y-3">
        <legend className="text-sm font-medium">Jenis naskah</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(["BOOK", "ESSAY"] as const).map((t) => (
            <label
              key={t}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-4 transition-colors has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-900/20"
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={values.type === t}
                onChange={() => update("type", t)}
                className="sr-only"
              />
              <span className="text-sm font-medium">
                {t === "BOOK" ? "Buku" : "Esai"}
              </span>
              <span className="text-xs text-neutral-500">
                {t === "BOOK"
                  ? "Naskah panjang: novel atau nonfiksi."
                  : "Tulisan pendek dengan satu topik."}
              </span>
            </label>
          ))}
        </div>
        {isEdit && (
          <p className="text-xs text-neutral-500">
            Jenis naskah tidak bisa diubah setelah dikirim.
          </p>
        )}
      </fieldset>

      {/* Informasi naskah */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold">Informasi naskah</h2>

        <Field id="title" label="Judul" error={errors.title}>
          <Input
            id="title"
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Judul naskah"
            className={inputClass}
            {...a11y("title")}
          />
        </Field>

        <Field
          id="description"
          label="Sinopsis"
          hint="Ringkas isi naskah dalam beberapa kalimat."
          error={errors.description}
        >
          <textarea
            id="description"
            rows={5}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            className={textareaClass}
            {...a11y("description")}
          />
        </Field>

        <Field
          id="sellingPoint"
          label="Nilai jual"
          hint="Apa yang membuat naskah ini layak diterbitkan? (opsional)"
        >
          <textarea
            id="sellingPoint"
            rows={3}
            value={values.sellingPoint}
            onChange={(e) => update("sellingPoint", e.target.value)}
            className={textareaClass}
          />
        </Field>
      </section>

      {/* File Naskah (Baru) */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold">File Naskah</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="fileName" label="Nama File" error={errors.fileName}>
            <Input
              id="fileName"
              value={values.fileName}
              onChange={(e) => update("fileName", e.target.value)}
              placeholder="Naskah_Final.pdf"
              className={inputClass}
              {...a11y("fileName")}
            />
          </Field>

          <Field
            id="fileUrl"
            label="File Naskah"
            hint="Unggah naskah Anda (format PDF/DOCX)."
            error={errors.fileUrl || uploadError} // Gabungkan error form & error upload
          >
            {values.fileUrl ? (
              <div className="flex h-11 items-center justify-between gap-3 rounded-md border border-neutral-300 bg-neutral-50 px-3.5">
                <span className="truncate text-sm font-medium text-neutral-700">
                  {values.fileName || "File telah diunggah"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    update("fileUrl", "");
                    update("fileName", "");
                  }}
                  className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                >
                  Hapus File
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  id="fileUrl"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload} // Pakai handler mungil yang dibuat di atas
                  disabled={isUploading}
                  className="block w-full text-sm text-neutral-500 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-neutral-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-800 disabled:opacity-50"
                  {...a11y("fileUrl")}
                />
                {isUploading && (
                  <span className="text-xs font-medium text-neutral-600">
                    Sedang mengunggah file... mohon tunggu.
                  </span>
                )}
              </div>
            )}
          </Field>
        </div>
      </section>

      {/* Detail sesuai jenis */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold">
          {values.type === "BOOK" ? "Detail buku" : "Detail esai"}
        </h2>

        {values.type === "BOOK" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="genre" label="Genre" error={errors.genre}>
              <Input
                id="genre"
                value={values.genre}
                onChange={(e) => update("genre", e.target.value)}
                placeholder="Contoh: Fiksi / Misteri"
                className={inputClass}
                {...a11y("genre")}
              />
            </Field>
            <Field
              id="pageCount"
              label="Jumlah halaman"
              error={errors.pageCount}
            >
              <Input
                id="pageCount"
                type="number"
                inputMode="numeric"
                min={1}
                value={values.pageCount}
                onChange={(e) => update("pageCount", e.target.value)}
                className={inputClass}
                {...a11y("pageCount")}
              />
            </Field>
            <Field id="language" label="Bahasa">
              <Input
                id="language"
                value={values.language}
                onChange={(e) => update("language", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field
              id="isbn"
              label="ISBN"
              hint="Isi kalau sudah ada (opsional)."
            >
              <Input
                id="isbn"
                value={values.isbn}
                onChange={(e) => update("isbn", e.target.value)}
                placeholder="978-602-0000-00-1"
                className={inputClass}
              />
            </Field>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="topic" label="Topik" error={errors.topic}>
              <Input
                id="topic"
                value={values.topic}
                onChange={(e) => update("topic", e.target.value)}
                placeholder="Contoh: Pendidikan & Teknologi"
                className={inputClass}
                {...a11y("topic")}
              />
            </Field>
            <Field id="wordCount" label="Jumlah kata" error={errors.wordCount}>
              <Input
                id="wordCount"
                type="number"
                inputMode="numeric"
                min={1}
                value={values.wordCount}
                onChange={(e) => update("wordCount", e.target.value)}
                className={inputClass}
                {...a11y("wordCount")}
              />
            </Field>
          </div>
        )}
      </section>

      {/* Pengantar & Profil Penulis */}
      <section className="space-y-5">
        <h2 className="text-base font-semibold">Pengantar & Profil Penulis</h2>

        <Field id="coverLetter" label="Surat pengantar" hint="Opsional.">
          <textarea
            id="coverLetter"
            rows={4}
            value={values.coverLetter}
            onChange={(e) => update("coverLetter", e.target.value)}
            className={textareaClass}
          />
        </Field>

        <div className="grid gap-5 rounded-lg border border-neutral-200 bg-neutral-50/50 p-5 sm:grid-cols-2">
          <Field
            id="penName"
            label="Nama Pena"
            hint="Nama samaran jika ada (opsional)."
            error={errors["authorBio.penName"]}
          >
            <Input
              id="penName"
              value={values.authorBio.penName}
              onChange={(e) => updateBio("penName", e.target.value)}
              className={inputClass}
              {...a11y("authorBio.penName")}
            />
          </Field>

          <Field
            id="phone"
            label="Nomor Telepon / WA"
            hint="Opsional."
            error={errors["authorBio.phone"]}
          >
            <Input
              id="phone"
              type="tel"
              value={values.authorBio.phone}
              onChange={(e) => updateBio("phone", e.target.value)}
              className={inputClass}
              {...a11y("authorBio.phone")}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field
              id="socialLinks"
              label="Tautan Sosial Media"
              hint="Instagram / Twitter / LinkedIn (opsional)."
              error={errors["authorBio.socialLinks"]}
            >
              <Input
                id="socialLinks"
                value={values.authorBio.socialLinks}
                onChange={(e) => updateBio("socialLinks", e.target.value)}
                className={inputClass}
                {...a11y("authorBio.socialLinks")}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field
              id="bio"
              label="Biografi Singkat"
              hint="Ceritakan tentang diri Anda (opsional)."
              error={errors["authorBio.bio"]}
            >
              <textarea
                id="bio"
                rows={3}
                value={values.authorBio.bio}
                onChange={(e) => updateBio("bio", e.target.value)}
                className={textareaClass}
                {...a11y("authorBio.bio")}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Aksi */}
      <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          Isian tersimpan otomatis di browser ini.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-lg px-5 sm:flex-none"
          >
            <Link
              href={
                isEdit && submissionId
                  ? `/submission/${submissionId}`
                  : "/submission"
              }
            >
              Batal
            </Link>
          </Button>

          {/* Tombol Simpan sebagai Draf */}
          <Button
            type="submit"
            onClick={() => setIsDraftAction(true)}
            disabled={submitting !== null}
            variant="outline"
            className="h-11 flex-1 rounded-lg px-5 font-semibold sm:flex-none"
          >
            {submitting === "draft"
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan Draf"
                : "Simpan Draf"}
          </Button>

          {/* Tombol Kirim Form */}
          <Button
            type="submit"
            onClick={() => setIsDraftAction(false)}
            disabled={submitting !== null}
            className="h-11 flex-1 rounded-lg px-5 font-semibold sm:flex-none"
          >
            {submitting === "submit"
              ? "Mengirim..."
              : isEdit
                ? "Kirim Revisi"
                : "Kirim Naskah"}
          </Button>
        </div>
      </div>
    </form>
  );
}
