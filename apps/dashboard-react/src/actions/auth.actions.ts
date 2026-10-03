"use server";

import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const APP_ORIGIN = process.env.APP_ORIGIN ?? "http://localhost:3000";

async function forwardSetCookies(res: Response) {
  const cookieStore = await cookies();

  for (const raw of res.headers.getSetCookie()) {
    const [pair, ...attrs] = raw.split(";").map((s) => s.trim());
    const i = pair.indexOf("=");
    if (i === -1) continue;

    const name = pair.slice(0, i);
    const value = decodeURIComponent(pair.slice(i + 1)); // Next meng-encode lagi saat set

    const maxAgeAttr = attrs.find((a) =>
      a.toLowerCase().startsWith("max-age="),
    );
    const maxAge = maxAgeAttr ? Number(maxAgeAttr.split("=")[1]) : undefined;

    cookieStore.set(name, value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(maxAge && !Number.isNaN(maxAge) ? { maxAge } : {}),
    });
  }
}

export async function loginAction(formData: FormData) {
  console.log(
    "[login] status:",
    res.status,
    "| set-cookie:",
    res.headers.getSetCookie(),
  );
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    const res = await fetch(`${API_BASE_URL}/auth/sign-in/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: APP_ORIGIN },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return { error: errorData?.message || "Email atau kata sandi salah." };
    }

    await forwardSetCookies(res);
    return { success: true };
  } catch (error) {
    console.error("Login action error:", error);
    return { error: "Terjadi kesalahan sistem. Coba lagi nanti." };
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        error:
          errorData?.message ||
          "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
      };
    }

    // Ambil session cookie jika backend langsung me-login-kan setelah register
    const cookieStore = await cookies();

    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const i = pair.indexOf("=");
      if (i === -1) continue;

      const name = pair.slice(0, i).trim();
      const value = decodeURIComponent(pair.slice(i + 1));

      cookieStore.set(name, value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Register action error:", error);
    if (error instanceof Error) {
      console.error("[register] message:", error.message);
      console.error("[register] stack:", error.stack);
    }
    return { error: "Terjadi kesalahan sistem. Coba lagi nanti." };
  }
}
