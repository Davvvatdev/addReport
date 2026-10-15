import 'server-only';
import { prisma } from '@/lib/prisma';
import { REOPEN_NOTE_PREFIX, UNANSWERED_DAYS } from '@/lib/report-meta';

export interface EffectivenessMetrics {
  total: number;
  resolvedCount: number;
  /** سهم گزارش‌های حل‌شده از گزارش‌های رسیدگی‌پذیر (بدون «رد شد») */
  resolutionRate: number | null;
  /** میانه زمان از ثبت تا اولین واکنش، به ساعت */
  medianFirstResponseHours: number | null;
  /** میانه زمان از ثبت تا «حل شد»، به ساعت */
  medianResolveHours: number | null;
  /** درصد گزارش‌های حل‌شده که بعداً با رأی شهروندان دوباره باز شده‌اند */
  reopenRate: number | null;
  unansweredCount: number;
}

const median = (xs: number[]) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const HOUR = 36e5;

/** شاخص‌های اثربخشی رسیدگی؛ فقط تجمیعی است و شامل جزئیات گزارش‌های حساس نمی‌شود */
export async function getEffectivenessMetrics(now = Date.now()): Promise<EffectivenessMetrics> {
  const reports = await prisma.report.findMany({
    select: {
      status: true,
      createdAt: true,
      events: { select: { status: true, note: true, createdAt: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  const firstResponse: number[] = [];
  const resolveTime: number[] = [];
  let resolvedCount = 0;
  let rejected = 0;
  let everResolved = 0;
  let reopened = 0;
  let unanswered = 0;

  for (const r of reports) {
    if (r.status === 'resolved') resolvedCount++;
    if (r.status === 'rejected') rejected++;
    if (r.status === 'submitted' && now - r.createdAt.getTime() > UNANSWERED_DAYS * 864e5) unanswered++;

    const response = r.events.find((e) => e.status !== 'submitted');
    if (response) firstResponse.push((response.createdAt.getTime() - r.createdAt.getTime()) / HOUR);

    const resolved = r.events.find((e) => e.status === 'resolved');
    if (resolved) {
      everResolved++;
      resolveTime.push((resolved.createdAt.getTime() - r.createdAt.getTime()) / HOUR);
      if (r.events.some((e) => e.note?.startsWith(REOPEN_NOTE_PREFIX))) reopened++;
    }
  }

  const actionable = reports.length - rejected;
  return {
    total: reports.length,
    resolvedCount,
    resolutionRate: actionable > 0 ? resolvedCount / actionable : null,
    medianFirstResponseHours: median(firstResponse),
    medianResolveHours: median(resolveTime),
    reopenRate: everResolved > 0 ? reopened / everResolved : null,
    unansweredCount: unanswered,
  };
}
