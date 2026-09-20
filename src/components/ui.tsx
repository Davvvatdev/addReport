import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { ArrowRight, type LucideProps } from 'lucide-react';

type Icon = ComponentType<LucideProps>;

export function AppHeader({
  title,
  eyebrow,
  backHref = '/',
  icon: Icon,
  action,
  dark = false,
}: {
  title: string;
  eyebrow?: string;
  backHref?: string;
  icon?: Icon;
  action?: ReactNode;
  dark?: boolean;
}) {
  return (
    <header className={`sticky top-0 z-20 border-b px-4 py-3 backdrop-blur ${dark ? 'border-slate-800 bg-slate-950/95 text-white' : 'border-[var(--border)] bg-white/92 text-slate-950'}`}>
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3">
        <Link
          href={backHref}
          aria-label="بازگشت"
          className={`tap flex w-11 shrink-0 items-center justify-center rounded-xl ${dark ? 'text-slate-200 active:bg-white/10' : 'text-slate-600 active:bg-slate-100'}`}
        >
          <ArrowRight size={21} />
        </Link>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${dark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
            <Icon size={20} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {eyebrow && <p className={`text-xs font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>{eyebrow}</p>}
          <h1 className="truncate text-lg font-extrabold">{title}</h1>
        </div>
        {action}
      </div>
    </header>
  );
}

export function Surface({
  children,
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'li';
}) {
  return <Tag className={`rounded-lg border border-[var(--border)] bg-white shadow-sm shadow-slate-200/40 ${className}`}>{children}</Tag>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'blue',
}: {
  label: string;
  value: ReactNode;
  icon?: Icon;
  tone?: 'blue' | 'teal' | 'amber' | 'rose' | 'slate';
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700',
    teal: 'bg-teal-50 text-teal-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="mt-1 text-2xl font-black text-slate-950">{value}</div>
        </div>
        {Icon && <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={20} /></span>}
      </div>
    </Surface>
  );
}

export function BottomNavHint({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-4 py-3 text-center text-sm font-bold text-slate-700 shadow-2xl shadow-slate-900/10 backdrop-blur">
      {children}
    </div>
  );
}
