import { redirect } from 'next/navigation';
import { AlertTriangle, ArrowDownLeft, ArrowUpLeft, BarChart3, Map as MapIcon, Minus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { toFa } from '@/lib/format';
import { GENDERS, KPI_GROUPS } from '@/lib/report-meta';
import { AppHeader, Notice, Surface } from '@/components/ui';
import StatsChart from '@/app/public/stats/StatsChart';
import MapWrapper from '@/components/dashboard/ReportMapWrapper';

export const dynamic = 'force-dynamic';

const DAY = 864e5;
const tehranHour = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tehran', hour: 'numeric', hourCycle: 'h23' });
const tehranDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran' });
const dayLabel = new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: 'Asia/Tehran', month: 'numeric', day: 'numeric' });
const clean = (t: string) => t.replace(/[\p{Extended_Pictographic}️]/gu, '').trim();
// صفحه در هر درخواست روی سرور رندر می‌شود؛ زمان جاری عمداً از بیرون کامپوننت خوانده می‌شود
const currentTime = () => Date.now();
const groupOf = (sub: string) => KPI_GROUPS.find((g) => g.subcategories.includes(sub))?.key;

export default async function AnalyticsPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');

  const now = currentTime();
  const [reports, categories, stations, lines, mapReports] = await Promise.all([
    prisma.report.findMany({
      where: { createdAt: { gte: new Date(now - 30 * DAY) } },
      select: {
        occurredAt: true, createdAt: true, categoryId: true, subcategoryId: true, stationId: true,
        lineId: true, status: true, gender: true, subcategory: { select: { isSensitive: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.station.findMany({ select: { id: true, name: true, isInterchange: true } }),
    prisma.line.findMany({ orderBy: { name: 'asc' } }),
    prisma.report.findMany({
      where: { lat: { not: null }, lng: { not: null } },
      include: { category: true, subcategory: true, station: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
  ]);
  const stationName = new Map(stations.map((s) => [s.id, s.name]));
  const ago = (r: { createdAt: Date }) => (now - +r.createdAt) / DAY;

  // شاخص‌های تجربه: ۷ روز اخیر در برابر ۷ روز قبل
  const kpis = KPI_GROUPS.map((g) => {
    const inGroup = reports.filter((r) => g.subcategories.includes(r.subcategoryId));
    return {
      ...g,
      current: inGroup.filter((r) => ago(r) < 7).length,
      previous: inGroup.filter((r) => ago(r) >= 7 && ago(r) < 14).length,
    };
  });

  // هشدار سریع: ایستگاهی که گزارش ۲۴ ساعت اخیرش ≥۳ و ≥۳ برابر میانگین روزانه ۱۴ روز قبل است
  const byStation = new Map<string, { last24: number; prior: number }>();
  for (const r of reports) {
    if (!r.stationId) continue;
    const s = byStation.get(r.stationId) ?? { last24: 0, prior: 0 };
    if (ago(r) < 1) s.last24++;
    else if (ago(r) < 15) s.prior++;
    byStation.set(r.stationId, s);
  }
  const spikes = [...byStation.entries()]
    .map(([id, s]) => ({ id, ...s, avg: s.prior / 14 }))
    .filter((s) => s.last24 >= 3 && s.last24 >= 3 * Math.max(s.avg, 0.34))
    .sort((a, b) => b.last24 - a.last24);

  const hours = Array.from({ length: 24 }, (_, h) => ({ h, n: 0 }));
  for (const r of reports) hours[Number(tehranHour.format(r.occurredAt)) % 24].n++;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now - (13 - i) * DAY);
    return { key: tehranDay.format(d), label: dayLabel.format(d), n: 0 };
  });
  for (const r of reports) {
    const day = days.find((d) => d.key === tehranDay.format(r.createdAt));
    if (day) day.n++;
  }

  const categoryStats = categories.map((c) => ({
    name: clean(c.titleFa),
    count: reports.filter((r) => r.categoryId === c.id).length,
  }));

  // گره‌های تبادلی: هم‌زمانی تأخیر + ازدحام + نقص اطلاع‌رسانی
  const hubs = stations
    .filter((s) => s.isInterchange)
    .map((s) => {
      const rs = reports.filter((r) => r.stationId === s.id);
      const groups = new Set(rs.map((r) => groupOf(r.subcategoryId)));
      const failing = ['reliability', 'crowding', 'information'].filter((g) => groups.has(g));
      return { ...s, total: rs.length, failing };
    })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.failing.length - a.failing.length || b.total - a.total)
    .slice(0, 8);

  const lineRows = lines
    .map((l) => {
      const rs = reports.filter((r) => r.lineId === l.id);
      const resolved = rs.filter((r) => r.status === 'resolved').length;
      return { ...l, total: rs.length, resolved, open: rs.filter((r) => !['resolved', 'rejected'].includes(r.status)).length };
    })
    .filter((l) => l.total > 0)
    .sort((a, b) => b.total - a.total);

  const sensitive = reports.filter((r) => r.subcategory.isSensitive);
  const sensitiveByGender = Object.entries(GENDERS).map(([k, label]) => ({ label, n: sensitive.filter((r) => r.gender === k).length }));
  const sensitiveUnknown = sensitive.filter((r) => !r.gender).length;
  const sensitiveNight = sensitive.filter((r) => {
    const h = Number(tehranHour.format(r.occurredAt));
    return h >= 20 || h < 6;
  }).length;

  const maxHour = Math.max(1, ...hours.map((h) => h.n));
  const maxDay = Math.max(1, ...days.map((d) => d.n));
  const kpiLabel = (key: string) => KPI_GROUPS.find((g) => g.key === key)?.label ?? key;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader title="تحلیل و پایش شبکه" eyebrow="۳۰ روز اخیر" icon={BarChart3} backHref="/admin" dark />

      <main className="mx-auto w-full max-w-7xl space-y-4 p-4">
        {spikes.length > 0 && (
          <Notice tone="danger" icon={AlertTriangle} title="هشدار افزایش ناگهانی گزارش‌ها">
            <ul className="mt-1 space-y-1 text-sm">
              {spikes.map((s) => (
                <li key={s.id}>
                  «{stationName.get(s.id)}»: {toFa(s.last24)} گزارش در ۲۴ ساعت اخیر (میانگین روزانه قبل: {toFa(s.avg.toFixed(1))})
                </li>
              ))}
            </ul>
          </Notice>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {kpis.map((k) => {
            const diff = k.current - k.previous;
            const Arrow = diff > 0 ? ArrowUpLeft : diff < 0 ? ArrowDownLeft : Minus;
            return (
              <Surface key={k.key} className="p-4">
                <p className="text-xs font-bold text-slate-500">{k.label}</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{toFa(k.current)}</p>
                <p className={`mt-1 flex items-center gap-1 text-[11px] font-bold ${diff > 0 ? 'text-rose-700' : diff < 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                  <Arrow size={13} /> {toFa(Math.abs(diff))} نسبت به هفته قبل
                </p>
              </Surface>
            );
          })}
        </div>
        <p className="px-1 text-[11px] text-slate-500">عدد هر شاخص = شمار گزارش‌های مرتبط در ۷ روز اخیر؛ کاهش یعنی تجربه بهتر.</p>

        <div className="grid gap-4 lg:grid-cols-2">
          <Surface className="p-4">
            <h2 className="mb-3 font-extrabold text-slate-950">توزیع ساعتی رخدادها</h2>
            <div className="flex h-40 items-end gap-0.5" dir="ltr">
              {hours.map((h) => (
                <div key={h.h} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    title={`${h.h}:00 — ${h.n}`}
                    className={`w-full rounded-t ${(h.h >= 7 && h.h < 10) || (h.h >= 16 && h.h < 19) ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ height: `${(h.n / maxHour) * 100}%`, minHeight: h.n ? 2 : 0 }}
                  />
                  {h.h % 3 === 0 && <span className="text-[9px] text-slate-400">{toFa(h.h)}</span>}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">قرمز = ساعات اوج (۷ تا ۱۰ و ۱۶ تا ۱۹)</p>
          </Surface>

          <Surface className="p-4">
            <h2 className="mb-3 font-extrabold text-slate-950">روند روزانه (۱۴ روز)</h2>
            <div className="flex h-40 items-end gap-1" dir="ltr">
              {days.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500">{d.n ? toFa(d.n) : ''}</span>
                  <div className="w-full rounded-t bg-teal-500" style={{ height: `${(d.n / maxDay) * 100}%`, minHeight: d.n ? 2 : 0 }} />
                  <span className="text-[9px] text-slate-400">{d.label}</span>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <Surface className="p-4">
          <h2 className="font-extrabold text-slate-950">سهم هر دسته مشکل</h2>
          <StatsChart data={categoryStats} />
        </Surface>

        <div className="grid gap-4 lg:grid-cols-2">
          <Surface className="p-4">
            <h2 className="mb-1 font-extrabold text-slate-950">گره‌های تبادلی پرمسئله</h2>
            <p className="mb-3 text-[11px] text-slate-500">ایستگاه‌هایی که هم‌زمان تأخیر، ازدحام و نقص اطلاع‌رسانی در آن‌ها گزارش شده بالاترند.</p>
            {hubs.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">هنوز گزارشی از ایستگاه‌های تبادلی نیست.</p>
            ) : (
              <ul className="space-y-2">
                {hubs.map((h) => (
                  <li key={h.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                    <span className="text-sm font-extrabold text-slate-800">{h.name}</span>
                    <span className="flex flex-wrap justify-end gap-1 text-[10px] font-bold">
                      {h.failing.map((g) => <span key={g} className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-800">{kpiLabel(g)}</span>)}
                      <span className="rounded-full bg-white px-2 py-0.5 text-slate-700">{toFa(h.total)} گزارش</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Surface>

          <Surface className="p-4">
            <h2 className="mb-3 font-extrabold text-slate-950">مقایسه خطوط</h2>
            {lineRows.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">هنوز گزارشی با خط مشخص نیست.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="text-slate-500">
                    <tr><th className="py-2">خط</th><th>کل</th><th>باز</th><th>حل شده</th><th>نرخ حل</th></tr>
                  </thead>
                  <tbody className="font-bold text-slate-700">
                    {lineRows.map((l) => (
                      <tr key={l.id} className="border-t border-slate-100">
                        <td className="py-2">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color ?? '#94a3b8' }} />{l.name}
                          </span>
                        </td>
                        <td>{toFa(l.total)}</td>
                        <td>{toFa(l.open)}</td>
                        <td>{toFa(l.resolved)}</td>
                        <td>{toFa(Math.round((l.resolved / l.total) * 100))}٪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Surface>
        </div>

        <Surface className="p-4">
          <h2 className="mb-1 font-extrabold text-slate-950">گزارش امنیت و تجربه زنان (تجمیعی)</h2>
          <p className="mb-3 text-[11px] text-slate-500">فقط شمارش؛ جنسیت اختیاری است و گزارش‌ها به‌صورت موردی نمایش داده نمی‌شوند.</p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Mini label="کل گزارش‌های حساس" value={sensitive.length} />
            {sensitiveByGender.map((g) => <Mini key={g.label} label={`گزارش‌دهنده ${g.label}`} value={g.n} />)}
            <Mini label="جنسیت نامشخص" value={sensitiveUnknown} />
            <Mini label="در ساعات شب (۲۰ تا ۶)" value={sensitiveNight} />
          </div>
        </Surface>

        <Surface className="overflow-hidden p-4">
          <h2 className="mb-3 flex items-center gap-2 font-extrabold text-slate-950">
            <MapIcon size={18} className="text-blue-700" /> نقشه گزارش‌های غیرحساس
          </h2>
          <div className="h-96 w-full">
            <MapWrapper reports={mapReports} />
          </div>
        </Surface>
      </main>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{toFa(value)}</p>
    </div>
  );
}
