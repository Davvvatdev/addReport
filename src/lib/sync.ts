import { db, type OfflineReport } from './db';
import type { ReportPayload, SubmitResult } from './types';

export const REPORTS_CHANGED = 'reports-changed';
const notify = () => window.dispatchEvent(new Event(REPORTS_CHANGED));

function toPayload(r: OfflineReport): ReportPayload {
  return {
    id: r.uuid,
    mode: r.mode as ReportPayload['mode'],
    lineId: r.lineId,
    stationId: r.stationId,
    direction: r.direction,
    vehicleContext: r.vehicleContext as ReportPayload['vehicleContext'],
    categoryId: r.categoryId,
    subcategoryId: r.subcategoryId,
    description: r.description,
    severity: r.severity as ReportPayload['severity'],
    impact: r.impact,
    tripPurpose: r.tripPurpose,
    riderType: r.riderType,
    accessNeed: r.accessNeed,
    gender: r.gender,
    lat: r.lat,
    lng: r.lng,
    occurredAt: r.occurredAt.toISOString(),
    reporterToken: r.reporterToken,
  };
}

/** ارسال یک گزارش. null = شبکه در دسترس نبود؛ گزارش در صف می‌ماند */
export async function sendReport(r: OfflineReport, timeoutMs = 8000): Promise<SubmitResult | null> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(r)),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (res.ok) {
      await db.reports.update(r.id!, { syncStatus: 'synced' });
      notify();
      return (await res.json()) as SubmitResult;
    }
    // خطای دائمی (اعتبارسنجی) — تکرار فایده‌ای ندارد؛ خطای سرور/محدودیت را بعداً دوباره امتحان می‌کنیم
    if (res.status >= 400 && res.status < 500 && res.status !== 429) {
      await db.reports.update(r.id!, { syncStatus: 'failed' });
      notify();
    }
  } catch {}
  return null;
}

async function sendPhoto(r: OfflineReport): Promise<void> {
  try {
    const res = await fetch(`/api/reports/${r.uuid}/photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo: r.photoData }),
      signal: AbortSignal.timeout(30000),
    });
    // موفق یا رد قطعی → دیگر نگه نمی‌داریم
    if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
      await db.reports.update(r.id!, { photoData: undefined });
    }
  } catch {}
}

let running = false;

/** همگام‌سازی صف: اول همه متن‌ها، بعد عکس‌ها (اولویت پایین‌تر) */
export async function syncPending(): Promise<void> {
  if (running || !navigator.onLine) return;
  running = true;
  try {
    const pending = await db.reports.where('syncStatus').equals('pending').toArray();
    for (const r of pending) await sendReport(r);

    const withPhoto = await db.reports.filter((r) => r.syncStatus === 'synced' && !!r.photoData).toArray();
    for (const r of withPhoto) await sendPhoto(r);
  } finally {
    running = false;
    notify();
  }
}

export const pendingCount = () => db.reports.where('syncStatus').equals('pending').count();
