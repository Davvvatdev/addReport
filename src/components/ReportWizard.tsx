'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Camera, Check, ChevronLeft, Clock, CreditCard, Cog, Construction, Gift, Home, Loader2,
  MapPin, Megaphone, Pencil, Phone, Search, ShieldAlert, ShieldCheck, Sparkles, Train, Bus, TramFront, Trophy, X,
  type LucideIcon,
} from 'lucide-react';
import { db, type OfflineReport } from '@/lib/db';
import {
  cachedMeta, compressImage, distanceKm, getReporterToken, hasConsented, loadMeta, setConsented,
} from '@/lib/client';
import { normalizeFa, toFa, trackingCode } from '@/lib/format';
import { REPORTS_CHANGED, sendReport, syncPending } from '@/lib/sync';
import {
  MAX_DESCRIPTION, type Meta, type MetaStation, type Mode, type Severity, type SubmitResult,
  type VehicleContext,
} from '@/lib/types';
import { awardPointsForReport, Badge } from '@/lib/gamification';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  '1': Clock, '2': Cog, '3': Construction, '4': ShieldAlert, '5': Megaphone, '6': CreditCard, '7': Pencil,
};
const MODES: { id: Mode; label: string; icon: LucideIcon }[] = [
  { id: 'metro', label: 'مترو', icon: Train },
  { id: 'bus', label: 'اتوبوس', icon: Bus },
  { id: 'brt', label: 'بی‌آر‌تی', icon: TramFront },
];
const CONTEXTS: { id: VehicleContext; label: string }[] = [
  { id: 'in_station', label: 'در ایستگاه' },
  { id: 'on_vehicle', label: 'داخل وسیله' },
  { id: 'transfer_point', label: 'نقطه تبادل' },
];
const SEVERITIES: { id: Severity; label: string; cls: string }[] = [
  { id: 'low', label: 'کم', cls: 'border-emerald-600 bg-emerald-50 text-emerald-800' },
  { id: 'medium', label: 'متوسط', cls: 'border-amber-600 bg-amber-50 text-amber-800' },
  { id: 'high', label: 'زیاد', cls: 'border-rose-600 bg-rose-50 text-rose-800' },
];
const GEO_MAX_KM = 1.5;

const clean = (title: string) => title.replace(/[\p{Extended_Pictographic}️]/gu, '').trim();

interface Done {
  code: string;
  result: SubmitResult | null;
  sensitive: boolean;
  stationId: string | null;
  earnedReward?: {
    pointsEarned: number;
    newTotal: number;
    unlockedBadge?: Badge;
  };
}

export default function ReportWizard() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [metaFailed, setMetaFailed] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [mode, setMode] = useState<Mode>('metro');
  const [lineId, setLineId] = useState<string | null>(null);
  const [stationId, setStationId] = useState<string | null>(null);
  const [context, setContext] = useState<VehicleContext>('in_station');
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);

  const [severity, setSeverity] = useState<Severity>('medium');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [consented, setConsentedState] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // خواندن localStorage فقط سمت کلاینت ممکن است (بدون mismatch در hydration)
    const cached = cachedMeta();
    /* eslint-disable react-hooks/set-state-in-effect */
    if (cached) setMeta(cached);
    setConsentedState(hasConsented());
    /* eslint-enable react-hooks/set-state-in-effect */
    loadMeta().then((m) => (m ? setMeta(m) : !cached && setMetaFailed(true)));
  }, []);

  // تشخیص خودکار موقعیت — اگر اجازه ندهد یا در دسترس نباشد، انتخاب دستی کار می‌کند
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  const nearest = useMemo(() => {
    if (!meta || !coords) return null;
    let best: { station: MetaStation; km: number } | null = null;
    for (const s of meta.stations) {
      if (s.lat == null || s.lng == null) continue;
      const km = distanceKm(coords.lat, coords.lng, s.lat, s.lng);
      if (!best || km < best.km) best = { station: s, km };
    }
    return best && best.km <= GEO_MAX_KM ? best : null;
  }, [meta, coords]);

  const category = meta?.categories.find((c) => c.id === categoryId) ?? null;
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId) ?? null;
  const station = meta?.stations.find((s) => s.id === stationId) ?? null;
  const line = meta?.lines.find((l) => l.id === lineId) ?? null;
  const isOther = categoryId === '7';
  const canPhoto = !!subcategory?.allowsPhoto && !subcategory.isSensitive;

  const modeLines = useMemo(() => meta?.lines.filter((l) => l.mode === mode) ?? [], [meta, mode]);
  const stationList = useMemo(() => {
    if (!meta || mode !== 'metro') return [];
    const q = normalizeFa(query);
    
    // اگر نه خطی انتخاب شده و نه جستجویی انجام شده، لیست خالی بماند
    if (!lineId && !q) return [];
    
    let list = meta.stations.filter(
      (s) => (!lineId || s.lineIds.includes(lineId)) && (!q || normalizeFa(s.name).includes(q)),
    );
    if (coords) {
      const d = (s: MetaStation) => (s.lat != null && s.lng != null ? distanceKm(coords.lat, coords.lng, s.lat, s.lng) : 1e9);
      list = [...list].sort((a, b) => d(a) - d(b));
    }
    return list;
  }, [meta, mode, lineId, query, coords]);

  function pickStation(s: MetaStation | null) {
    setStationId(s?.id ?? null);
    if (s && !lineId && s.lineIds.length === 1) setLineId(s.lineIds[0]);
  }

  function confirmNearest() {
    if (!nearest) return;
    setMode('metro');
    pickStation(nearest.station);
    setStep(2);
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhotoBusy(true);
    try {
      setPhoto(await compressImage(file));
    } catch {
      setError('خواندن عکس ممکن نشد.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function submit() {
    if (!subcategory || !categoryId) return;
    setSubmitting(true);
    setError(null);
    const uuid = crypto.randomUUID();
    const now = new Date();
    const record: OfflineReport = {
      uuid,
      mode,
      lineId: lineId ?? undefined,
      stationId: stationId ?? undefined,
      vehicleContext: context,
      categoryId,
      subcategoryId: subcategory.id,
      description: description.trim() || undefined,
      photoData: canPhoto ? photo ?? undefined : undefined,
      // مختصات دقیق برای موارد حساس ذخیره نمی‌شود
      lat: subcategory.isSensitive ? undefined : coords?.lat,
      lng: subcategory.isSensitive ? undefined : coords?.lng,
      severity,
      isAnonymous: true,
      reporterToken: getReporterToken(),
      occurredAt: now,
      createdAt: now,
      syncStatus: 'pending',
    };
    try {
      record.id = await db.reports.add(record);
    } catch {
      setError('ذخیره گزارش روی دستگاه ممکن نشد. دوباره تلاش کنید.');
      setSubmitting(false);
      return;
    }
    window.dispatchEvent(new Event(REPORTS_CHANGED));
    setConsented();
    // اگر آنلاین باشیم همین‌جا کد و آمار ایستگاه را می‌گیریم؛ وگرنه در صف می‌ماند
    const result = await sendReport(record);
    if (result) void syncPending(); // آپلود عکس در پس‌زمینه

    // پاداش مشارکت شهروندی
    const hour = now.getHours();
    const rewardInfo = awardPointsForReport({
      hasPhoto: Boolean(canPhoto && photo),
      isNight: hour >= 20 || hour < 6,
    });

    setDone({
      code: trackingCode(uuid),
      result,
      sensitive: subcategory.isSensitive,
      stationId,
      earnedReward: {
        pointsEarned: rewardInfo.pointsEarned,
        newTotal: rewardInfo.newTotal,
        unlockedBadge: rewardInfo.unlockedBadge,
      },
    });
    setStep(4);
    setSubmitting(false);
  }

  function reset() {
    setStep(1); setLineId(null); setStationId(null); setQuery(''); setCategoryId(null);
    setSubcategoryId(null); setSeverity('medium'); setDescription(''); setPhoto(null); setDone(null);
    setContext('in_station'); setError(null);
  }

  function back() {
    if (step === 3) setStep(2);
    else if (step === 2) {
      if (subcategoryId || categoryId) { setSubcategoryId(null); setCategoryId(null); } else setStep(1);
    }
  }

  if (!meta) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center text-slate-500">
        {metaFailed ? (
          <>
            <p className="font-medium text-slate-700">برای بار اول به اینترنت نیاز است.</p>
            <p className="text-sm">پس از یک‌بار بارگذاری، ثبت گزارش بدون اینترنت هم کار می‌کند.</p>
            <button onClick={() => location.reload()} className="mt-2 min-h-12 rounded-xl bg-blue-600 px-6 font-bold text-white">
              تلاش دوباره
            </button>
          </>
        ) : (
          <Loader2 className="animate-spin" />
        )}
      </div>
    );
  }

  /* ───────────── مرحله ۴: تأیید ───────────── */
  if (step === 4 && done) {
    const { result } = done;
    return (
      <div className="flex flex-1 flex-col gap-5 p-5 pt-10 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-700/10">
          <Check size={44} strokeWidth={3} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold">ممنون، گزارش شما ثبت شد</h1>
          {!result && (
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              ثبت شد — در انتظار ارسال. با اتصال به اینترنت خودکار ارسال می‌شود.
            </p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">کد رهگیری</p>
          <p dir="ltr" className="mt-1 text-2xl font-bold tracking-widest text-slate-900">{done.code}</p>
        </div>

        {/* پاداش سکه و خدمات شهری */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 p-4 text-white shadow-lg shadow-sky-500/20 text-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-sm">
                🎉
              </span>
              <div>
                <p className="text-xs font-bold text-sky-100">پاداش مشارکت شهروندی</p>
                <p className="text-base font-black">+{toFa(done.earnedReward?.pointsEarned ?? 50)} سکه دریافت کردید!</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-sky-100">موجودی کل:</p>
              <p className="text-base font-black text-amber-300">{toFa(done.earnedReward?.newTotal ?? 1290)} سکه</p>
            </div>
          </div>

          {done.earnedReward?.unlockedBadge && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/20 p-2.5 text-xs font-bold text-amber-200 backdrop-blur-sm">
              <span className="text-lg">{done.earnedReward.unlockedBadge.icon}</span>
              <span>نشان جدید باز شد: «{done.earnedReward.unlockedBadge.title}»</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2.5 text-xs">
            <span className="text-sky-100">قابل تبدیل به شارژ کارت بلیت مترو و سینما</span>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 font-black text-white hover:bg-white/30 transition-colors"
            >
              <Gift size={13} />
              <span>جوایز و خدمات شهری</span>
            </Link>
          </div>
        </div>
        {result?.stationWeekCount != null && result.stationName && !done.sensitive && (
          <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-medium text-blue-900">
            <p>
              این <b>{toFa(result.stationWeekCount)}</b>‌امین گزارش از ایستگاه «{result.stationName}» در ۷ روز گذشته است.
            </p>
            {done.stationId && (
              <Link href={`/public/list?station=${done.stationId}`} className="block w-full rounded-lg bg-blue-600 py-2.5 text-center font-bold text-white shadow-sm active:bg-blue-700">
                مشاهده وضعیت این ایستگاه
              </Link>
            )}
          </div>
        )}
        {done.sensitive && (
          <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-right">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <ShieldCheck size={20} /> شما تنها نیستید
            </div>
            <p className="text-sm leading-7 text-rose-900">
              گزارش شما کاملاً ناشناس ثبت شد. اگر همین حالا در خطر هستید یا به کمک نیاز دارید، تماس بگیرید:
            </p>
            <ul className="space-y-2 text-sm">
              {[['۱۱۰', '110', 'پلیس'], ['۱۲۳', '123', 'اورژانس اجتماعی'], ['۱۱۵', '115', 'اورژانس']].map(([fa, n, t]) => (
                <li key={n}>
                  <a href={`tel:${n}`} className="flex min-h-12 items-center justify-between rounded-lg bg-white px-4 font-medium text-rose-900">
                    <span>{t}</span>
                    <span className="flex items-center gap-2 font-bold"><Phone size={16} />{fa}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-2 flex flex-col gap-3">
          {done.stationId && result && !done.sensitive && (
            <Link href={`/public/list?station=${done.stationId}`} className="flex min-h-14 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">
              مشاهده گزارش‌های این ایستگاه
            </Link>
          )}
          <button onClick={reset} className="min-h-14 rounded-xl bg-blue-600 font-bold text-white">ثبت گزارش دیگر</button>
          <Link href="/" className="flex min-h-12 items-center justify-center gap-2 text-slate-600"><Home size={18} /> صفحه اصلی</Link>
        </div>
      </div>
    );
  }

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="flex items-center gap-2 px-3 py-2">
          {step > 1 && !submitting ? (
            <button onClick={back} aria-label="بازگشت" className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-slate-100"><ArrowRight size={22} /></button>
          ) : (
            <div className="w-11" /> /* Spacer to keep title centered if needed, or just nothing */
          )}
          <h1 className="flex-1 text-lg font-bold">
            {step === 1 ? 'کجا هستید؟' : step === 2 ? (category ? clean(category.titleFa) : 'چه مشکلی؟') : 'جزئیات'}
          </h1>
          <span className="pl-2 text-sm text-slate-500">مرحله {toFa(step)} از {toFa(3)}</span>
        </div>
        <div className="h-1 bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="flex items-center justify-between bg-sky-50 px-4 py-1.5 text-[11px] font-bold text-sky-800 border-b border-sky-100/80">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            ثبت این گزارش = ۵۰ سکه شهروندی (تبدیل به خدمات شهری)
          </span>
          <Link href="/profile" className="text-sky-600 hover:underline shrink-0">
            مشاهده جوایز
          </Link>
        </div>
      </header>

      {/* ───────────── مرحله ۱: موقعیت ───────────── */}
      {step === 1 && (
        <div className="flex flex-1 flex-col gap-5 p-4">
          {nearest && (
            <button
              onClick={confirmNearest}
              className="flex min-h-16 items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-right text-white shadow-lg shadow-blue-600/25 active:bg-blue-700"
            >
              <MapPin size={26} className="shrink-0" />
              <span className="flex-1">
                <span className="block text-xs text-blue-100">نزدیک‌ترین ایستگاه به شما</span>
                <span className="block text-lg font-bold">{nearest.station.name}</span>
              </span>
              <span className="text-sm font-bold">همین‌جاست ←</span>
            </button>
          )}

          <section>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setLineId(null); setStationId(null); setQuery(''); }}
                  aria-pressed={mode === id}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-bold shadow-sm ${mode === id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-[var(--border)] bg-white text-slate-700'}`}
                >
                  <Icon size={22} />{label}
                </button>
              ))}
            </div>
          </section>

          {modeLines.length > 0 && (
            <section className="flex flex-wrap gap-2">
              {modeLines.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setLineId(lineId === l.id ? null : l.id); setStationId(null); }}
                  aria-pressed={lineId === l.id}
                  className={`flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold ${lineId === l.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-[var(--border)] bg-white text-slate-700'}`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: l.color ?? '#94a3b8' }} />{l.name}
                </button>
              ))}
            </section>
          )}

          {mode === 'metro' ? (
            <section className="space-y-2">
              <label className="relative block">
                <Search size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجوی ایستگاه…"
                  className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white pr-10 pl-3 text-base outline-none focus:border-blue-500"
                />
              </label>
              <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-[var(--border)] bg-white shadow-sm">
                {stationList.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => pickStation(stationId === s.id ? null : s)}
                      aria-pressed={stationId === s.id}
                      className={`flex min-h-12 w-full items-center justify-between px-4 text-right ${stationId === s.id ? 'bg-blue-50 font-bold text-blue-700' : ''}`}
                    >
                      <span>
                        {s.name}
                        {s.isInterchange && <span className="mr-2 text-xs text-slate-400">تبادلی</span>}
                        {!lineId && query && <span className="mr-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{meta.lines.filter(l => s.lineIds.includes(l.id)).map(l => l.name).join('، ')}</span>}
                      </span>
                      {stationId === s.id && <Check size={18} />}
                    </button>
                  </li>
                ))}
                {stationList.length === 0 && (
                  <li className="p-4 text-center text-sm text-slate-500">
                    {!lineId && !query ? 'لطفاً یک خط را انتخاب کنید یا نام ایستگاه را جستجو کنید.' : 'ایستگاهی پیدا نشد'}
                  </li>
                )}
              </ul>
            </section>
          ) : (
            <p className="rounded-lg border border-[var(--border)] bg-white p-3 text-sm text-slate-600">
              فهرست ایستگاه‌های اتوبوس و بی‌آر‌تی هنوز اضافه نشده؛ می‌توانید رد شوید و مشکل را ثبت کنید.
            </p>
          )}

          <section>
            <p className="mb-2 text-sm font-medium text-slate-600">کجای مسیر؟</p>
            <div className="grid grid-cols-3 gap-2">
              {CONTEXTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContext(c.id)}
                  aria-pressed={context === c.id}
                  className={`min-h-12 rounded-xl border-2 text-sm font-bold ${context === c.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-[var(--border)] bg-white text-slate-700'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <div className="mt-auto flex gap-3 pt-2">
            <button
              onClick={() => { setStationId(null); setLineId(null); setStep(2); }}
              className="min-h-14 flex-1 rounded-xl border-2 border-[var(--border)] bg-white font-bold text-slate-600"
            >
              نمی‌دانم / رد کردن
            </button>
            <button onClick={() => setStep(2)} disabled={!stationId} className="min-h-14 flex-[1.4] rounded-xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-600/20 disabled:opacity-40">
              ادامه
            </button>
          </div>
        </div>
      )}

      {/* ───────────── مرحله ۲: مشکل ───────────── */}
      {step === 2 && (
        <div className="flex flex-1 flex-col gap-3 p-4">
          {!category ? (
            <div className="grid grid-cols-2 gap-3">
              {meta.categories.map((c) => {
                const Icon = CATEGORY_ICONS[c.id] ?? Pencil;
                const sensitive = c.subcategories.some((s) => s.isSensitive);
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      // «سایر» فقط یک زیرمسئله دارد؛ مستقیم به جزئیات می‌رویم
                      if (c.subcategories.length === 1) { setSubcategoryId(c.subcategories[0].id); setStep(3); }
                    }}
                    className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-xl border-2 p-3 text-center font-bold shadow-sm active:scale-[0.98] ${sensitive ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-[var(--border)] bg-white text-slate-800'}`}
                  >
                    <Icon size={34} className={sensitive ? 'text-rose-600' : 'text-blue-600'} />
                    <span className="text-sm leading-6">{clean(c.titleFa)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <ul className="space-y-2">
              {category.subcategories.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => { setSubcategoryId(s.id); setStep(3); }}
                    className="flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-right font-bold shadow-sm active:bg-blue-50"
                  >
                    <span className="flex-1 leading-6">{s.titleFa}</span>
                    {s.isSensitive && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">ناشناس</span>}
                    <ChevronLeft size={18} className="shrink-0 text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ───────────── مرحله ۳: جزئیات ───────────── */}
      {step === 3 && subcategory && (
        <div className="flex flex-1 flex-col gap-5 p-4">
          <div className="space-y-1 rounded-lg border border-[var(--border)] bg-white p-3 text-sm shadow-sm">
            <p className="font-bold text-slate-900">{subcategory.titleFa}</p>
            <p className="text-slate-600">
              {station ? station.name : 'ایستگاه نامشخص'}
              {line ? ` · ${line.name}` : ''} · {CONTEXTS.find((c) => c.id === context)?.label}
            </p>
          </div>

          {subcategory.isSensitive && (
            <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-7 text-rose-900">
              <ShieldCheck size={20} className="mt-1 shrink-0" />
              این گزارش کاملاً ناشناس است. عکس گرفته نمی‌شود و در نمای عمومی فقط به‌صورت آمار تجمیعی دیده می‌شود.
            </div>
          )}

          {canPhoto && (
            <section>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = ''; }}
              />
              {photo ? (
                <div className="relative overflow-hidden rounded-lg border border-[var(--border)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt="عکس پیوست" className="max-h-56 w-full object-cover" />
                  <button onClick={() => setPhoto(null)} aria-label="حذف عکس" className="absolute left-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={photoBusy}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white font-bold text-slate-700"
                >
                  {photoBusy ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                  افزودن عکس <span className="text-xs text-slate-400">(اختیاری — لطفاً از افراد عکس نگیرید)</span>
                </button>
              )}
            </section>
          )}

          <section>
            <p className="mb-2 text-sm font-medium text-slate-600">شدت مشکل</p>
            <div className="grid grid-cols-3 gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeverity(s.id)}
                  aria-pressed={severity === s.id}
                  className={`min-h-14 rounded-xl border-2 font-bold ${severity === s.id ? s.cls : 'border-[var(--border)] bg-white text-slate-600'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {isOther ? (
            <DescriptionField value={description} onChange={setDescription} label="توضیح دهید" />
          ) : (
            <details className="rounded-lg border border-[var(--border)] bg-white">
              <summary className="min-h-12 cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-600">افزودن توضیح (اختیاری)</summary>
              <div className="px-3 pb-3"><DescriptionField value={description} onChange={setDescription} /></div>
            </details>
          )}

          {!consented && (
            <p className="text-xs leading-6 text-slate-500">
              با ثبت گزارش، می‌پذیرید که گزارش شما بدون هیچ اطلاعات هویتی به‌صورت عمومی منتشر شود.{' '}
              <Link href="/privacy" className="text-blue-600 underline">حریم خصوصی</Link>
            </p>
          )}
          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}

          <button
            onClick={submit}
            disabled={submitting || photoBusy || (isOther && !description.trim())}
            className="mt-auto flex min-h-16 items-center justify-center gap-2 rounded-xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-600/30 active:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" /> : 'ثبت'}
          </button>
        </div>
      )}
    </div>
  );
}

function DescriptionField({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-medium text-slate-600">{label}</span>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX_DESCRIPTION))}
        rows={3}
        className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-base outline-none focus:border-blue-500"
      />
      <span className="mt-1 block text-left text-xs text-slate-400">{toFa(value.length)} / {toFa(MAX_DESCRIPTION)}</span>
    </label>
  );
}
