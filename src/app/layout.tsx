import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import SyncManager from "@/components/SyncManager";
import BottomNav from "@/components/BottomNav";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "دیده‌بان حمل‌ونقل تهران",
  description: "سامانه ثبت تجربه مسافران حمل‌ونقل عمومی تهران",
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/logo.png",
    apple: "/assets/logo.png",
  },
};

export const viewport: Viewport = { themeColor: "#2563eb" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-slate-900">
        {children}
        <SyncManager />
        <BottomNav />
      </body>
    </html>
  );
}
