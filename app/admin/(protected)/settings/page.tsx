import { connection } from "next/server";

import { SettingsForm } from "@/components/admin/settings-form";
import { getSettingsForAdmin } from "@/lib/db/queries";

export default async function AdminSettingsPage() {
  await connection();
  const settings = await getSettingsForAdmin();
  return <SettingsForm settings={settings} />;
}
