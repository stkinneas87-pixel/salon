import { connection } from "next/server";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/session";

export const instant = false;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const session = await requireAdminPage();

  return <AdminShell username={session.username}>{children}</AdminShell>;
}
