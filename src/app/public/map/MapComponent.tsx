'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface MapReport {
  id: string;
  lat: number | null;
  lng: number | null;
  category?: { titleFa: string } | null;
  subcategory?: { titleFa: string } | null;
  station?: { name: string } | null;
}

export default function MapComponent({ reports }: { reports: MapReport[] }) {
  const position: [number, number] = [35.6997, 51.3380];

  const grouped = reports.reduce<Record<string, number>>((acc, report) => {
    const key = report.category?.titleFa ?? 'نامشخص';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative h-full overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <div className="absolute left-3 right-3 top-3 z-[450] flex gap-2 overflow-x-auto scrollbar-none">
        {Object.entries(grouped).slice(0, 5).map(([name, count]) => (
          <span key={name} className="shrink-0 rounded-full bg-white/95 px-3 py-2 text-xs font-extrabold text-slate-800 shadow">
            {name.replace(/[\p{Extended_Pictographic}️]/gu, '').trim()} · {count.toLocaleString('fa-IR')}
          </span>
        ))}
      </div>
      <MapContainer center={position} zoom={12} scrollWheelZoom={true} className="z-0 h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {reports.map((report) => {
        if (!report.lat || !report.lng) return null;
        
        return (
          <Marker key={report.id} position={[report.lat, report.lng]} icon={icon}>
            <Popup>
              <div className="text-right font-sans" dir="rtl">
                <p className="font-bold text-slate-800">{report.category?.titleFa}</p>
                <p className="text-sm text-slate-600">{report.subcategory?.titleFa}</p>
                <p className="text-xs text-slate-400 mt-2">
                  ایستگاه: {report.station?.name || 'نامشخص'}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
      </MapContainer>
    </div>
  );
}
