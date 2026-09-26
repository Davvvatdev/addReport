'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, Moon, Sun } from 'lucide-react';

interface GreetingData {
  text: string;
  icon: typeof Sun;
  color: string;
}

function getGreeting(hour: number): GreetingData {
  if (hour >= 7 && hour < 12) {
    return {
      text: 'صبح بخیر',
      icon: Sun,
      color: 'text-amber-500 fill-amber-400',
    };
  }
  if (hour >= 12 && hour < 18) {
    return {
      text: 'ظهر بخیر',
      icon: Sun,
      color: 'text-amber-500 fill-amber-400',
    };
  }
  // از ساعت ۱۸ تا ۷ صبح فردا
  return {
    text: 'شب بخیر',
    icon: Moon,
    color: 'text-indigo-400 fill-indigo-400',
  };
}

export default function TopGreetingHeader() {
  const [greeting, setGreeting] = useState<GreetingData>({
    text: 'شب بخیر',
    icon: Moon,
    color: 'text-indigo-400 fill-indigo-400',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      setGreeting(getGreeting(h));
    };
    queueMicrotask(() => {
      setMounted(true);
      update();
    });
    const timer = setInterval(update, 30_000);
    return () => clearInterval(timer);
  }, []);

  const Icon = greeting.icon;

  return (
    <div className="flex items-center justify-between py-2">
      {/* سمت راست: پیام تبریک بر اساس زمان + کپسول تهران */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {mounted && <Icon size={20} className={`${greeting.color} transition-all`} />}
          <span className="text-lg font-black text-slate-900 tracking-tight">
            {mounted ? greeting.text : 'روز بخیر'}
          </span>
        </div>

        {/* کپسول تهران مطابق تصویر */}
        <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1">
          <MapPin size={13} className="text-orange-500" aria-hidden />
          <span className="text-xs font-black text-orange-600">تهران</span>
        </div>
      </div>

      {/* سمت چپ: لوگوی رسمی دیده‌بان بدون فریم و کادر */}
      <div className="flex items-center">
        <Image
          src="/assets/logo.png"
          alt="دیده‌بان حمل‌ونقل تهران"
          width={38}
          height={38}
          className="h-9 w-9 object-contain mix-blend-multiply"
          priority
        />
      </div>
    </div>
  );
}
