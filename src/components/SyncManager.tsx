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
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 shadow-xl shadow-amber-900/10"
    >
      <CloudOff size={18} />
      {toFa(pending)} گزارش در انتظار ارسال است؛ با اتصال به اینترنت خودکار ارسال می‌شود.
    </div>
  );
}
