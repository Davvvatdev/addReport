import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { BarChart3, Clock3, Download, FileJson, Table, TrendingUp } from 'lucide-react';
import StatsChart from './StatsChart';
import { AppHeader, StatCard, Surface } from '@/components/ui';
import { toFa } from '@/lib/format';

const prisma = new PrismaClient();
export const revalidate = 60; // 1 min

export default async function StatsPage() {
  // Aggregate stats
  const totalReports = await prisma.report.count();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayReports = await prisma.report.count({
    where: { createdAt: { gte: today } }
  });

  // Group by category
  const categories = await prisma.category.findMany();
  const categoryStats = await Promise.all(
    categories.map(async (cat) => {
      const count = await prisma.report.count({ where: { categoryId: cat.id } });
      return { name: cat.titleFa.split(' ')[1] || cat.titleFa, count };
    })
  );

  const topStations = await prisma.report.groupBy({
    by: ['stationId'],
    _count: { _all: true },
    orderBy: { _count: { stationId: 'desc' } },
    take: 5,
  });
  const stationNames = new Map(
    (await prisma.station.findMany({
      where: { id: { in: topStations.map((s) => s.stationId).filter(Boolean) as string[] } },
      select: { id: true, name: true },
    })).map((s) => [s.id, s.name]),
  );

  return (
    <div className="app-bg flex min-h-screen flex-col">
      <AppHeader title="آمار و داده‌های باز" eyebrow="قابل استناد برای مطالبه‌گری" icon={BarChart3} backHref="/public/list" />

      <main className="mx-auto w-full max-w-5xl space-y-5 p-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="کل گزارش‌ها" value={toFa(totalReports)} icon={BarChart3} />
          <StatCard label="امروز" value={toFa(todayReports)} icon={Clock3} tone="teal" />
          <StatCard label="دسته فعال" value={toFa(categoryStats.filter((c) => c.count > 0).length)} icon={TrendingUp} tone="amber" />
          <StatCard label="خروجی عمومی" value="CSV/JSON" icon={Download} tone="slate" />
        </div>

        <Surface className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-950">توزیع گزارش‌ها بر اساس دسته‌بندی</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">زنده</span>
          </div>
          <StatsChart data={categoryStats} />
        </Surface>

        <div className="grid gap-4 md:grid-cols-[1fr_1.1fr]">
          <Surface className="p-4">
            <h2 className="mb-3 font-extrabold text-slate-950">ایستگاه‌های پرتکرار</h2>
            <ol className="space-y-2">
              {topStations.map((s, index) => (
                <li key={s.stationId ?? 'none'} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="font-bold text-slate-800">{toFa(index + 1)}. {s.stationId ? stationNames.get(s.stationId) : 'نامشخص'}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-extrabold text-slate-600">{toFa(s._count._all)}</span>
                </li>
              ))}
            </ol>
          </Surface>

          <Surface className="p-4">
            <h2 className="font-extrabold text-slate-950">دریافت داده‌های خام</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              گزارش‌ها بدون اطلاعات هویتی منتشر می‌شوند. مختصات دقیق موارد حساس در خروجی عمومی حذف شده است.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link 
              href="/api/export?format=csv"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white active:bg-slate-800"
            >
              <Table size={18} />
              دانلود CSV
            </Link>
            <Link 
              href="/api/export?format=json"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 font-bold text-slate-800 active:bg-slate-50"
            >
              <FileJson size={18} />
              دانلود JSON
            </Link>
            </div>
          </Surface>
          </div>
      </main>
    </div>
  );
}
