import Link from 'next/link';
import { AlertCircle, Map, BarChart3, PlusCircle } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function Home() {
  // گرفتن آمار ساده
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reportsToday = await prisma.report.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-2">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            دیده‌بان حمل‌ونقل تهران
          </h1>
          <p className="text-slate-500 text-sm">
            ثبت سریع مشکلات مترو و اتوبوس‌های تهران
          </p>
        </div>

        <div className="py-8">
          <Link
            href="/report"
            className="flex flex-col items-center justify-center w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-3xl py-12 px-4 shadow-lg shadow-blue-600/30 transition-all"
          >
            <PlusCircle size={48} className="mb-4 opacity-90" />
            <span className="text-2xl font-bold">ثبت گزارش جدید</span>
            <span className="mt-2 text-blue-100 text-sm">کمتر از ۳۰ ثانیه، بدون نیاز به تایپ</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center text-slate-600">
            <BarChart3 size={20} className="ml-2 text-indigo-500" />
            <span className="text-sm font-medium">گزارش‌های امروز:</span>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {reportsToday}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <Link
            href="/public/list"
            className="flex items-center justify-center gap-2 bg-white text-slate-700 p-4 rounded-xl shadow-sm border border-slate-100 active:bg-slate-50"
          >
            <AlertCircle size={18} />
            <span className="font-medium text-sm">آخرین گزارش‌ها</span>
          </Link>
          <Link
            href="/public/map"
            className="flex items-center justify-center gap-2 bg-white text-slate-700 p-4 rounded-xl shadow-sm border border-slate-100 active:bg-slate-50"
          >
            <Map size={18} />
            <span className="font-medium text-sm">نقشه وضعیت</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
