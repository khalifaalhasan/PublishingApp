// Tanpa hooks, aman dipakai di Server Component.
// Class warna ditulis utuh supaya terbaca oleh Tailwind.
const STATUS: Record<string, { label: string; dot: string }> = {
  DRAFT: { label: "Draf", dot: "bg-neutral-400" },
  AWAITING_REVIEW: { label: "Menunggu review", dot: "bg-amber-500" },
  IN_REVIEW: { label: "Sedang direview", dot: "bg-blue-500" },
  ACTION_REQUIRED: { label: "Perlu revisi", dot: "bg-orange-500" },
  RESUBMITTED: { label: "Dikirim ulang", dot: "bg-violet-500" },
  APPROVED: { label: "Disetujui", dot: "bg-emerald-500" },
  REJECTED: { label: "Ditolak", dot: "bg-red-500" },
};

export function statusLabel(status: string) {
  return STATUS[status]?.label ?? status;
}

export function StatusPill({ status }: { status: string }) {
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
