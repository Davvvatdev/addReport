import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { BarChart3, Camera, CheckCircle, Clock3, Copy, Eye, Inbox, LogOut, ShieldCheck, XCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { adminLogout } from '@/app/actions/admin';
import { formatJalali, toFa, trackingCode } from '@/lib/format';
import {
  IMPACTS, SEVERITIES, SEVERITY_LABEL, SEVERITY_RANK, STATUS_LABEL, STATUSES, UNITS,
  severityCls, severityLabel, statusCls, statusLabel, type Impact, type Severity, type Unit,
} from '@/lib/report-meta';
import { AppHeader, StatCard, Surface } from '@/components/ui';
import { DeleteReportButton } from '@/components/DeleteReportButton';
import { StatusForm } from '@/components/StatusForm';

export const dynamic = 'force-dynamic';

const OPEN = ['submitted', 'under_review', 'assigned', 'in_progress'];
const SIMILAR_WINDOW_MS = 48 * 36e5;
const CONTEXT: Record<string, string> = { in_station: 'در ایستگاه', on_vehicle: 'داخل وسیله', transfer_point: 'نقطه تبادل' };
const MODE: Record<string, string> = { metro: 'مترو', bus: 'اتوبوس', brt: 'بی‌آر‌تی' };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
// صفحه در هر درخواست روی سرور رندر می‌شود؛ زمان جاری عمداً از بیرون کامپوننت خوانده می‌شود
const msAgo = (ms: number) => new Date(Date.now() - ms);
const clean = (t: string) => t.replace(/[\p{Extended_Pictographic}️]/gu, '').trim();

export default async function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const sp = await searchParams;
  const status = one(sp.status) ?? 'open';
  const category = one(sp.category);
  const line = one(sp.line);
  const severity = one(sp.severity);

  const where: Prisma.ReportWhereInput = {
    ...(status === 'open' ? { status: { in: OPEN } } : status !== 'all' && { status }),
    ...(category && { categoryId: category }),
    ...(line && { lineId: line }),
    ...(severity && { severity }),
  };

  const since = msAgo(SIMILAR_WINDOW_MS);
  const [reports, counts, categories, lines, recentGroups] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        category: true, subcategory: true, station: true, line: true,
        _count: { select: { confirmations: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.report.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.line.findMany({ orderBy: { name: 'asc' } }),
    prisma.report.groupBy({
      by: ['stationId', 'subcategoryId'],
      where: { createdAt: { gte: since }, stationId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countOf = (s: string) => counts.find((c) => c.status === s)?._count._all ?? 0;
  const similar = new Map(recentGroups.map((g) => [`${g.stationId}|${g.subcategoryId}`, g._count._all]));
  const similarCount = (r: (typeof reports)[number]) =>
    r.createdAt >= since && r.stationId ? (similar.get(`${r.stationId}|${r.subcategoryId}`) ?? 1) - 1 : 0;

  // اعتبار: شاهد تصویری + تأیید مسافران دیگر + گزارش‌های مشابه هم‌زمان
  const credibility = (r: (typeof reports)[number]) =>
    (r.photoUrl ? 1 : 0) + Math.min(r._count.confirmations, 3) + Math.min(similarCount(r), 3);

  // صف رسیدگی: اول شدت، بعد اعتبار، بعد جدیدتر
  const queue = [...reports].sort(
    (a, b) =>
      (SEVERITY_RANK[b.severity as Severity] ?? 0) - (SEVERITY_RANK[a.severity as Severity] ?? 0) ||
      credibility(b) - credibility(a) ||
      +b.createdAt - +a.createdAt,
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader
        title="مدیریت گزارش‌ها"
        eyebrow="صف رسیدگی، ارجاع و پاسخ"
        icon={ShieldCheck}
        dark
        action={
          <div className="flex items-center gap-1">
            <Link href="/admin/analytics" className="tap flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold text-slate-200 active:bg-white/10">
              <BarChart3 size={16} /> تحلیل
            </Link>
            <form action={adminLogout}>
              <button type="submit" className="tap flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-bold text-slate-200 active:bg-white/10">
                <LogOut size={16} /> خروج
              </button>
            </form>
          </div>
        }
      />

      <main className="mx-auto w-full max-w-7xl space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="در انتظار بررسی" value={toFa(countOf('submitted'))} icon={Inbox} tone="amber" />
          <StatCard label="در جریان رسیدگی" value={toFa(countOf('under_review') + countOf('assigned') + countOf('in_progress'))} icon={Clock3} />
          <StatCard label="حل شده" value={toFa(countOf('resolved'))} icon={CheckCircle} tone="teal" />
          <StatCard label="رد شده" value={toFa(countOf('rejected'))} icon={XCircle} tone="slate" />
        </div>

        <Surface className="p-4">
          <form action="/admin" className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <Filter name="status" value={status} options={[['open', 'باز (نیازمند اقدام)'], ['all', 'همه وضعیت‌ها'], ...STATUSES.map((s) => [s, STATUS_LABEL[s]])]} />
            <Filter name="severity" value={severity} placeholder="همه شدت‌ها" options={SEVERITIES.map((s) => [s, SEVERITY_LABEL[s]])} />
            <Filter name="category" value={category} placeholder="همه دسته‌ها" options={categories.map((c) => [c.id, clean(c.titleFa)])} />
            <Filter name="line" value={line} placeholder="همه خطوط" options={lines.map((l) => [l.id, l.name])} />
            <button className="btn btn-dark pressable col-span-2 min-h-11 md:col-span-1">اعمال</button>
          </form>
        </Surface>

        <p className="px-1 text-xs font-bold text-slate-500">
          {toFa(queue.length)} گزارش — مرتب بر اساس شدت، سپس اعتبار (عکس، تأیید مسافران، گزارش‌های مشابه)
        </p>

        <ul className="grid gap-3 lg:grid-cols-2">
          {queue.map((r) => {
            const sim = similarCount(r);
            return (
              <Surface as="li" key={r.id} className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                    <span className={`rounded-full px-2 py-0.5 ${severityCls(r.severity)}`}>{severityLabel(r.severity)}</span>
                    <span className={`rounded-full px-2 py-0.5 ${statusCls(r.status)}`}>{statusLabel(r.status)}</span>
                    {r.subcategory.isSensitive && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">حساس</span>}
                    {sim > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-violet-800">
                        <Copy size={11} /> {toFa(sim)} مشابه در ۴۸ ساعت
                      </span>
                    )}
                    {r._count.confirmations > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-800">
                        <Eye size={11} /> {toFa(r._count.confirmations)} تأیید
                      </span>
                    )}
                  </div>
                  <p className="font-black leading-7 text-slate-900">{r.subcategory.titleFa}</p>
                  <p className="text-xs font-bold leading-6 text-slate-600">
                    {clean(r.category.titleFa)} · {MODE[r.mode] ?? r.mode} · {r.station?.name ?? 'ایستگاه نامشخص'}
                    {r.line && (
                      <span className="mr-1 inline-flex items-center gap-1">
                        · <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.line.color ?? '#94a3b8' }} />{r.line.name}
                      </span>
                    )}
                    {r.direction && ` · به سمت ${r.direction}`} · {CONTEXT[r.vehicleContext] ?? r.vehicleContext}
                  </p>
                  {r.impact && <p className="text-xs text-slate-600">اثر بر سفر: {IMPACTS[r.impact as Impact] ?? r.impact}</p>}
                  {r.description && <p className="rounded-xl bg-slate-50 p-3 text-xs leading-6 text-slate-700">{r.description}</p>}
                  {r.assignedUnit && <p className="text-xs font-bold text-sky-800">ارجاع به: {UNITS[r.assignedUnit as Unit] ?? r.assignedUnit}</p>}
                  {r.statusNote && <p className="text-xs text-slate-500">آخرین پاسخ: {r.statusNote}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <span>وقوع: {formatJalali(r.occurredAt)}</span>
                    <span dir="ltr">{trackingCode(r.id)}</span>
                    {r.photoUrl && (
                      <a href={`/api/reports/${r.id}/photo`} target="_blank" className="inline-flex items-center gap-1 font-bold text-blue-700 underline">
                        <Camera size={12} /> عکس
                      </a>
                    )}
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-100 pt-3 md:border-r md:border-t-0 md:pr-3 md:pt-0">
                  <StatusForm reportId={r.id} status={r.status} assignedUnit={r.assignedUnit} />
                  <DeleteReportButton reportId={r.id} />
                </div>
              </Surface>
            );
          })}
        </ul>
        {queue.length === 0 && (
          <Surface className="p-8 text-center text-sm text-slate-500">گزارشی با این فیلترها نیست.</Surface>
        )}
      </main>
    </div>
  );
}

function Filter({ name, value, placeholder, options }: { name: string; value?: string; placeholder?: string; options: string[][] }) {
  return (
    <select id={`f-${name}`} name={name} defaultValue={value ?? ''} aria-label={placeholder ?? name}
      className="min-h-11 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
