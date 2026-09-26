import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { FileText, Map as MapIcon } from 'lucide-react';
import MapWrapper from './MapWrapper';
import { AppHeader } from '@/components/ui';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function MapPage() {
  // Fetch reports with coordinates
  const reports = await prisma.report.findMany({
    where: {
      lat: { not: null },
      lng: { not: null },
    },
    include: {
      category: true,
      subcategory: true,
      station: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 500, // Limit to 500 recent reports to avoid overloading the map
  });

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-50 overflow-hidden">
      <AppHeader
        title="نقشه توزیع گزارش‌ها"
        eyebrow={`${reports.length.toLocaleString('fa-IR')} نقطه غیرحساس`}
        icon={MapIcon}
        action={
          <Link
            href="/public/list"
            className="btn btn-secondary pressable gap-1 rounded-xl px-3 py-2 text-xs font-black"
          >
            <FileText size={15} /> فهرست
          </Link>
        }
      />

      <main className="relative z-0 flex-1 p-3 pb-20 overflow-hidden">
        <MapWrapper reports={reports} />
      </main>
    </div>
  );
}
