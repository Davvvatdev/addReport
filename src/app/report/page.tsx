import type { Metadata } from 'next';
import ReportWizard from '@/components/ReportWizard';

export const metadata: Metadata = { title: 'ثبت گزارش | دیده‌بان حمل‌ونقل تهران' };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <main className="app-bg mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col pb-14 shadow-2xl shadow-slate-900/5">
      <ReportWizard initialStation={one(sp.station)} initialLine={one(sp.line)} />
    </main>
  );
}
