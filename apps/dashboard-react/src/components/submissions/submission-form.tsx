"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Button, Input, Label } from "@repo/ui";

import { useFormDraft } from "@/hooks/use-form-draft";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  EMPTY_VALUES,
  toPayload,
  type SubmissionFormValues,
} from "./submission-form-shared";
import { validate, type FormErrors } from "./submission-form-validation";
import {
  createSubmission,
  updateSubmission,
} from "@/actions/submission.actions";

// Import Server Actions

// ── TYPES & CONSTANTS ────────────────────────────────────────────────────────
interface Props {
  mode: "create" | "edit";
  submissionId?: string;
  initialValues?: SubmissionFormValues;
  version?: string;
}

type Intent = "draft" | "submit";
type TextField = keyof SubmissionFormValues;
type BioField = keyof SubmissionFormValues["authorBio"];

const ALLOWED_EXT = [".pdf", ".doc", ".docx"];
const MAX_FILE_MB = 20;

const textareaClass =
  "w-full rounded-md border border-neutral-300 px-3.5 py-2.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 aria-[invalid=true]:border-red-500";
const inputClass =
  "h-11 w-full rounded-md border border-neutral-300 px-3.5 text-sm outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 aria-[invalid=true]:border-red-500";

// ── HELPER COMPONENT ─────────────────────────────────────────────────────────
function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="text-[13px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function SubmissionForm({
  mode,
  submissionId,
  initialValues = EMPTY_VALUES,
  version,
}: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // State Form
  const { values, setField, restored, clear, discard } =
    useFormDraft<SubmissionFormValues>(
      isEdit ? `submission:${submissionId}` : "submission:new",
      initialValues,
      version,
    );

  const { upload, isUploading, uploadError } = useFileUpload();

  // UI States
  const [attempt, setAttempt] = useState<Intent | null>(null);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState<Intent | null>(null);
  const [fileError, setFileError] = useState("");

  const errors: FormErrors = useMemo(
    () => (attempt ? validate(values, attempt === "draft") : {}),
    [attempt, values],
  );
  const errorCount = Object.values(errors).filter(Boolean).length;
  const busy = submitting !== null || isUploading;

  // ── HANDLERS ───────────────────────────────────────────────────────────────
  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError("");
    if (!file) return;

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext))
      return setFileError("Format file harus PDF, DOC, atau DOCX.");
    if (file.size > MAX_FILE_MB * 1024 * 1024)
      return setFileError(`Ukuran maksimal ${MAX_FILE_MB} MB.`);

    const result = await upload(file);
    if (result) {
      setField("fileUrl", result.publicUrl);
      setField("fileName", result.fileName);
    }
    e.target.value = "";
  }

  async function handleSubmit(intent: Intent) {
    setApiError("");
    setAttempt(intent);

    const found = validate(values, intent === "draft");
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    if (isUploading) return setApiError("Tunggu hingga unggahan file selesai.");

    setSubmitting(intent);

    try {
      const payload = toPayload(values, intent === "draft");

      // Panggil Server Action
      const response =
        isEdit && submissionId
          ? await updateSubmission(submissionId, payload)
          : await createSubmission(payload);

      if (!response.success) throw new Error(response.error);

      clear(); // Hapus draf dari local storage setelah berhasil
      router.push(
        isEdit && submissionId ? `/submission/${submissionId}` : "/submission",
      );
    } catch (err: any) {
      setApiError(err.message || "Terjadi kesalahan sistem.");
      setSubmitting(null);
    }
  }

  // ── RENDER UI ──────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit("submit");
      }}
      noValidate
      className="space-y-8"
    >
      {restored && (
        <div
          role="status"
          className="flex items-center justify-between gap-4 rounded-lg bg-neutral-50 px-4 py-3 text-sm"
        >
          <span>Isian dari sesi sebelumnya dipulihkan.</span>
          <button
            type="button"
            onClick={() => {
              discard();
              setAttempt(null);
            }}
            className="font-medium underline text-neutral-600"
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

      <div className="grid gap-x-12 gap-y-10 xl:grid-cols-2">
        {/* KOLOM KIRI: Informasi Naskah */}
        <div className="space-y-8">
          <fieldset disabled={isEdit} className="space-y-3">
            <legend className="text-sm font-medium">Jenis naskah</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["BOOK", "ESSAY"] as const).map((t) => (
                <label
                  key={t}
                  className="flex cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-50"
                >
                  <input
                    type="radio"
                    value={t}
                    checked={values.type === t}
                    onChange={() => setField("type", t)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {t === "BOOK" ? "Buku" : "Esai"}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field id="title" label="Judul" required error={errors.title}>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Judul naskah"
              className={inputClass}
              aria-invalid={!!errors.title}
            />
          </Field>

          <Field
            id="description"
            label="Sinopsis"
            required
            error={errors.description}
          >
            <textarea
              id="description"
              value={values.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={5}
              className={textareaClass}
              aria-invalid={!!errors.description}
            />
          </Field>

          {values.type === "BOOK" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="genre" label="Genre" required error={errors.genre}>
                  <Input
                    id="genre"
                    value={values.genre}
                    onChange={(e) => setField("genre", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field
                id="pageCount"
                label="Jumlah halaman"
                required
                error={errors.pageCount}
              >
                <Input
                  id="pageCount"
                  type="number"
                  value={values.pageCount}
                  onChange={(e) => setField("pageCount", e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field
                id="language"
                label="Bahasa"
                required
                error={errors.language}
              >
                <Input
                  id="language"
                  value={values.language}
                  onChange={(e) => setField("language", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field id="topic" label="Topik" required error={errors.topic}>
                  <Input
                    id="topic"
                    value={values.topic}
                    onChange={(e) => setField("topic", e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field
                id="wordCount"
                label="Jumlah kata"
                required
                error={errors.wordCount}
              >
                <Input
                  id="wordCount"
                  type="number"
                  value={values.wordCount}
                  onChange={(e) => setField("wordCount", e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: File & Profil */}
        <div className="space-y-8">
          <Field
            id="fileUrl"
            label="Unggah naskah"
            required
            hint={`Maks. ${MAX_FILE_MB} MB.`}
            error={errors.fileUrl ?? fileError ?? uploadError}
          >
            {values.fileUrl ? (
              <div className="flex items-center justify-between rounded-xl border p-4 bg-neutral-50">
                <span className="text-sm font-medium">{values.fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setField("fileUrl", "");
                    setField("fileName", "");
                  }}
                  className="text-sm font-medium text-red-600"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center border-neutral-300">
                <span className="text-sm font-medium">
                  {isUploading ? "Mengunggah..." : "Pilih file naskah"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="sr-only"
                />
              </label>
            )}
          </Field>

          <Field
            id="authorBio.penName"
            label="Nama pena"
            error={errors["authorBio.penName"]}
          >
            <Input
              id="authorBio.penName"
              value={values.authorBio.penName}
              onChange={(e) =>
                setField("authorBio", {
                  ...values.authorBio,
                  penName: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>

          <Field
            id="authorBio.phone"
            label="Telepon / WA"
            error={errors["authorBio.phone"]}
          >
            <Input
              id="authorBio.phone"
              value={values.authorBio.phone}
              onChange={(e) =>
                setField("authorBio", {
                  ...values.authorBio,
                  phone: e.target.value,
                })
              }
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="sticky bottom-0 -mx-4 border-t border-neutral-200 bg-white/95 p-4 md:-mx-8 md:px-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-neutral-500">
            {errorCount > 0 ? (
              <span className="text-red-600">
                Periksa {errorCount} isian merah.
              </span>
            ) : (
              "Tersimpan otomatis di browser."
            )}
          </p>
          <div className="flex gap-3">
            <Button asChild variant="ghost">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleSubmit("draft")}
              disabled={busy}
            >
              {submitting === "draft" ? "Menyimpan..." : "Simpan draf"}
            </Button>
            <Button type="submit" disabled={busy}>
              {submitting === "submit"
                ? "Mengirim..."
                : isEdit
                  ? "Kirim revisi"
                  : "Kirim naskah"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
