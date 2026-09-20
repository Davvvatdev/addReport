# Layouts

## RootLayout
- File: `src/app/layout.tsx`
- Description: Global RTL Persian document shell using Vazirmatn, PWA manifest metadata, and the invisible `SyncManager`.

```tsx
import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import SyncManager from "@/components/SyncManager";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "دیده‌بان حمل‌ونقل تهران",
  description: "سامانه ثبت تجربه مسافران حمل‌ونقل عمومی تهران",
  manifest: "/manifest.json",
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
      </body>
    </html>
  );
}
```

## Page Shell Pattern
- Current pages are self-contained. Most mobile pages use:
- Sticky top header with back button on the right, title, optional action on left.
- Main content constrained to `max-w-md` or `max-w-lg` for public/mobile views.
- Admin/dashboard uses full-width table surface.

