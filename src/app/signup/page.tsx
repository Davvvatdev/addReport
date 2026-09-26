'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { signup } from '@/app/actions/auth';
import { AppHeader, Notice } from '@/components/ui';

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader title="ساخت حساب کاربری" eyebrow="باشگاه شهروندی دیده‌بان" icon={UserPlus} />

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-5 p-4">
        <form action={formAction} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-bold text-slate-700">
              نام کاربری دلخواه
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              dir="ltr"
              placeholder="مثلاً: ali_reza"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">فقط حروف انگلیسی، عدد و خط زیر — بین ۳ تا ۲۰ کاراکتر</p>
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold text-slate-700">
              رمز عبور دلخواه
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              dir="ltr"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">حداقل ۶ کاراکتر</p>
          </div>

          {state?.error && (
            <Notice tone="danger" role="alert" className="text-sm">{state.error}</Notice>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary pressable min-h-12"
          >
            {pending ? 'در حال ساخت حساب…' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          قبلاً ثبت‌نام کرده‌اید؟{' '}
          <Link href="/login" className="font-bold text-blue-600">
            وارد شوید
          </Link>
        </p>
      </main>
    </div>
  );
}
