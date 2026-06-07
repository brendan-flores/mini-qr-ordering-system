import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BRAND_LOGO_PATH } from "@/lib/shared/products/brand";
import { CartRoot } from "../components/cart/CartRoot";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrenCravings",
  description: "Mini QR ordering system",
  icons: {
    icon: [
      { url: BRAND_LOGO_PATH, sizes: "512x512", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: BRAND_LOGO_PATH,
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href={BRAND_LOGO_PATH} type="image/png" sizes="512x512" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)]">
        <CartRoot>{children}</CartRoot>
      </body>
    </html>
  );
}
