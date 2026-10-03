import DashboardPageView from "@/components/dashboard/dashboard-page";
import { getMe } from "@/services/auth.service";
import { getSubmissions } from "@/services/submission.service";
import { getNotifications } from "@/services/notification.service";
import type {
  Notification,
  PaginatedResponse,
  Submission,
  User,
} from "@/types/api";

export default async function DashboardRoot() {
  let user: User | null = null;
  let submissions: PaginatedResponse<Submission> | null = null;
  let notifications: Notification[] = [];

  try {
    // Jalankan fetch secara paralel agar lebih cepat
    const [userData, submissionsData, notificationsData] = await Promise.all([
      getMe().catch(() => null), // Jika gagal (misal tidak login), biarkan null
      getSubmissions({ limit: 10 }).catch(() => null),
      getNotifications().catch(() => [] as Notification[]),
    ]);

    user = userData;
    submissions = submissionsData;
    notifications = notificationsData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  }

  return (
    <DashboardPageView
      user={user}
      submissions={submissions}
      notifications={notifications}
    />
  );
}
