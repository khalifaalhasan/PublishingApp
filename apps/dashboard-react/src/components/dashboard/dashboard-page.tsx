// SERVER COMPONENT — pure display, tanpa hooks.
// Data diterima sebagai props dari page.tsx (sudah di-fetch di server).
import Link from "next/link";
import { Button } from "@repo/ui";
import type {
  Notification,
  PaginatedResponse,
  Submission,
  User,
} from "@/types/api";
import { countUnread } from "@/services/notification.service";

interface Props {
  user: User | null;
  submissions: PaginatedResponse<Submission> | null;
  notifications: Notification[];
}

// Status DRAFT sudah dihapus dari enum database, jadi tidak ada di sini.
// Class warna ditulis utuh supaya terbaca oleh Tailwind.
const STATUS: Record<string, { label: string; dot: string }> = {
  AWAITING_REVIEW: { label: "Menunggu review", dot: "bg-amber-500" },
  IN_REVIEW: { label: "Sedang direview", dot: "bg-blue-500" },
  ACTION_REQUIRED: { label: "Perlu revisi", dot: "bg-orange-500" },
  RESUBMITTED: { label: "Dikirim ulang", dot: "bg-violet-500" },
  APPROVED: { label: "Disetujui", dot: "bg-emerald-500" },
  REJECTED: { label: "Ditolak", dot: "bg-red-500" },
};

const IN_PROGRESS = ["AWAITING_REVIEW", "IN_REVIEW", "RESUBMITTED"];

function StatusPill({ status }: { status: string }) {
  const config = STATUS[status] ?? { label: status, dot: "bg-neutral-400" };
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700">
      <span
        className={`size-1.5 rounded-full ${config.dot}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function summarize(total: number, needsAction: number, inProgress: number) {
  if (total === 0)
    return "Belum ada naskah. Mulai dengan mengajukan yang pertama.";
  if (needsAction > 0)
    return `${needsAction} naskah menunggu revisi dari Anda.`;
  if (inProgress > 0)
    return `${inProgress} naskah sedang diproses tim redaksi.`;
  return "Semua naskah Anda sudah selesai diproses.";
}

export default function DashboardPageView({
  user,
  submissions,
  notifications,
}: Props) {
  const all = submissions?.data ?? [];
  const recent = all.slice(0, 5);
  const needsAction = all.filter((s) => s.status === "ACTION_REQUIRED");
  const inProgress = all.filter((s) => IN_PROGRESS.includes(s.status));
  const approved = all.filter((s) => s.status === "APPROVED");

  const unreadCount = countUnread(notifications);
  const firstName = user?.name?.split(" ")[0] ?? "Penulis";

  const stats = [
    { label: "Total naskah", value: all.length },
    { label: "Dalam proses", value: inProgress.length },
    { label: "Perlu revisi", value: needsAction.length },
    { label: "Disetujui", value: approved.length },
  ];

  return (
    <div className="flex-1 bg-white text-neutral-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8 md:py-10">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Hai, {firstName}
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              {summarize(all.length, needsAction.length, inProgress.length)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <span className="text-sm text-neutral-500">
                {unreadCount} notifikasi baru
              </span>
            )}
            <Button asChild className="h-10 rounded-lg px-4 font-medium">
              <Link href="/submission/new">Buat submission baru</Link>
            </Button>
          </div>
        </header>

        {/* Perlu tindakan — hanya muncul kalau ada naskah yang harus direvisi */}
        {needsAction.length > 0 && (
          <section
            aria-labelledby="needs-action-title"
            className="rounded-xl border border-l-4 border-neutral-200 border-l-orange-500 bg-white p-5"
          >
            <h2 id="needs-action-title" className="text-sm font-semibold">
              Perlu revisi
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500">
              Perbaiki sesuai catatan redaksi, lalu kirim ulang.
            </p>
            <ul className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
              {needsAction.slice(0, 3).map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="min-w-0 truncate text-sm font-medium">
                    {s.title}
                  </span>
                  <Link
                    href={`/submission/${s.id}/edit`}
                    className="shrink-0 text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600"
                  >
                    Revisi sekarang
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Statistik: satu panel, dipisah garis tipis */}
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5">
              <dt className="text-sm text-neutral-500">{stat.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Submission terbaru */}
        <section aria-labelledby="recent-title">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="recent-title" className="text-base font-semibold">
              Submission terbaru
            </h2>
            <Link
              href="/submission"
              className="text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
            >
              Lihat semua
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-300 px-6 py-12 text-center">
              <p className="text-sm font-medium">Belum ada naskah</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-neutral-500">
                Ajukan naskah buku atau esai pertama Anda. Statusnya bisa
                dipantau di sini.
              </p>
              <Button asChild className="mt-5 h-10 rounded-lg px-4 font-medium">
                <Link href="/submission/new">Buat submission baru</Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200">
              {recent.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/submission/${s.id}`}
                    className="flex items-center gap-4 bg-white px-5 py-4 transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.title}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {s.type === "BOOK" ? "Buku" : "Esai"}
                      </p>
                    </div>
                    <time
                      dateTime={s.updatedAt}
                      className="hidden shrink-0 text-xs text-neutral-500 sm:block"
                    >
                      {formatDate(s.updatedAt)}
                    </time>
                    <StatusPill status={s.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
