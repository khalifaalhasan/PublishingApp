import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Penulis",
  description: "Portal Penulis Penerbit Nusantara",
};

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
