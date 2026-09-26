'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { login } from '@/app/actions/auth';
import { AppHeader, Notice } from '@/components/ui';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader title="ورود به حساب کاربری" eyebrow="باشگاه شهروندی دیده‌بان" icon={LogIn} />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-5 p-4">
        <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-slate-700">
              نام کاربری
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700">
              رمز عبور
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
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
            className="btn btn-primary pressable min-h-12"
          >
            {pending ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          حساب کاربری ندارید؟{' '}
          <Link href="/signup" className="font-bold text-blue-600">
            ثبت‌نام کنید
          </Link>
        </p>
      </main>
    </div>
  );
}
