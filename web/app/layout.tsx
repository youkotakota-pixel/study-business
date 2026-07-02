import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { MobileShell } from "@/components/mobile-shell";

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
  title: {
    default: "金具学習 | study-business",
    template: "%s | study-business",
  },
  description: "機構部品（金具）を毎日少しずつ学ぶモバイル向けリーダー",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "金具学習",
  },
  manifest: "/manifest.json",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f8f6f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground antialiased">
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
