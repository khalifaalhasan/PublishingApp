"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@repo/ui";
import { AuthBrand, ErrorBanner, PasswordField } from "./auth-shared";
import { authClient } from "@/lib/auth-cleint";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message || "Email atau kata sandi salah.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <AuthBrand />

      <Card className="w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="space-y-2 px-6 pb-2 pt-8 text-center sm:px-10">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Masuk
          </CardTitle>
          <CardDescription className="text-sm">
            Silakan masuk menggunakan email Anda
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 pt-6 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <ErrorBanner message={errorMsg} />

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                required
                className="h-11 px-3.5"
              />
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Kata Sandi"
              labelAction={
                <Link
                  href="#"
                  className="text-xs font-medium text-primary transition-colors hover:underline"
                >
                  Lupa sandi?
                </Link>
              }
            />

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full font-semibold shadow-sm"
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <span>Belum punya akun?</span>
            <Link
              href="/register"
              className="font-semibold text-primary transition-colors hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
