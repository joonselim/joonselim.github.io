// src/app/layout.tsx
import type { Metadata } from "next";
import { VT323, Inter } from "next/font/google";
import "./globals.css";

// 픽셀 폰트 (제목용)
const pixelFont = VT323({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });
// 일반 폰트 (본문용 - 픽셀 폰트만 쓰면 눈이 아플 수 있으니 섞어 써)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Joon's Portfolio | PM & Analyst",
  description: "Interactive Resume and Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} ${inter.variable} bg-zinc-900 text-zinc-300 font-sans`}>
        {children}
      </body>
    </html>
  );
}