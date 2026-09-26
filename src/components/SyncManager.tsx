'use client';

import { useEffect, useState } from 'react';
import { CloudOff } from 'lucide-react';
import { pendingCount, REPORTS_CHANGED, syncPending } from '@/lib/sync';
import { toFa } from '@/lib/format';

/** همگام‌سازی خودکار صف آفلاین + نمایش تعداد گزارش‌های در انتظار ارسال */
export default function SyncManager() {
  const [pending, setPending] = useState(0);

  useEffect(() => {
    const refresh = () => pendingCount().then(setPending).catch(() => {});
    const run = () => syncPending().then(refresh);
    refresh();
    run();
    window.addEventListener('online', run);
    window.addEventListener(REPORTS_CHANGED, refresh);
    const timer = setInterval(run, 60_000);
    return () => {
      window.removeEventListener('online', run);
      window.removeEventListener(REPORTS_CHANGED, refresh);
      clearInterval(timer);
    };
  }, []);

  if (!pending) return null;
  return (
    <div
      role="status"
      className="notice notice-warning fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md items-center text-sm font-bold"
    >
      <CloudOff size={18} className="shrink-0" aria-hidden />
      {toFa(pending)} گزارش در انتظار ارسال است؛ با اتصال به اینترنت خودکار ارسال می‌شود.
    </div>
  );
}
