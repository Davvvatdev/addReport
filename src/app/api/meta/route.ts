import { prisma } from '@/lib/prisma';
import type { Meta, Mode } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [categories, lines, stations] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { subcategories: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.line.findMany({ orderBy: { name: 'asc' } }),
    prisma.station.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const meta: Meta = {
    categories: categories.map((c) => ({
      id: c.id,
      titleFa: c.titleFa,
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        categoryId: s.categoryId,
        titleFa: s.titleFa,
        allowsPhoto: s.allowsPhoto,
        isSensitive: s.isSensitive,
      })),
    })),
    lines: lines.map((l) => ({ id: l.id, name: l.name, mode: l.mode as Mode, color: l.color })),
    stations: stations.map((s) => {
      let lineIds: string[] = [];
      try {
        lineIds = JSON.parse(s.lines);
      } catch {}
      return { id: s.id, name: s.name, lineIds, lat: s.lat, lng: s.lng, isInterchange: s.isInterchange };
    }),
  };

  return Response.json(meta);
}
