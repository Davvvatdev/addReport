import type { Metadata } from 'next';
import { Search } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { formatJalali, toFa, trackingCode } from '@/lib/format';
import { statusCls, statusLabel, severityLabel, UNITS, type Unit } from '@/lib/report-meta';
import { AppHeader, Notice, Surface } from '@/components/ui';
import { ResolutionVote } from '@/components/CitizenActions';

export const metadata: Metadata = { title: 'پیگیری گزارش | دیده‌بان حمل‌ونقل تهران' };
export const dynamic = 'force-dynamic';

const CODE_RE = /^(?:TR-?)?([0-9A-F]{8})$/i;

async function findReport(code: string) {
  const m = CODE_RE.exec(code.trim().replace(/\s/g, ''));
  if (!m) return null;
  return prisma.report.findFirst({
    where: { id: { startsWith: m[1].toLowerCase() } },
    include: {
      subcategory: true,
      station: true,
      line: true,
      events: { orderBy: { createdAt: 'asc' } },
      _count: { select: { confirmations: true } },
    },
  });
}

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = '' } = await searchParams;
  const report = code ? await findReport(code) : null;
  const votes = report?.status === 'resolved'
    ? await Promise.all([
        prisma.resolutionVote.count({ where: { reportId: report.id, resolved: true } }),
        prisma.resolutionVote.count({ where: { reportId: report.id, resolved: false } }),
      ])
    : null;

  return (
    <main className="app-bg min-h-screen">
      <AppHeader title="پیگیری گزارش" eyebrow="با کد رهگیری" icon={Search} />
      <div className="mx-auto w-full max-w-md space-y-4 p-4 pb-24">
        <form action="/track" className="flex gap-2">
          <input
            id="code"
            name="code"
            defaultValue={code}
            dir="ltr"
            placeholder="TR-XXXXXXXX"
            aria-label="کد رهگیری"
            className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 text-center font-bold tracking-widest outline-none focus:border-blue-500"
          />
          <button className="btn btn-primary pressable min-h-12 px-5">پیگیری</button>
        </form>

        {code && !report && (
          <Notice tone="warning">گزارشی با این کد پیدا نشد. اگر گزارش را بدون اینترنت ثبت کرده‌اید، ممکن است هنوز ارسال نشده باشد.</Notice>
        )}

        {report && (
          <>
            <Surface className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p dir="ltr" className="text-right text-xs font-bold text-slate-400">{trackingCode(report.id)}</p>
                  <p className="mt-1 font-black leading-7 text-slate-900">{report.subcategory.titleFa}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusCls(report.status)}`}>
                  {statusLabel(report.status)}
                </span>
              </div>
              {!report.subcategory.isSensitive && (
                <p className="text-xs font-bold text-slate-600">
                  {report.station?.name ?? 'ایستگاه نامشخص'}
                  {report.line ? ` · ${report.line.name}` : ''} · شدت {severityLabel(report.severity)}
                  {report._count.confirmations > 0 && ` · ${toFa(report._count.confirmations)} نفر دیگر هم دیده‌اند`}
                </p>
              )}
              {report.assignedUnit && (
                <p className="rounded-xl bg-sky-50 p-3 text-xs font-bold text-sky-800">
                  واحد مسئول: {UNITS[report.assignedUnit as Unit] ?? report.assignedUnit}
                </p>
              )}
              {report.statusNote && (
                <p className="rounded-xl bg-slate-50 p-3 text-sm leading-7 text-slate-700">
                  <b>پاسخ سامانه:</b> {report.statusNote}
                </p>
              )}
            </Surface>

            <Surface className="p-4">
              <h2 className="mb-3 text-sm font-extrabold text-slate-900">روند رسیدگی</h2>
              <ol className="relative space-y-4 border-r-2 border-slate-100 pr-4">
                {report.events.map((e) => (
                  <li key={e.id} className="relative">
                    <span className="absolute -right-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                    <p className="text-sm font-bold text-slate-900">{statusLabel(e.status)}</p>
                    <p className="text-xs text-slate-400">{formatJalali(e.createdAt)}</p>
                    {e.note && <p className="mt-1 text-xs leading-6 text-slate-600">{e.note}</p>}
                  </li>
                ))}
                {report.events.length === 0 && (
                  <li className="text-sm text-slate-500">ثبت شد — {formatJalali(report.createdAt)}</li>
                )}
              </ol>
            </Surface>

            {votes && (
              <Surface className="p-4">
                <ResolutionVote reportId={report.id} yes={votes[0]} no={votes[1]} />
              </Surface>
            )}
          </>
        )}
      </div>
    </main>
  );
}
