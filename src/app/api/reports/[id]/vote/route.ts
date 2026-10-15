import { prisma } from '@/lib/prisma';
import { REOPEN_MIN_NO_VOTES, REOPEN_NOTE_PREFIX } from '@/lib/report-meta';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const reporterToken = typeof body?.reporterToken === 'string' ? body.reporterToken : '';
  if (reporterToken.length < 8 || reporterToken.length > 64 || typeof body?.resolved !== 'boolean') {
    return Response.json({ error: 'invalid input' }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id }, select: { status: true } });
  if (!report) return Response.json({ error: 'not found' }, { status: 404 });
  if (report.status !== 'resolved') return Response.json({ error: 'not resolved yet' }, { status: 409 });

  await prisma.resolutionVote.upsert({
    where: { reportId_reporterToken: { reportId: id, reporterToken } },
    create: { reportId: id, reporterToken, resolved: body.resolved },
    update: { resolved: body.resolved },
  });
  const [yes, no] = await Promise.all([
    prisma.resolutionVote.count({ where: { reportId: id, resolved: true } }),
    prisma.resolutionVote.count({ where: { reportId: id, resolved: false } }),
  ]);

  // وقتی شهروندان بیشتری می‌گویند «هنوز حل نشده»، گزارش دوباره به صف رسیدگی برمی‌گردد
  if (no >= REOPEN_MIN_NO_VOTES && no > yes) {
    const note = `${REOPEN_NOTE_PREFIX}: ${no} نفر اعلام کردند مشکل هنوز برطرف نشده است.`;
    await prisma.$transaction([
      prisma.report.update({
        where: { id },
        data: { status: 'under_review', statusNote: note, events: { create: { status: 'under_review', note } } },
      }),
      // چرخهٔ رأی‌گیری بعد از رفع بعدی از نو شروع می‌شود
      prisma.resolutionVote.deleteMany({ where: { reportId: id } }),
    ]);
    return Response.json({ yes: 0, no: 0, reopened: true });
  }
  return Response.json({ yes, no });
}
