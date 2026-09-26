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
        className="btn btn-danger pressable gap-1 rounded-xl px-3 py-1.5 text-xs"
      >
        <Trash2 size={14} />
        حذف
      </button>
    </form>
  );
}
