'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, ChevronLeft, Sparkles, Star } from 'lucide-react';
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

  if (!profile) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 text-slate-950">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-2xl text-blue-600">
            <span>{profile.avatar}</span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-900">
              <Star size={10} className="fill-slate-900" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">سلام {profile.name}</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                {profile.levelTitle}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black">{toFa(profile.points.toLocaleString('fa-IR'))}</span>
              <span className="text-xs font-medium text-slate-500">سکه شهروندی</span>
            </div>
          </div>
        </div>

        <Link
          href="/profile"
          className="btn btn-primary pressable shrink-0 gap-1 px-3 py-2 text-xs font-black"
        >
          <Gift size={14} />
          <span>جوایز شهری</span>
          <ChevronLeft size={14} />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-900">
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles size={13} className="shrink-0 text-amber-500" aria-hidden />
          ثبت هر گزارش = ۵۰ سکه + شارژ رایگان کارت بلیت مترو
        </span>
        <span className="shrink-0 pr-1 font-bold text-amber-700">قابل تبدیل</span>
      </div>
    </div>
  );
}
