'use client';

import { useState } from 'react';
import { Eye, ThumbsDown, ThumbsUp } from 'lucide-react';
import { getReporterToken } from '@/lib/client';
import { toFa } from '@/lib/format';

/** «من هم دیدم» — تأیید جمعی گزارش توسط مسافران دیگر */
export function ConfirmButton({ reportId, initialCount }: { reportId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'own'>('idle');

  async function confirm() {
    setState('busy');
    try {
      const res = await fetch(`/api/reports/${reportId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterToken: getReporterToken() }),
      });
      if (res.status === 409) return setState('own');
      if (res.ok) setCount((await res.json()).count);
      setState(res.ok ? 'done' : 'idle');
    } catch {
      setState('idle');
    }
  }

  return (
    <button
      type="button"
      onClick={confirm}
      disabled={state !== 'idle'}
      className={`pressable inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[11px] font-bold ${
        state === 'done' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      <Eye size={14} />
      {state === 'own' ? 'گزارش خودتان است' : state === 'done' ? 'ثبت شد' : 'من هم دیدم'}
      {count > 0 && <span className="rounded-full bg-black/10 px-1.5">{toFa(count)}</span>}
    </button>
  );
}

/** بعد از «حل شد»: آیا واقعاً حل شده؟ */
export function ResolutionVote({ reportId, yes, no }: { reportId: string; yes: number; no: number }) {
  const [votes, setVotes] = useState({ yes, no });
  const [voted, setVoted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  async function vote(resolved: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reporterToken: getReporterToken(), resolved }),
      });
      if (res.ok) {
        setVotes(await res.json());
        setVoted(resolved);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-bold text-slate-800">به نظر شما این مشکل واقعاً حل شده است؟</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={busy} onClick={() => vote(true)}
          className={`btn pressable min-h-12 gap-2 ${voted === true ? 'btn-primary' : 'btn-neutral'}`}>
          <ThumbsUp size={16} /> بله ({toFa(votes.yes)})
        </button>
        <button type="button" disabled={busy} onClick={() => vote(false)}
          className={`btn pressable min-h-12 gap-2 ${voted === false ? 'btn-danger' : 'btn-neutral'}`}>
          <ThumbsDown size={16} /> هنوز نه ({toFa(votes.no)})
        </button>
      </div>
    </div>
  );
}
