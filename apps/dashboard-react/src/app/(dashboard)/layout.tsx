// SERVER COMPONENT — fetch user di sini, jangan tambah "use client"
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { getMe } from "@/services/auth.service";

export const metadata: Metadata = {
  title: "Portal Penulis — Dashboard",
  description: "Portal Penulis Penerbit Nusantara",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user dari server — cookie session diforward otomatis oleh api-client
  // Jika gagal (mis. belum login / backend mati), user = null — sidebar tetap tampil
  let user = null;
  try {
    user = await getMe();
  } catch {
    // Biarkan null — redirect auth ditangani middleware atau page masing-masing
  }

  return (
    <div className="flex h-full">
      {/* Sidebar menerima user sebagai prop (Client Component) */}
      <Sidebar user={user} />
      <main className="flex flex-1 flex-col overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
