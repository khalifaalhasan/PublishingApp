import Link from "next/link";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@repo/ui";

export default function DashboardPage() {
  type StatusKey =
    | "DRAFT"
    | "AWAITING_REVIEW"
    | "IN_REVIEW"
    | "APPROVED"
    | "ACTION_REQUIRED"
    | "REJECTED";

  type Submission = {
    id: string;
    title: string;
    type: string;
    status: StatusKey;
    updatedAt: string;
  };

  const stats = [
    {
      label: "Total Submission",
      value: 4,
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Menunggu Review",
      value: 1,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      label: "Perlu Revisi",
      value: 1,
      icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z",
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      label: "Disetujui",
      value: 1,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ];

  const recentSubmissions: Submission[] = [
    {
      id: "1",
      title: "Rindu yang Tertinggal di Pantai Selatan",
      type: "Buku",
      status: "IN_REVIEW",
      updatedAt: "2 hari lalu",
    },
    {
      id: "2",
      title: "Esai tentang Keberagaman Budaya Nusantara",
      type: "Esai",
      status: "ACTION_REQUIRED",
      updatedAt: "5 hari lalu",
    },
    {
      id: "3",
      title: "Perjalanan Panjang Menuju Cahaya",
      type: "Buku",
      status: "DRAFT",
      updatedAt: "1 minggu lalu",
    },
    {
      id: "4",
      title: "Refleksi Sastra Modern Indonesia",
      type: "Esai",
      status: "APPROVED",
      updatedAt: "2 minggu lalu",
    },
  ];

  const statusConfig: Record<
    StatusKey,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
    }
  > = {
    DRAFT: { label: "Draf", variant: "secondary" },
    AWAITING_REVIEW: { label: "Menunggu Review", variant: "outline" },
    IN_REVIEW: { label: "Sedang Direview", variant: "default" },
    APPROVED: { label: "Disetujui", variant: "default" },
    ACTION_REQUIRED: { label: "Perlu Revisi", variant: "destructive" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-6 md:p-8 text-primary-foreground">
        <div className="relative z-10">
          <p className="text-sm font-medium opacity-80 mb-1">
            Selamat datang kembali 👋
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Hai, Penulis!</h1>
          <p className="text-sm opacity-75 max-w-md mb-4">
            Sampaikan cerita Anda kepada dunia. Ajukan naskah buku atau esai
            Anda melalui portal ini.
          </p>
          <Button
            variant="secondary"
            className="rounded-full font-semibold shadow-lg"
          >
            <Link href="/submission/new">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-4 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Buat Submission Baru
            </Link>
          </Button>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5"></div>
        <div className="absolute -bottom-6 -right-4 w-28 h-28 rounded-full bg-white/5"></div>
        <div className="absolute top-4 right-32 w-16 h-16 rounded-full bg-white/5"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`size-5 ${stat.color}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={stat.icon}
                    />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Submissions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Submission Terbaru</CardTitle>
              <CardDescription>Aktivitas naskah Anda terakhir</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
            >
              <Link href="/submission">Lihat Semua</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentSubmissions.map((submission) => {
              const config = statusConfig[submission.status];

              return (
                <Link
                  key={submission.id}
                  href={`/submission/${submission.id}`}
                  className="flex items-center gap-3 px-4 md:px-6 py-3.5 hover:bg-muted/40 transition-colors group"
                >
                  {/* Type Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    {submission.type === "Buku" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {submission.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.type} · {submission.updatedAt}
                    </p>
                  </div>
                  <Badge
                    variant={config.variant}
                    className="shrink-0 rounded-full text-xs"
                  >
                    {config.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
