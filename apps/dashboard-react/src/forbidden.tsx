import Link from "next/link";
import { Button } from "@repo/ui";

export default function Forbidden() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 text-center">
      <h1 className="text-9xl font-black text-neutral-200">403</h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        Akses Ditolak
      </h2>
      <p className="mt-4 max-w-md text-neutral-500">
        Maaf, Anda tidak memiliki izin (role/akses) untuk melihat halaman atau
        naskah ini.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Button asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
