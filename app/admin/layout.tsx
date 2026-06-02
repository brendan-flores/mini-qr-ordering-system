import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Orders — BrenCravings Admin",
  description: "Admin dashboard for BrenCravings QR ordering",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
