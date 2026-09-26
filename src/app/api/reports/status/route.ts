import { prisma } from '@/lib/prisma';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const ids = (new URL(request.url).searchParams.get('ids') ?? '')
    .split(',')
    .filter((id) => UUID_RE.test(id))
    .slice(0, 100);
  if (ids.length === 0) return Response.json({ statuses: {} });

  const reports = await prisma.report.findMany({
    where: { id: { in: ids } },
    select: { id: true, status: true },
  });
  return Response.json({ statuses: Object.fromEntries(reports.map((r) => [r.id, r.status])) });
}
