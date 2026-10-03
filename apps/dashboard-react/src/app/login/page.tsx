import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Login — Portal Penulis",
  description: "Masuk ke Portal Penulis Penerbit Nusantara",
};

export default function LoginPage() {
  return <LoginForm />;
}
