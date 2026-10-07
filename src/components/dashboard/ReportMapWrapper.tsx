'use client';

import dynamic from 'next/dynamic';
import type { MapReport } from './ReportMapComponent';

const MapComponent = dynamic(() => import('./ReportMapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-500 font-medium">
      در حال بارگذاری نقشه...
    </div>
  )
});

export default function MapWrapper({ reports }: { reports: MapReport[] }) {
  return <MapComponent reports={reports} />;
}
