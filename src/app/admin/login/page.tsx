'use client';

import { useActionState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { adminLogin } from '@/app/actions/admin';
import { AppHeader, Notice } from '@/components/ui';

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader title="ورود به داشبورد مدیریت" eyebrow="دسترسی محدود" icon={ShieldCheck} dark />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-5 p-4">
        <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700">
              رمز عبور مدیریت
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {state?.error && (
            <Notice tone="danger" role="alert" className="text-sm">{state.error}</Notice>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-dark pressable min-h-12"
          >
            {pending ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>
      </main>
    </div>
  );
}
