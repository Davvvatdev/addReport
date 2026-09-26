'use client';

import { Trash2 } from 'lucide-react';
import { deleteReport } from '@/app/admin/actions';

export function DeleteReportButton({ reportId }: { reportId: string }) {
  return (
    <form
      action={deleteReport}
      onSubmit={(e) => {
        if (!confirm('این گزارش برای همیشه حذف می‌شود و برای کاربر هم دیگر نمایش داده نخواهد شد. ادامه می‌دهید؟')) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="reportId" value={reportId} />
      <button type="submit" className="btn btn-danger pressable gap-1 rounded-xl px-3 py-1.5 text-xs">
        <Trash2 size={14} />
        حذف
      </button>
    </form>
  );
}
