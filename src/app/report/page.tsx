import type { Metadata } from 'next';
import ReportWizard from '@/components/ReportWizard';

export const metadata: Metadata = { title: 'ثبت گزارش | دیده‌بان حمل‌ونقل تهران' };

export default function ReportPage() {
  return (
    <main className="app-bg mx-auto flex min-h-screen w-full max-w-md flex-1 flex-col pb-14 shadow-2xl shadow-slate-900/5">
      <ReportWizard />
    </main>
  );
}
