import Link from 'next/link';
import { BarChart3, ChevronLeft, CloudOff, Database, FileText, Map } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { toFa } from '@/lib/format';
import { Notice, StatCard } from '@/components/ui';
import CitizenHomeBanner from '@/components/CitizenHomeBanner';
import TopGreetingHeader from '@/components/TopGreetingHeader';

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
    <main className="app-bg min-h-screen px-4 py-3 pb-24">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <header className="space-y-3">
          {/* تب‌بار بالای اپلیکیشن: تبریک بر اساس زمان + کپسول تهران + لوگوی رسمی بدون فریم */}
          <TopGreetingHeader />

          {/* بنر باشگاه شهروندی و سکه‌های پاداش */}
          <CitizenHomeBanner />
        </header>

        <div className="grid grid-cols-2 gap-3">
          <StatCard label="گزارش‌های امروز" value={toFa(reportsToday)} icon={BarChart3} tone="blue" />
          <StatCard label="کل داده‌های عمومی" value={toFa(totalReports)} icon={Database} tone="teal" />
        </div>

        {sensitiveToday > 0 && (
          <Notice tone="danger" title={`${toFa(sensitiveToday)} گزارش امنیتی امروز`}>
            <p className="text-xs">این موارد جهت حفظ حریم مسافران فقط به شکل تجمیعی دیده می‌شوند.</p>
          </Notice>
        )}

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-900 text-sm">شفافیت عمومی</h2>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200/50">
              بدون نیاز به ورود
            </span>
          </div>
          <div className="grid gap-2.5">
            <HomeLink href="/public/list" icon={FileText} title="آخرین گزارش‌ها" desc="فیلتر بر اساس خط، ایستگاه، دسته و زمان" />
            <HomeLink href="/public/map" icon={Map} title="نقشه وضعیت" desc="نمای مکانی گزارش‌های غیرحساس و خوشه‌های ایستگاهی" />
            <HomeLink href="/public/stats" icon={BarChart3} title="آمار و داده باز" desc="نمودارها، ایستگاه‌های پرتکرار و خروجی CSV/JSON" />
          </div>
        </section>

        <Notice tone="warning" icon={CloudOff}>
          <p className="text-xs">
            گزارش‌ها ابتدا روی همین گوشی ذخیره می‌شوند؛ اگر در ایستگاه زیرزمینی اینترنت قطع باشد، پس از اتصال خودکار ارسال خواهند شد.
          </p>
        </Notice>

        <footer className="flex items-center justify-center gap-4 pt-1 text-xs font-medium text-slate-400">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-600">حریم خصوصی</Link>
          <span>·</span>
          <Link href="/feedback" className="underline underline-offset-4 hover:text-slate-600">ارزیابی SUS</Link>
        </footer>
      </div>
    </main>
  );
}

function HomeLink({ href, icon: Icon, title, desc }: { href: string; icon: typeof FileText; title: string; desc: string }) {
  return (
    <Link href={href} className="tap flex min-h-[72px] items-center gap-3 pressable rounded-2xl border border-slate-200 bg-white p-4 hover:border-slate-300">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold text-slate-900 text-sm">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{desc}</span>
      </span>
      <ChevronLeft size={18} className="text-slate-500" />
    </Link>
  );
}
