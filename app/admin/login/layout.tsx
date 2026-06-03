import { Hanken_Grotesk, Inter } from "next/font/google";

const adminDisplay = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-admin-display",
});

const adminBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-admin-body",
});

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${adminDisplay.variable} ${adminBody.variable} admin-login-page flex min-h-screen w-full font-[family-name:var(--font-admin-body)] text-[#141d23]`}
    >
      {children}
    </div>
  );
}
