'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, List, Plus, Star } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on feedback and dashboard
  if (pathname?.startsWith('/feedback') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  const isHome = pathname === '/';
  const isMap = pathname === '/public/map';
  const isList = pathname?.startsWith('/public/list') || pathname?.startsWith('/public/stats');
  const isProfile = pathname === '/profile';

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 shrink-0"></div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 pb-safe shadow-[0_-4px_25px_-5px_rgba(15,23,42,0.12)] backdrop-blur-md">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative px-2">
          
          {/* خانه */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all active:scale-95 ${
              isHome ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">خانه</span>
          </Link>

          {/* نقشه */}
          <Link
            href="/public/map"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all active:scale-95 ${
              isMap ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Map size={22} strokeWidth={isMap ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">نقشه</span>
          </Link>

          {/* دکمه شناور ثبت گزارش در وسط */}
          <div className="flex-1 flex justify-center -mt-6">
            <Link
              href="/report"
              className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition-all active:scale-90 hover:scale-105"
              aria-label="ثبت گزارش جدید"
            >
              <Plus size={28} strokeWidth={2.6} className="transition-transform group-hover:rotate-90 duration-300" />
            </Link>
          </div>

          {/* گزارش‌ها */}
          <Link
            href="/public/list"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all active:scale-95 ${
              isList ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List size={22} strokeWidth={isList ? 2.5 : 2} />
            <span className="text-[10px] tracking-tight">گزارش‌ها</span>
          </Link>

          {/* پروفایل و جوایز (باشگاه شهروندی) */}
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-all active:scale-95 ${
              isProfile ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Star
                size={22}
                strokeWidth={isProfile ? 2.5 : 2}
                className={isProfile ? 'fill-amber-400 text-amber-500' : ''}
              />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            </div>
            <span className="text-[10px] tracking-tight">پروفایل</span>
          </Link>

        </div>
      </nav>
    </>
  );
}
