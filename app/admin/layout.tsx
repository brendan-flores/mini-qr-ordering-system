import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { canServeAdminRoutes } from "@/lib/shared/config/app-hosts";

export const metadata: Metadata = {
  title: "BrenCravings Admin Page",
  description: "Admin dashboard for BrenCravings QR ordering",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const host = (await headers()).get("host")?.toLowerCase() ?? "";
  if (!canServeAdminRoutes(host)) {
    notFound();
  }

  return children;
}
