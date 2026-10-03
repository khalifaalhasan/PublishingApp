"use client";

import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/types/api";
import { Sidebar } from "./sidebar";

export function AppShell({ user }: { user: User | null; children: ReactNode }) {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  // Drawer dianggap terbuka hanya untuk halaman tempat ia dibuka,
  // jadi berpindah halaman otomatis menutupnya tanpa effect tambahan.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = isMobile && openedAt === pathname;

  const openMenu = () => setOpenedAt(pathname);
  const close = useCallback(() => setOpenedAt(null), []);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Tombol Escape menutup drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedAt(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Setelah drawer ditutup, kembalikan fokus ke tombol hamburger
  useEffect(() => {
    if (!open && wasOpen.current) menuButtonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="flex h-dvh overflow-hidden bg-white">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <Sidebar user={user} open={open} isMobile={isMobile} onClose={close} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar hanya di mobile */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-white px-4 md:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={openMenu}
            aria-label="Buka menu"
            aria-expanded={open}
            aria-controls="app-sidebar"
            className="-ml-2 flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
          </button>
          <span className="text-sm font-semibold tracking-tight">
            Penerbit Nusantara
          </span>
        </header>

        {/* Area scroll. Bar aksi form (sticky bottom-0) menempel di sini. */}
        <main className="min-w-0 flex-1 overflow-y-auto"></main>
      </div>
    </div>
  );
}
