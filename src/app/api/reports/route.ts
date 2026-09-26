import { prisma } from '@/lib/prisma';
import { trackingCode } from '@/lib/format';
import { getSession } from '@/lib/session';
import { MAX_DESCRIPTION, type SubmitResult } from '@/lib/types';

const MODES = ['metro', 'bus', 'brt'];
const CONTEXTS = ['in_station', 'on_vehicle', 'transfer_point'];
const SEVERITIES = ['low', 'medium', 'high'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HOURLY_LIMIT = 30;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

const str = (v: unknown, max = 100) => (typeof v === 'string' && v.length <= max ? v : null);
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

async function buildResult(id: string): Promise<SubmitResult> {
  const report = await prisma.report.findUniqueOrThrow({ where: { id }, include: { station: true } });
  let stationWeekCount: number | null = null;
  if (report.stationId) {
    stationWeekCount = await prisma.report.count({
      where: { stationId: report.stationId, createdAt: { gte: new Date(Date.now() - 7 * 864e5) } },
    });
  }
  return { id, trackingCode: trackingCode(id), stationName: report.station?.name ?? null, stationWeekCount };
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad('invalid json');
  }

  const id = str(body.id, 36);
  const reporterToken = str(body.reporterToken, 64);
  if (!id || !UUID_RE.test(id)) return bad('invalid id');
  if (!reporterToken || reporterToken.length < 8) return bad('invalid reporter token');

  // ارسال مجدد از صف آفلاین نباید گزارش تکراری بسازد
  if (await prisma.report.findUnique({ where: { id }, select: { id: true } })) {
    return Response.json(await buildResult(id));
  }

  const mode = str(body.mode);
  const vehicleContext = str(body.vehicleContext);
  const severity = str(body.severity) ?? 'medium';
  if (!mode || !MODES.includes(mode)) return bad('invalid mode');
  if (!vehicleContext || !CONTEXTS.includes(vehicleContext)) return bad('invalid vehicleContext');
  if (!SEVERITIES.includes(severity)) return bad('invalid severity');

  const subcategory = await prisma.subcategory.findUnique({ where: { id: str(body.subcategoryId) ?? '' } });
  if (!subcategory || subcategory.categoryId !== body.categoryId) return bad('invalid category');

  const lineId = str(body.lineId);
  const stationId = str(body.stationId);
  if (lineId && !(await prisma.line.findUnique({ where: { id: lineId }, select: { id: true } }))) return bad('invalid line');
  if (stationId && !(await prisma.station.findUnique({ where: { id: stationId }, select: { id: true } }))) return bad('invalid station');

  const recent = await prisma.report.count({
    where: { reporterToken, createdAt: { gte: new Date(Date.now() - 36e5) } },
  });
  if (recent >= HOURLY_LIMIT) return bad('rate limit', 429);

  const description = str(body.description, MAX_DESCRIPTION)?.trim() || null;
  const occurred = typeof body.occurredAt === 'string' ? new Date(body.occurredAt) : null;
  const occurredAt = occurred && !isNaN(+occurred) && +occurred <= Date.now() + 6e4 ? occurred : new Date();

  // دسته حساس: همیشه ناشناس و بدون مختصات دقیق (فقط سطح ایستگاه)
  const lat = subcategory.isSensitive ? null : num(body.lat);
  const lng = subcategory.isSensitive ? null : num(body.lng);

  const session = await getSession();

  await prisma.report.create({
    data: {
      id,
      mode,
      lineId,
      stationId,
      vehicleContext,
      categoryId: subcategory.categoryId,
      subcategoryId: subcategory.id,
      description,
      severity,
      lat,
      lng,
      occurredAt,
      isAnonymous: true,
      reporterToken,
      userId: session?.userId,
    },
  });

  return Response.json(await buildResult(id), { status: 201 });
}
