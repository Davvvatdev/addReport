import Link from 'next/link';
import { AlertCircle, BarChart3, ChevronLeft, CloudOff, Database, FileText, Map, PlusCircle, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { toFa } from '@/lib/format';
import { StatCard, Surface } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [reportsToday, totalReports, sensitiveToday] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: today } } }),
    prisma.report.count(),
    prisma.report.count({ where: { createdAt: { gte: today }, subcategory: { isSensitive: true } } }),
  ]);

  return (
    <main className="app-bg min-h-screen px-4 py-5">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <header className="pt-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-normal text-slate-950">دیده‌بان حمل‌ونقل تهران</h1>
                <p className="mt-1 text-sm font-medium text-slate-600">ثبت سریع تجربه‌های مترو، اتوبوس و BRT</p>
              </div>
            </div>
          </div>
          <Surface className="overflow-hidden border-blue-100 bg-blue-600 text-white shadow-xl shadow-blue-600/20">
            <Link href="/report" className="block p-5 active:bg-blue-700">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-blue-100">مسافر عجله دارد؛ فرم نباید داشته باشد.</p>
                  <p className="mt-2 text-3xl font-black">ثبت گزارش</p>
                  <p className="mt-2 text-sm font-medium text-blue-50">زیر ۳۰ ثانیه، بدون تایپ، حتی با اینترنت ضعیف</p>
                </div>
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <PlusCircle size={34} />
                </span>
              </div>
            </Link>
          </Surface>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="گزارش امروز" value={toFa(reportsToday)} icon={BarChart3} />
          <StatCard label="کل داده عمومی" value={toFa(totalReports)} icon={Database} tone="teal" />
        </div>

        {sensitiveToday > 0 && (
          <Surface className="border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-rose-700"><AlertCircle size={20} /></span>
              <div>
                <p className="font-extrabold text-rose-950">{toFa(sensitiveToday)} گزارش امنیتی امروز</p>
                <p className="mt-1 text-sm leading-6 text-rose-900">این موارد فقط به شکل تجمیعی در لایه عمومی دیده می‌شوند.</p>
              </div>
            </div>
          </Surface>
        )}

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-slate-950">شفافیت عمومی</h2>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">بدون ورود</span>
          </div>
          <div className="grid gap-2">
            <HomeLink href="/public/list" icon={FileText} title="آخرین گزارش‌ها" desc="فیلتر بر اساس خط، ایستگاه، دسته و زمان" />
            <HomeLink href="/public/map" icon={Map} title="نقشه وضعیت" desc="نمای مکانی گزارش‌های غیرحساس و خوشه‌های ایستگاهی" />
            <HomeLink href="/public/stats" icon={BarChart3} title="آمار و داده باز" desc="نمودارها، ایستگاه‌های پرتکرار و خروجی CSV/JSON" />
          </div>
        </section>

        <Surface className="p-4">
          <div className="flex items-start gap-3">
            <CloudOff size={21} className="mt-1 shrink-0 text-amber-700" />
            <p className="text-sm font-medium leading-7 text-slate-700">
              گزارش ابتدا روی همین گوشی ذخیره می‌شود؛ اگر آفلاین باشید، بعد از اتصال خودکار ارسال خواهد شد.
            </p>
          </div>
        </Surface>

        <footer className="flex items-center justify-center gap-4 pb-4 pt-2 text-sm font-medium text-slate-500">
          <Link href="/privacy" className="underline underline-offset-4">حریم خصوصی</Link>
          <Link href="/feedback" className="underline underline-offset-4">ارزیابی SUS</Link>
        </footer>
      </div>
    </main>
  );
}

function HomeLink({ href, icon: Icon, title, desc }: { href: string; icon: typeof FileText; title: string; desc: string }) {
  return (
    <Link href={href} className="tap flex items-center gap-3 rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm shadow-slate-200/40 active:bg-slate-50">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800"><Icon size={21} /></span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-slate-950">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{desc}</span>
      </span>
      <ChevronLeft size={18} className="text-slate-400" />
    </Link>
  );
}
