'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, List, BarChart3, PlusCircle } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on wizard, feedback and dashboard
  if (pathname?.startsWith('/report') || pathname?.startsWith('/feedback') || pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 shrink-0"></div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative px-2">
          <Link href="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Home size={22} strokeWidth={pathname === '/' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">خانه</span>
          </Link>
          
          <Link href="/public/map" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/public/map' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Map size={22} strokeWidth={pathname === '/public/map' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">نقشه</span>
          </Link>

          {/* Floating Action Button for New Report */}
          <div className="w-full flex justify-center -mt-6">
            <Link href="/report" className="bg-blue-600 text-white rounded-full p-3 shadow-lg shadow-blue-600/30 active:scale-95 transition-transform flex items-center justify-center">
              <PlusCircle size={28} strokeWidth={2} />
            </Link>
          </div>

          <Link href="/public/list" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/public/list' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <List size={22} strokeWidth={pathname === '/public/list' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">گزارش‌ها</span>
          </Link>
          
          <Link href="/public/stats" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/public/stats' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <BarChart3 size={22} strokeWidth={pathname === '/public/stats' ? 2.5 : 2} />
            <span className="text-[10px] font-medium">آمار</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

