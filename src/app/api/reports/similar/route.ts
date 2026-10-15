import { prisma } from '@/lib/prisma';
import { SIMILAR_WINDOW_DAYS } from '@/lib/report-meta';

/** گزارش‌های باز و اخیرِ همان مشکل در همان ایستگاه، برای پرسش «تأیید می‌کنید؟» پیش از ثبت */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const stationId = sp.get('stationId') ?? '';
  const subcategoryId = sp.get('subcategoryId') ?? '';
  const reporterToken = sp.get('reporterToken') ?? '';
  if (!stationId || !subcategoryId) return Response.json({ count: 0, reports: [] });

  const subcategory = await prisma.subcategory.findUnique({
    where: { id: subcategoryId },
    select: { isSensitive: true },
  });
  // گزارش حساس هرگز در نمای عمومی یا پیشنهاد تأیید دیده نمی‌شود
  if (!subcategory || subcategory.isSensitive) return Response.json({ count: 0, reports: [] });

  const reports = await prisma.report.findMany({
    where: {
      stationId,
      subcategoryId,
      status: { notIn: ['resolved', 'rejected'] },
      createdAt: { gte: new Date(Date.now() - SIMILAR_WINDOW_DAYS * 864e5) },
      ...(reporterToken && { reporterToken: { not: reporterToken } }),
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, createdAt: true, status: true, _count: { select: { confirmations: true } } },
  });

  return Response.json({
    count: reports.length,
    reports: reports.slice(0, 1).map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      status: r.status,
      confirmations: r._count.confirmations,
    })),
  });
}
