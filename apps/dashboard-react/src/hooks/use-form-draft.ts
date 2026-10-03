"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "draft:v1:";

interface Stored<T> {
  version: string;
  savedAt: number;
  values: T;
}

/**
 * Menyimpan isian form ke localStorage supaya tidak hilang saat halaman
 * dimuat ulang atau tab tertutup.
 *
 * - Pemulihan terjadi setelah mount (di useEffect), jadi tidak ada hydration mismatch.
 * - Penyimpanan di-debounce 400 ms dan di-flush saat tab disembunyikan/ditutup.
 * - `version` dipakai untuk membuang draf yang basisnya sudah berubah
 *   (mis. `updatedAt` dari server saat mengedit naskah).
 * - Form yang belum diubah tidak menulis apa pun.
 */
export function useFormDraft<T extends object>(
  key: string,
  initial: T,
  version = "0",
) {
  const storageKey = PREFIX + key;
  const initialRef = useRef(initial);
  const initialJson = useRef(JSON.stringify(initial));
  const blocked = useRef(false);

  const [values, setValues] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);

  const latest = useRef(values);
  latest.current = values;

  const write = useCallback(
    (v: T, opts: { removeWhenClean: boolean }) => {
      if (blocked.current) return;
      try {
        if (JSON.stringify(v) === initialJson.current) {
          if (opts.removeWhenClean) localStorage.removeItem(storageKey);
          return;
        }
        const payload: Stored<T> = { version, savedAt: Date.now(), values: v };
        localStorage.setItem(storageKey, JSON.stringify(payload));
      } catch {
        // storage penuh atau diblokir (mode privat): abaikan
      }
    },
    [storageKey, version],
  );

  // Pulihkan draf sekali setelah mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Stored<T>;
        if (saved?.version === version && saved.values) {
          setValues({ ...initialRef.current, ...saved.values });
          setRestored(true);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      // JSON rusak atau storage tidak tersedia
    }
    setReady(true);
  }, [storageKey, version]);

  // Simpan otomatis (debounce)
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => write(values, { removeWhenClean: true }), 400);
    return () => clearTimeout(t);
  }, [values, ready, write]);

  // Flush saat tab disembunyikan/ditutup atau komponen di-unmount.
  // Hanya menulis kalau ada perubahan, tidak pernah menghapus.
  useEffect(() => {
    const flush = () => write(latest.current, { removeWhenClean: false });
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, [write]);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  /** Panggil setelah submit sukses: hapus draf dan hentikan penyimpanan. */
  const clear = useCallback(() => {
    blocked.current = true;
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  /** Buang draf dan kembalikan form ke nilai awal. */
  const discard = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setValues(initialRef.current);
    setRestored(false);
  }, [storageKey]);

  return { values, setField, restored, ready, clear, discard };
}

/** Panggil saat logout supaya draf tidak terbawa ke akun lain di browser yang sama. */
export function clearAllFormDrafts() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
}
