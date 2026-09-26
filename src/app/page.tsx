import Link from 'next/link';
import { BarChart3, ChevronLeft, CloudOff, FileText, Map, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { timeAgoFa, toFa } from '@/lib/format';
import { Notice } from '@/components/ui';
import CitizenHomeBanner from '@/components/CitizenHomeBanner';
import TopGreetingHeader from '@/components/TopGreetingHeader';

export const dynamic = 'force-dynamic';

const FALLBACK_LINE_COLORS = ['#e11d48', '#1d4ed8', '#16a34a', '#eab308', '#7c3aed'];

const SEVERITY: Record<string, { label: string; cls: string }> = {
  low: { label: 'کم', cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
  medium: { label: 'متوسط', cls: 'bg-amber-50 text-amber-800 ring-amber-200' },
  high: { label: 'زیاد', cls: 'bg-rose-50 text-rose-800 ring-rose-200' },
};

export default async function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [reportsToday, totalReports, resolvedReports, sensitiveToday, latest, metroLines] = await Promise.all([
    prisma.report.count({ where: { createdAt: { gte: today } } }),
    prisma.report.count(),
    prisma.report.count({ where: { status: 'resolved' } }),
    prisma.report.count({ where: { createdAt: { gte: today }, subcategory: { isSensitive: true } } }),
    prisma.report.findMany({
      where: { subcategory: { isSensitive: false } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { subcategory: true, station: true, line: true },
    }),
    prisma.line.findMany({ where: { mode: 'metro', color: { not: null } }, select: { color: true }, take: 5 }),
  ]);

  const lineColors = metroLines.map((l) => l.color as string);
  const routeColors = FALLBACK_LINE_COLORS.map((c, i) => lineColors[i] ?? c);

  return (
    <main className="app-bg min-h-screen px-4 py-3 pb-28">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        <TopGreetingHeader />

        {/* هیرو: اقدام اصلی + وضعیت زنده */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-3xl bg-[#0b1530] p-5 text-white">
          <MetroMotif colors={routeColors} />

          <p className="relative flex items-center gap-2 text-xs font-bold text-sky-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            دیده‌بان حمل‌ونقل عمومی تهران
          </p>
          <h1 id="hero-title" className="relative mt-3 text-[1.6rem] font-black leading-[1.45]">
            امروز در مسیر،
            <br />
            چه چیزی درست کار نمی‌کرد؟
          </h1>
          <p className="relative mt-2 text-sm leading-7 text-slate-300">
            کمتر از ۳۰ ثانیه، بدون نام — حتی وقتی اینترنت ندارید.
          </p>

          <Link
            href="/report"
            className="btn pressable relative mt-5 min-h-14 w-full bg-white text-base font-black text-blue-700 [--edge:#60a5fa] hover:bg-blue-50"
          >
            <Plus size={22} strokeWidth={2.8} aria-hidden />
            ثبت گزارش جدید
          </Link>

          <dl className="relative mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.06] py-3 text-center ring-1 ring-white/10">
            <HeroStat label="امروز" value={reportsToday} />
            <HeroStat label="کل گزارش‌ها" value={totalReports} />
            <HeroStat label="رفع‌شده" value={resolvedReports} />
          </dl>
        </section>

        <CitizenHomeBanner />

        {sensitiveToday > 0 && (
          <Notice tone="danger" title={`${toFa(sensitiveToday)} گزارش امنیتی امروز`}>
            <p className="text-xs">این موارد جهت حفظ حریم مسافران فقط به شکل تجمیعی دیده می‌شوند.</p>
          </Notice>
        )}

        {/* تازه‌ترین گزارش‌های عمومی */}
        <section aria-labelledby="latest-title" className="space-y-2.5">
          <SectionHeader id="latest-title" title="تازه‌ترین گزارش‌ها" href="/public/list" linkLabel="همه گزارش‌ها" />
          {latest.length > 0 ? (
            <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {latest.map((r) => (
                <li key={r.id} className="flex items-stretch gap-3 p-3.5">
                  <span
                    aria-hidden
                    className="w-1 shrink-0 rounded-full"
                    style={{ background: r.line?.color ?? '#cbd5e1' }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-extrabold text-slate-900">{r.subcategory.titleFa}</p>
                      {SEVERITY[r.severity] && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${SEVERITY[r.severity].cls}`}>
                          {SEVERITY[r.severity].label}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="truncate font-bold text-slate-600">{r.station?.name ?? 'ایستگاه نامشخص'}</span>
                      {r.line && <span className="shrink-0">· {r.line.name}</span>}
                      <span className="shrink-0">· {timeAgoFa(r.createdAt)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
              <p className="text-sm font-extrabold text-slate-700">هنوز گزارش عمومی‌ای ثبت نشده</p>
              <p className="mt-1 text-xs text-slate-500">اولین نفری باشید که وضعیت مسیر را گزارش می‌کند.</p>
            </div>
          )}
        </section>

        {/* ابزارهای شفافیت عمومی */}
        <section aria-labelledby="tools-title" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 id="tools-title" className="text-base font-black text-slate-900">شفافیت عمومی</h2>
            <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 ring-1 ring-teal-200">
              بدون نیاز به ورود
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <ToolTile href="/public/list" icon={FileText} title="فهرست" desc="فیلتر خط و ایستگاه" tone="bg-blue-50 text-blue-700" />
            <ToolTile href="/public/map" icon={Map} title="نقشه" desc="خوشه‌های ایستگاهی" tone="bg-violet-50 text-violet-700" />
            <ToolTile href="/public/stats" icon={BarChart3} title="داده باز" desc="نمودار، CSV، JSON" tone="bg-teal-50 text-teal-700" />
          </div>
        </section>

        <Notice tone="warning" icon={CloudOff}>
          <p className="text-xs">
            گزارش‌ها ابتدا روی همین گوشی ذخیره می‌شوند؛ اگر در ایستگاه زیرزمینی اینترنت قطع باشد، پس از اتصال خودکار ارسال خواهند شد.
          </p>
        </Notice>

        <footer className="flex items-center justify-center gap-4 pt-1 text-xs font-medium text-slate-500">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-700">حریم خصوصی</Link>
          <span aria-hidden>·</span>
          <Link href="/feedback" className="underline underline-offset-4 hover:text-slate-700">ارزیابی SUS</Link>
        </footer>
      </div>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-2">
      <dt className="text-[11px] font-medium text-slate-300">{label}</dt>
      <dd className="mt-0.5 text-xl font-black tabular-nums">{value.toLocaleString('fa-IR')}</dd>
    </div>
  );
}

function SectionHeader({ id, title, href, linkLabel }: { id: string; title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-base font-black text-slate-900">{title}</h2>
      <Link href={href} className="flex min-h-8 items-center gap-0.5 text-xs font-bold text-blue-700 underline-offset-4 hover:underline">
        {linkLabel}
        <ChevronLeft size={15} aria-hidden />
      </Link>
    </div>
  );
}

function ToolTile({ href, icon: Icon, title, desc, tone }: { href: string; icon: typeof FileText; title: string; desc: string; tone: string }) {
  return (
    <Link href={href} className="pressable flex flex-col items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 hover:border-slate-300">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-extrabold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{desc}</span>
      </span>
    </Link>
  );
}

/** نقش تزئینی مسیرهای مترو با رنگ واقعی خطوط */
function MetroMotif({ colors }: { colors: string[] }) {
  const routes = [
    'M-10 30 H70 Q90 30 100 45 L130 90 Q140 105 160 105 H240',
    'M40 -10 V40 Q40 60 60 70 L150 115 Q165 122 165 140 V180',
    'M-10 120 H40 Q60 120 75 105 L130 50 Q145 35 165 35 H240',
    'M110 -10 V20 Q110 40 125 55 L200 130',
    'M-10 75 H240',
  ];
  const stations: [number, number][] = [[40, 30], [100, 45], [130, 90], [60, 70], [75, 105], [165, 35], [125, 55], [165, 105]];
  return (
    <svg
      aria-hidden
      viewBox="0 0 230 170"
      className="pointer-events-none absolute -left-10 -top-6 h-44 w-60 opacity-[0.28]"
      fill="none"
    >
      {routes.map((d, i) => (
        <path key={d} d={d} stroke={colors[i % colors.length]} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {stations.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#0b1530" stroke="#fff" strokeWidth="2.5" />
      ))}
    </svg>
  );
}
