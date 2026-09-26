import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { CheckCircle, Clock3, FileText, ShieldCheck } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { AppHeader, StatCard, Surface } from '@/components/ui';
import { toFa } from '@/lib/format';
import { DeleteReportButton } from '@/components/DeleteReportButton';

const prisma = new PrismaClient();

// Server action to update status
async function updateStatus(id: string, newStatus: string) {
  'use server';
  await prisma.report.update({
    where: { id },
    data: { status: newStatus }
  });
  revalidatePath('/dashboard');
}

// Server action to permanently delete a report (removes it for admin and public views)
async function deleteReport(id: string) {
  'use server';
  await prisma.report.delete({ where: { id } });
  revalidatePath('/dashboard');
  revalidatePath('/public/list');
}

export default async function DashboardPage() {
  const [reports, submitted, acknowledged, resolved] = await Promise.all([
    prisma.report.findMany({
      include: {
        category: true,
        subcategory: true,
        station: true,
        line: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.report.count({ where: { status: 'submitted' } }),
    prisma.report.count({ where: { status: 'acknowledged' } }),
    prisma.report.count({ where: { status: 'resolved' } }),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader title="داشبورد مدیریت گزارش‌ها" eyebrow="تغییر وضعیت و حذف گزارش‌های جا مانده" icon={ShieldCheck} dark />

      <main className="mx-auto w-full max-w-7xl space-y-4 p-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="آخرین گزارش‌ها" value={toFa(reports.length)} icon={FileText} tone="slate" />
          <StatCard label="ثبت‌شده" value={toFa(submitted)} icon={Clock3} tone="amber" />
          <StatCard label="در بررسی" value={toFa(acknowledged)} icon={ShieldCheck} />
          <StatCard label="رفع‌شده" value={toFa(resolved)} icon={CheckCircle} tone="teal" />
        </div>

        <Surface className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] p-4">
            <div>
              <h2 className="font-extrabold text-slate-950">صف عملیاتی گزارش‌ها</h2>
              <p className="mt-1 text-sm text-slate-500">وضعیت گزارش قابل تغییر است و در صورت نیاز (مثلاً گزارش‌های جا مانده) می‌توان آن را حذف کرد.</p>
            </div>
            <Link href="/public/list" className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white">نمای عمومی</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-slate-600">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">تاریخ / ایستگاه</th>
                  <th className="px-4 py-3">خط</th>
                  <th className="px-4 py-3">مسئله</th>
                  <th className="px-4 py-3">وضعیت فعلی</th>
                  <th className="px-4 py-3 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {report.station?.name || 'نامشخص'}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(report.createdAt).toLocaleDateString('fa-IR')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {report.line ? (
                        <span className="inline-flex items-center gap-2 whitespace-nowrap font-medium">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: report.line.color ?? '#94a3b8' }} />
                          {report.line.name}
                        </span>
                      ) : <span className="text-slate-400">نامشخص</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{report.category?.titleFa}</div>
                      <div className="text-xs text-slate-500">{report.subcategory?.titleFa}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'submitted' ? 'bg-amber-100 text-amber-800' :
                        report.status === 'acknowledged' ? 'bg-blue-100 text-blue-800' :
                        report.status === 'under_review' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {report.status === 'submitted' ? 'ثبت‌شده' : report.status === 'acknowledged' ? 'تأییدشده' : report.status === 'under_review' ? 'در حال بررسی' : 'رفع‌شده'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {report.status !== 'resolved' && (
                          <form action={async () => {
                            'use server';
                            await updateStatus(report.id, report.status === 'submitted' ? 'acknowledged' : 'resolved');
                          }}>
                            <button type="submit" className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100">
                              <CheckCircle size={14} />
                              {report.status === 'submitted' ? 'تأیید و بررسی' : 'ثبت رفع مشکل'}
                            </button>
                          </form>
                        )}
                        <DeleteReportButton
                          action={async () => {
                            'use server';
                            await deleteReport(report.id);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      هیچ گزارشی یافت نشد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Surface>
      </main>
    </div>
  );
}
