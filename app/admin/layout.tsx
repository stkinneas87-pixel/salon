import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Admin | Hair & Co" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-dvh bg-[#f6f5f1] text-ink">{children}</div>;
}
