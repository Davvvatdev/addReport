import { prisma } from '@/lib/prisma';

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
  return Response.json({ yes, no });
}
