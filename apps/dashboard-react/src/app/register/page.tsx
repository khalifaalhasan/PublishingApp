import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar — Portal Penulis",
  description: "Buat akun baru di Portal Penulis Penerbit Nusantara",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
