'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customPinIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #0284c7, #2563eb);
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2.5px solid #ffffff;
      box-shadow: 0 6px 14px rgba(2, 132, 199, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 9px; height: 9px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
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
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <div className="absolute left-3 right-3 top-3 z-[450] flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {Object.entries(grouped).slice(0, 5).map(([name, count]) => (
          <span key={name} className="shrink-0 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-xs font-black text-slate-800 shadow-md border border-slate-200/50">
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
            <Marker key={report.id} position={[report.lat, report.lng]} icon={customPinIcon}>
              <Popup>
                <div className="text-right font-sans p-1" dir="rtl">
                  <p className="font-black text-slate-900 text-sm leading-5">{report.category?.titleFa}</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{report.subcategory?.titleFa}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>ایستگاه:</span>
                    <span className="font-bold text-slate-800">{report.station?.name || 'نامشخص'}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
