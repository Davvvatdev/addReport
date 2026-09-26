'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Coins, Gift, ChevronLeft, Star } from 'lucide-react';
import { getCitizenProfile, CitizenProfile } from '@/lib/gamification';
import { toFa } from '@/lib/format';
import { db } from '@/lib/db';

export default function CitizenHomeBanner() {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      db.reports
        .toArray()
        .then((reports) => setProfile(getCitizenProfile(reports)))
        .catch(() => setProfile(getCitizenProfile()));
    });
  }, []);

  // جای‌نگهدار هم‌اندازه تا صفحه هنگام بارگذاری پرش نکند
  if (!profile) {
    return <div aria-hidden className="h-[168px] animate-pulse rounded-3xl border border-slate-200 bg-white" />;
  }

  const remaining = Math.max(0, profile.nextLevelPoints - profile.points);
  const progress = Math.min(100, Math.max(4, profile.progressPercent));

  return (
    <section aria-label="باشگاه شهروندی" className="rounded-3xl border border-amber-200/70 bg-gradient-to-b from-amber-50/70 to-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-2xl">
            <span aria-hidden>{profile.avatar}</span>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-slate-900">
              <Star size={10} className="fill-slate-900" aria-hidden />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-slate-900">سلام، {profile.name}</p>
            <p className="mt-0.5 text-xs font-bold text-amber-800">{profile.levelTitle}</p>
          </div>
        </div>

        <Link href="/profile" className="btn btn-secondary pressable shrink-0 gap-1 rounded-xl px-3 py-2 text-xs font-black">
          <Gift size={14} aria-hidden />
          جوایز
          <ChevronLeft size={14} aria-hidden />
        </Link>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="flex items-baseline gap-1.5">
          <Coins size={18} className="self-center text-amber-500" aria-hidden />
          <span className="text-2xl font-black text-slate-950">{profile.points.toLocaleString('fa-IR')}</span>
          <span className="text-xs font-medium text-slate-500">سکه شهروندی</span>
        </p>
        <p className="text-[11px] font-bold text-slate-500">
          {remaining > 0 ? `${toFa(remaining.toLocaleString('fa-IR'))} سکه تا سطح بعد` : 'بالاترین سطح'}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label="پیشرفت تا سطح بعد"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={profile.progressPercent}
        className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100"
      >
        <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-orange-500 transition-[width] duration-700" style={{ width: `${progress}%` }} />
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-600">
        هر گزارش <b className="text-slate-800">۵۰ سکه</b> — قابل تبدیل به شارژ کارت بلیت مترو و خدمات شهری
      </p>
    </section>
  );
}
