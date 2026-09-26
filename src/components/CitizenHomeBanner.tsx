'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, ChevronLeft, Sparkles, Trophy } from 'lucide-react';
import { getCitizenProfile, CitizenProfile } from '@/lib/gamification';
import { toFa } from '@/lib/format';

export default function CitizenHomeBanner() {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);

  useEffect(() => {
    setProfile(getCitizenProfile());
  }, []);

  if (!profile) return null;

  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 p-4 text-white shadow-lg shadow-sky-500/15">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-2xl border border-white/25">
            <span>{profile.avatar}</span>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-slate-900 text-[9px] font-black">
              ★
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-100">سلام {profile.name} 👋</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-extrabold backdrop-blur-sm">
                {profile.levelTitle}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl font-black">{toFa(profile.points.toLocaleString('fa-IR'))}</span>
              <span className="text-xs font-medium text-sky-100">سکه شهروندی</span>
            </div>
          </div>
        </div>

        <Link
          href="/profile"
          className="flex shrink-0 items-center gap-1 rounded-2xl bg-white px-3 py-2 text-xs font-black text-sky-700 shadow-sm active:scale-95 transition-all hover:bg-sky-50"
        >
          <Gift size={14} className="text-sky-600" />
          <span>جوایز شهری</span>
          <ChevronLeft size={14} />
        </Link>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-black/15 px-3 py-1.5 text-[11px] font-medium text-sky-100 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles size={13} className="text-amber-300 shrink-0" />
          ثبت هر گزارش = ۵۰ سکه + شارژ رایگان کارت بلیت مترو
        </span>
        <span className="font-bold text-amber-300 shrink-0 pr-1">قابل تبدیل</span>
      </div>
    </div>
  );
}
