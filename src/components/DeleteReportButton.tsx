'use client';

import { Trash2 } from 'lucide-react';

export function DeleteReportButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm('این گزارش برای همیشه حذف می‌شود و برای کاربر هم دیگر نمایش داده نخواهد شد. ادامه می‌دهید؟')) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
      >
        <Trash2 size={14} />
        حذف
      </button>
    </form>
  );
}
