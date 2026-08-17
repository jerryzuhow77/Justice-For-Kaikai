import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "剴剴案特別專題｜沒有父母的孤兒",
  description: "從一張舊竹椅，到一扇沒有及時打開的門。觀察式紀錄片、文學化轉場、司法檔案查證與互動長卷。",
  keywords: ["剴剴案", "兒童保護", "調查報導", "Justice For Kaikai"],
  openGraph: {
    title: "剴剴案特別專題｜沒有父母的孤兒",
    description: "記住他，不只是記住一場悲劇。",
    images: ["/media/hero-impression.jpg"],
    type: "article",
  },
  other: {
    "codex-preview": "development",
    "content-status": "fact-checked-through-2026-08-16",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
