import Link from 'next/link';
import type { Metadata } from 'next';
import { Camera, FileText, Filter } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { formatJalali, toFa } from '@/lib/format';
import { AppHeader, Notice, Surface } from '@/components/ui';

export const metadata: Metadata = { title: 'گزارش‌های عمومی | دیده‌بان حمل‌ونقل تهران' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 30;
const RANGES = [
  { v: '1', label: 'امروز' },
  { v: '7', label: '۷ روز' },
  { v: '30', label: '۳۰ روز' },
  { v: '', label: 'همه' },
];
const SEVERITY: Record<string, { label: string; cls: string }> = {
  low: { label: 'کم', cls: 'bg-emerald-100 text-emerald-800' },
  medium: { label: 'متوسط', cls: 'bg-amber-100 text-amber-800' },
  high: { label: 'زیاد', cls: 'bg-red-100 text-red-800' },
};
const STATUS: Record<string, string> = {
  submitted: 'ثبت‌شده', under_review: 'در حال بررسی', acknowledged: 'تأییدشده', resolved: 'رفع‌شده',
};

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function PublicList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const category = one(sp.category);
  const station = one(sp.station);
  const line = one(sp.line);
  const days = one(sp.days) ?? '';
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const where: Prisma.ReportWhereInput = {
    ...(category && { categoryId: category }),
    ...(station && { stationId: station }),
    ...(line && { lineId: line }),
    ...(days && { createdAt: { gte: daysAgo(Number(days)) } }),
  };

  const [categories, stations, lines, items, total, sensitiveGroups] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.station.findMany({ orderBy: { name: 'asc' } }),
    prisma.line.findMany({ orderBy: { name: 'asc' } }),
    // گزارش‌های حساس هرگز به‌صورت موردی نمایش داده نمی‌شوند
    prisma.report.findMany({
      where: { ...where, subcategory: { isSensitive: false } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { subcategory: true, station: true, line: true },
    }),
    prisma.report.count({ where: { ...where, subcategory: { isSensitive: false } } }),
    prisma.report.groupBy({
      by: ['stationId'],
      where: { ...where, subcategory: { isSensitive: true } },
      _count: { _all: true },
    }),
  ]);

  const stationName = new Map(stations.map((s) => [s.id, s.name]));
  const sensitiveTotal = sensitiveGroups.reduce((n, g) => n + g._count._all, 0);
  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { category, station, line, days: days || undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/public/list?${s}` : '/public/list';
  };
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="app-bg min-h-screen">
      <AppHeader
        title="گزارش‌های عمومی"
        eyebrow={`${toFa(total)} مورد غیرحساس`}
        icon={FileText}
        action={<Link href="/public/stats" className="btn btn-secondary pressable rounded-xl px-3 py-2 text-xs">داده باز</Link>}
      />

      <div className="mx-auto w-full max-w-md space-y-4 p-4 pb-24">
        <Surface className="p-4">
          <div className="mb-3 flex items-center justify-between text-sm font-extrabold text-slate-800">
            <span className="flex items-center gap-2">
              <Filter size={17} className="text-blue-600" />
              فیلتر گزارش‌ها
            </span>
            {(category || line || station || days) && (
              <Link href="/public/list" className="text-xs font-bold text-rose-700 underline underline-offset-4">
                پاک کردن فیلترها
              </Link>
            )}
          </div>
          <form action="/public/list" className="grid grid-cols-2 gap-2">
            <Select name="category" value={category} placeholder="همه دسته‌ها" options={categories.map((c) => [c.id, c.titleFa.replace(/[\p{Extended_Pictographic}️]/gu, '').trim()])} />
            <Select name="line" value={line} placeholder="همه خطوط" options={lines.map((l) => [l.id, l.name])} />
            <Select name="station" value={station} placeholder="همه ایستگاه‌ها" options={stations.map((s) => [s.id, s.name])} />
            <Select name="days" value={days} placeholder="همه زمان‌ها" options={RANGES.filter((r) => r.v).map((r) => [r.v, r.label])} />
            <button className="btn btn-primary pressable col-span-2 min-h-12">
              اعمال فیلتر
            </button>
          </form>
        </Surface>

        {sensitiveTotal > 0 && (
        <Notice tone="danger" title="گزارش‌های اجتماعی و امنیتی (تجمیعی)" className="text-sm">
          <p className="leading-7">
            {toFa(sensitiveTotal)} گزارش ناشناس ثبت شده است. برای حفظ حریم خصوصی، فقط شمار به تفکیک ایستگاه نمایش داده می‌شود:
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {sensitiveGroups
              .sort((a, b) => b._count._all - a._count._all)
              .map((g) => (
                <li key={g.stationId ?? 'none'} className="rounded-full border border-rose-200/70 bg-white/70 px-3 py-1 font-medium">
                  {g.stationId ? stationName.get(g.stationId) : 'ایستگاه نامشخص'}: {toFa(g._count._all)}
                </li>
              ))}
          </ul>
        </Notice>
        )}

        <ul className="space-y-3">
          {items.map((r) => (
          <li key={r.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-black text-slate-900 leading-7">{r.subcategory.titleFa}</p>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${SEVERITY[r.severity]?.cls}`}>{SEVERITY[r.severity]?.label}</span>
            </div>
            <p className="text-xs font-bold text-slate-600">
              {r.station?.name ?? 'ایستگاه نامشخص'}
              {r.line ? (
                <span className="mr-2 inline-flex items-center gap-1">
                  · <span className="h-2.5 w-2.5 rounded-full shadow-xs" style={{ background: r.line.color ?? '#94a3b8' }} />{r.line.name}
                </span>
              ) : null}
            </p>
            {r.description && <p className="rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-700 font-medium">{r.description}</p>}
            {r.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.photoUrl} alt="عکس پیوست گزارش" loading="lazy" className="max-h-48 w-full rounded-2xl object-cover" />
            )}
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium pt-1 border-t border-slate-100">
              <span>{formatJalali(r.occurredAt)}</span>
              <span className="flex items-center gap-1.5 text-slate-500 font-bold">
                {r.photoUrl && <Camera size={14} className="text-slate-400" />}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                  {STATUS[r.status] ?? r.status}
                </span>
              </span>
            </div>
          </li>
          ))}
          {items.length === 0 && (
            <li className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <FileText size={32} />
              </div>
              <div>
                <p className="font-extrabold text-slate-700">هیچ گزارشی یافت نشد</p>
                <p className="mt-1 text-sm text-slate-500">برای این فیلتر هنوز هیچکس گزارشی ثبت نکرده است.</p>
              </div>
              <Link href="/report" className="btn btn-primary pressable mt-2 px-5 py-2.5 text-sm">
                اولین گزارش را ثبت کنید
              </Link>
            </li>
          )}
        </ul>

        {pages > 1 && (
          <nav className="flex items-center justify-between pb-5">
            {page > 1 ? <Link href={qs({ page: String(page - 1) })} className="btn btn-neutral pressable min-h-11 px-4">قبلی</Link> : <span />}
            <span className="text-sm text-slate-500">{toFa(page)} از {toFa(pages)}</span>
            {page < pages ? <Link href={qs({ page: String(page + 1) })} className="btn btn-neutral pressable min-h-11 px-4">بعدی</Link> : <span />}
          </nav>
        )}
      </div>
    </main>
  );
}

function Select({ name, value, placeholder, options }: { name: string; value?: string; placeholder: string; options: string[][] }) {
  return (
    <select name={name} defaultValue={value ?? ''} aria-label={placeholder} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700">
      <option value="">{placeholder}</option>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
