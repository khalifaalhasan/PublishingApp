import Link from "next/link";
import { notFound, forbidden } from "next/navigation";
import { Button } from "@repo/ui";
import { StatusPill, statusLabel } from "@/components/submissions/status-pill";
import { EDITABLE_STATUSES } from "@/components/submissions/submission-form-shared";
import { getSubmissionDetail } from "@/services/submission.service";
import type { ReactNode } from "react";

export const metadata = { title: "Detail Naskah" };

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm font-medium text-neutral-500 sm:w-1/3 shrink-0">
        {label}
      </dt>
      <dd className="text-sm font-medium text-neutral-900 sm:w-2/3 sm:text-right">
        {value}
      </dd>
    </div>
  );
}

function LongText({ text }: { text?: string | null }) {
  if (!text)
    return <p className="text-sm text-neutral-400 italic">Tidak ada data.</p>;
  return (
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
      {text}
    </p>
  );
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let s;

  try {
    s = await getSubmissionDetail(id);
  } catch (error: any) {
    const status = error?.status ?? error?.statusCode;
    if (status === 403) forbidden();
    if (status === 404) notFound();
    throw error;
  }

  const editable = EDITABLE_STATUSES.includes(s.status);

  // Ambil file terbaru dari array files (jika ada)
  const latestFile =
    s.files && s.files.length > 0 ? s.files[s.files.length - 1] : null;
  const spec = s.detail;

  return (
    <div className="flex-1 bg-neutral-50/50 pb-16 pt-8 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/submission"
            className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            &larr; Kembali ke Daftar Naskah
          </Link>

          <header className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={s.status} />
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-neutral-600">
                  {s.type === "BOOK" ? "Buku" : "Esai"}
                </span>
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 md:text-4xl">
                {s.title}
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Dikirim pada {formatDateTime(s.createdAt)} • Diperbarui{" "}
                {formatDateTime(s.updatedAt)}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {editable && (
                <Button
                  asChild
                  className="h-10 bg-neutral-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
                >
                  <Link href={`/submission/${s.id}/edit`}>Edit Naskah</Link>
                </Button>
              )}
            </div>
          </header>
        </div>

        {/* Grid Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Kiri: Konten Teks */}
          <div className="space-y-6 md:col-span-2">
            <Section title="Sinopsis">
              <LongText text={s.description} />
            </Section>

            {s.sellingPoint && (
              <Section title="Nilai Jual (Selling Point)">
                <LongText text={s.sellingPoint} />
              </Section>
            )}

            {s.coverLetter && (
              <Section title="Surat Pengantar">
                <LongText text={s.coverLetter} />
              </Section>
            )}

            {/* Riwayat Status (History) */}
            {s.history && s.history.length > 0 && (
              <Section title="Riwayat Proses">
                <ol className="relative border-l border-neutral-200 ml-3 space-y-6 mt-2">
                  {s.history.map((h) => (
                    <li key={h.id} className="pl-6">
                      <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-neutral-300 ring-8 ring-white" />
                      <h3 className="text-sm font-semibold text-neutral-900">
                        {statusLabel(h.status)}
                      </h3>
                      <time className="mb-1 text-xs font-normal text-neutral-500">
                        {formatDateTime(h.changedAt)}
                      </time>
                      {h.note && (
                        <div className="mt-2 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-100">
                          {h.note}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </Section>
            )}
          </div>

          {/* Kanan: File, Spesifikasi, & Bio */}
          <div className="space-y-6 md:col-span-1">
            {/* File Naskah */}
            <section className="rounded-xl border border-neutral-200 bg-neutral-900 p-6 text-white shadow-sm">
              <h2 className="text-base font-semibold">File Naskah</h2>
              {latestFile ? (
                <div className="mt-4">
                  <p
                    className="truncate text-sm text-neutral-300 mb-1 font-medium"
                    title={latestFile.fileName}
                  >
                    {latestFile.fileName}
                  </p>
                  <p className="text-xs text-neutral-400 mb-4">
                    Versi {latestFile.version} •{" "}
                    {formatDateTime(latestFile.uploadedAt)}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700 hover:text-white"
                  >
                    <a
                      href={latestFile.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Unduh / Lihat File
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-neutral-400">
                  Belum ada file yang diunggah.
                </p>
              )}
            </section>

            {/* Spesifikasi (Detail Buku / Esai) */}
            {spec && (
              <Section title="Spesifikasi">
                <dl>
                  {s.type === "BOOK" ? (
                    <>
                      <DataRow label="Genre" value={spec.genre} />
                      <DataRow
                        label="Halaman"
                        value={spec.pageCount ? `${spec.pageCount} hlm` : null}
                      />
                      <DataRow label="Bahasa" value={spec.language} />
                      <DataRow label="ISBN" value={spec.isbn} />
                    </>
                  ) : (
                    <>
                      <DataRow label="Topik" value={spec.topic} />
                      <DataRow
                        label="Jumlah Kata"
                        value={spec.wordCount ? `${spec.wordCount} kata` : null}
                      />
                    </>
                  )}
                </dl>
              </Section>
            )}

            {/* Profil Penulis */}
            {s.authorBio && (
              <Section title="Profil Penulis">
                <dl>
                  <DataRow label="Nama Pena" value={s.authorBio.penName} />
                  <DataRow label="Kontak" value={s.authorBio.phone} />

                  {s.authorBio.socialLinks && (
                    <div className="py-3 border-b border-neutral-100 last:border-0">
                      <dt className="text-sm font-medium text-neutral-500 mb-1">
                        Sosial Media
                      </dt>
                      <dd className="text-sm text-neutral-900 flex flex-col gap-1">
                        {s.authorBio.socialLinks.split(",").map((link, idx) => (
                          <a
                            key={idx}
                            href={link.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            {link.trim()}
                          </a>
                        ))}
                      </dd>
                    </div>
                  )}

                  {s.authorBio.bio && (
                    <div className="py-3 border-b border-neutral-100 last:border-0">
                      <dt className="text-sm font-medium text-neutral-500 mb-1">
                        Biografi Singkat
                      </dt>
                      <dd className="text-sm text-neutral-700 leading-relaxed">
                        {s.authorBio.bio}
                      </dd>
                    </div>
                  )}
                </dl>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
