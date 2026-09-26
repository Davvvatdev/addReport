import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const reporterToken = typeof body?.reporterToken === 'string' ? body.reporterToken : '';
  if (reporterToken.length < 8 || reporterToken.length > 64) {
    return Response.json({ error: 'invalid reporter token' }, { status: 400 });
  }

  const report = await prisma.report.findUnique({
    where: { id },
    select: { reporterToken: true, subcategory: { select: { isSensitive: true } } },
  });
  if (!report || report.subcategory.isSensitive) return Response.json({ error: 'not found' }, { status: 404 });
  if (report.reporterToken === reporterToken) return Response.json({ error: 'own report' }, { status: 409 });

  await prisma.reportConfirmation.upsert({
    where: { reportId_reporterToken: { reportId: id, reporterToken } },
    create: { reportId: id, reporterToken },
    update: {},
  });
  const count = await prisma.reportConfirmation.count({ where: { reportId: id } });
  return Response.json({ count });
}
