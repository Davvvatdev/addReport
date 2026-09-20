import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "دیده‌بان حمل‌ونقل تهران",
  description: "سامانه ثبت تجربه مسافران حمل‌ونقل عمومی تهران",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-slate-900 pb-20">{children}</body>
    </html>
  );
}
