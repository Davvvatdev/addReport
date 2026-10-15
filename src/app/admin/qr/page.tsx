import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import QRCode from 'qrcode';
import { QrCode } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AppHeader, Notice, Surface } from '@/components/ui';

export const dynamic = 'force-dynamic';

/** برگهٔ QR ایستگاه‌ها: اسکن، گزارش را با همان خط و ایستگاه از پیش پر می‌کند */
export default async function QrPage({ searchParams }: { searchParams: Promise<{ line?: string }> }) {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  const { line: lineId } = await searchParams;

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  const origin = `${proto}://${host}`;

  const lines = await prisma.line.findMany({ orderBy: { name: 'asc' } });
  const line = lines.find((l) => l.id === lineId) ?? null;

  const orderOf = (raw: string, id: string) => {
    try { return (JSON.parse(raw) as Record<string, number>)[id] ?? 999; } catch { return 999; }
  };
  const stations = line
    ? (await prisma.station.findMany())
        .filter((s) => { try { return (JSON.parse(s.lines) as string[]).includes(line.id); } catch { return false; } })
        .sort((a, b) => orderOf(a.lineOrders, line.id) - orderOf(b.lineOrders, line.id))
    : [];
  const items = await Promise.all(
    stations.map(async (s) => {
      const url = `${origin}/report?station=${s.id}&line=${line!.id}`;
      return { id: s.id, name: s.name, url, svg: await QRCode.toString(url, { type: 'svg', margin: 1, width: 160 }) };
    }),
  );

  return (
    <main className="app-bg min-h-screen">
      <AppHeader title="QR ایستگاه‌ها" eyebrow="ثبت گزارش با یک اسکن" icon={QrCode} backHref="/admin" />
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4 pb-24">
        <Surface className="p-4 print:hidden">
          <form action="/admin/qr" className="flex gap-2">
            <select
              name="line"
              defaultValue={lineId ?? ''}
              aria-label="خط"
              className="min-h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-medium"
            >
              <option value="">یک خط را انتخاب کنید</option>
              {lines.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <button className="btn btn-primary pressable min-h-12 px-5">نمایش</button>
          </form>
          <p className="mt-2 text-xs leading-6 text-slate-500">
            برای چاپ، از چاپ مرورگر استفاده کنید. هر QR به آدرس ثبت گزارش همان ایستگاه و خط می‌رود.
          </p>
        </Surface>

        {line && items.length === 0 && <Notice tone="warning">برای این خط ایستگاهی ثبت نشده است.</Notice>}

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
          {items.map((it) => (
            <li key={it.id} className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-3 text-center">
              <div className="mx-auto w-32" dangerouslySetInnerHTML={{ __html: it.svg }} />
              <p className="mt-2 text-sm font-black text-slate-900">{it.name}</p>
              <p className="text-[11px] text-slate-500">{line?.name}</p>
              <p className="mt-1 text-[10px] font-bold text-slate-400">اسکن کنید و مشکل را گزارش دهید</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
