'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Plus, UserRound, type LucideIcon } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on feedback and admin
  if (pathname?.startsWith('/feedback') || pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isList = pathname?.startsWith('/public/list') || pathname?.startsWith('/public/stats');
  const isProfile = pathname === '/profile';

  return (
    <>
      {/* فاصله تا محتوای انتهای صفحه زیر نوار شناور پنهان نشود */}
      <div className="h-24 shrink-0" aria-hidden />

      {/* نوار شیشه‌ای شناور به سبک App Store: کپسول تب‌ها + دکمهٔ دایره‌ای جدا */}
      <nav
        aria-label="ناوبری اصلی"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="pointer-events-auto mx-auto flex max-w-md items-center gap-3">
          <div className="glass flex h-[62px] flex-1 items-center gap-1 rounded-full p-1.5">
            <Tab href="/" label="خانه" icon={Home} active={isHome} />
            <Tab href="/public/list" label="گزارش‌ها" icon={List} active={!!isList} />
            <Tab href="/profile" label="پروفایل" icon={UserRound} active={isProfile} />
          </div>

          <Link
            href="/report"
            aria-label="ثبت گزارش جدید"
            className="glass glass-tint group flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full text-white transition-transform active:scale-90"
          >
            <Plus size={28} strokeWidth={2.6} aria-hidden className="transition-transform duration-300 group-hover:rotate-90" />
          </Link>
        </div>
      </nav>
    </>
  );
}

function Tab({ href, label, icon: Icon, active, dot = false }: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  dot?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-full transition-colors duration-200 active:scale-95 ${
        active ? 'bg-slate-900/[0.07] text-blue-600' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      <span className="relative">
        <Icon
          size={22}
          strokeWidth={active ? 2.4 : 2}
          aria-hidden
          className={active && dot ? 'fill-amber-400 text-amber-500' : ''}
        />
        {dot && (
          <span className="absolute -right-1 -top-1 flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
        )}
      </span>
      <span className={`text-[11px] leading-none ${active ? 'font-extrabold' : 'font-semibold'}`}>{label}</span>
    </Link>
  );
}
