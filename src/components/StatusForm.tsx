'use client';

import { useActionState, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { updateReportStatus, type StatusFormState } from '@/app/admin/actions';
import { STATUS_LABEL, STATUSES, UNITS, type Status } from '@/lib/report-meta';

export function StatusForm({ reportId, status, assignedUnit }: { reportId: string; status: string; assignedUnit: string | null }) {
  const [state, action, pending] = useActionState<StatusFormState | undefined, FormData>(updateReportStatus, undefined);
  const [next, setNext] = useState<Status>(status as Status);

  return (
    <form action={action} className="grid gap-2 text-right">
      <input type="hidden" name="reportId" value={reportId} />
      <select
        id={`status-${reportId}`}
        name="status"
        value={next}
        onChange={(e) => setNext(e.target.value as Status)}
        aria-label="وضعیت جدید"
        className="min-h-10 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold"
      >
        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
      </select>
      <select
        id={`unit-${reportId}`}
        name="assignedUnit"
        defaultValue={assignedUnit ?? ''}
        aria-label="واحد مسئول"
        className="min-h-10 rounded-xl border border-slate-200 bg-white px-2 text-xs"
      >
        <option value="">واحد مسئول…</option>
        {Object.entries(UNITS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <textarea
        id={`note-${reportId}`}
        name="note"
        rows={2}
        maxLength={500}
        placeholder={next === 'rejected' ? 'دلیل رد (الزامی)' : 'پاسخ به شهروند (اختیاری)'}
        className="rounded-xl border border-slate-200 bg-white p-2 text-xs"
      />
      {state?.error && <p className="text-xs font-bold text-rose-700">{state.error}</p>}
      {state?.ok && <p className="text-xs font-bold text-emerald-700">ذخیره شد.</p>}
      <button disabled={pending} className="btn btn-primary pressable min-h-10 gap-1 text-xs">
        {pending && <Loader2 size={14} className="animate-spin" />} ثبت تغییر
      </button>
    </form>
  );
}
