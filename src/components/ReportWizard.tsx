'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Camera, Check, ChevronLeft, Clock, CreditCard, Cog, Construction, Gift, Home, Loader2,
  MapPin, Megaphone, Pencil, Phone, Search, ShieldAlert, ShieldCheck, Sparkles, Train, TramFront, Trophy, X,
  ClipboardList,
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
import { Notice } from '@/components/ui';
import { ACCESS_NEEDS, GENDERS, IMPACTS, RIDER_TYPES, TRIP_PURPOSES, lineTermini, type Impact } from '@/lib/report-meta';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  '1': Clock, '2': Cog, '3': Construction, '4': ShieldAlert, '5': Megaphone, '6': CreditCard, '7': Pencil,
};

const CATEGORY_STYLES: Record<string, { bg: string; border: string; edge: string; iconBg: string; iconColor: string }> = {
  '1': { bg: 'bg-amber-50/80', border: 'border-amber-200', edge: '[--edge:#fcd34d]', iconBg: 'bg-amber-100', iconColor: 'text-amber-700' },
  '2': { bg: 'bg-blue-50/80', border: 'border-blue-200', edge: '[--edge:#93c5fd]', iconBg: 'bg-blue-100', iconColor: 'text-blue-700' },
  '3': { bg: 'bg-emerald-50/80', border: 'border-emerald-200', edge: '[--edge:#6ee7b7]', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-700' },
  '4': { bg: 'bg-rose-50/80', border: 'border-rose-200', edge: '[--edge:#fda4af]', iconBg: 'bg-rose-100', iconColor: 'text-rose-700' },
  '5': { bg: 'bg-sky-50/80', border: 'border-sky-200', edge: '[--edge:#7dd3fc]', iconBg: 'bg-sky-100', iconColor: 'text-sky-700' },
  '6': { bg: 'bg-teal-50/80', border: 'border-teal-200', edge: '[--edge:#5eead4]', iconBg: 'bg-teal-100', iconColor: 'text-teal-700' },
  '7': { bg: 'bg-slate-50', border: 'border-slate-200', edge: '[--edge:#cbd5e1]', iconBg: 'bg-slate-200', iconColor: 'text-slate-700' },
};
const MODES: { id: Mode; label: string; icon: LucideIcon }[] = [
  { id: 'metro', label: 'مترو', icon: Train },
  { id: 'brt', label: 'بی‌آر‌تی', icon: TramFront },
];
const CONTEXTS: { id: VehicleContext; label: string }[] = [
  { id: 'in_station', label: 'در ایستگاه' },
  { id: 'on_vehicle', label: 'داخل وسیله' },
  { id: 'transfer_point', label: 'نقطه تبادل' },
];
const SEVERITIES: { id: Severity; label: string; activeCls: string; inactiveCls: string }[] = [
  { id: 'low', label: 'کم', activeCls: 'border-emerald-500 bg-emerald-500 text-white font-black [--edge:#047857]', inactiveCls: 'border-emerald-200 bg-white text-emerald-800 font-bold [--edge:#6ee7b7]' },
  { id: 'medium', label: 'متوسط', activeCls: 'border-amber-500 bg-amber-500 text-white font-black [--edge:#b45309]', inactiveCls: 'border-amber-200 bg-white text-amber-800 font-bold [--edge:#fcd34d]' },
  { id: 'high', label: 'زیاد', activeCls: 'border-rose-500 bg-rose-500 text-white font-black [--edge:#be123c]', inactiveCls: 'border-rose-200 bg-white text-rose-800 font-bold [--edge:#fda4af]' },
  { id: 'critical', label: 'بحرانی', activeCls: 'border-red-800 bg-red-800 text-white font-black [--edge:#450a0a]', inactiveCls: 'border-red-300 bg-white text-red-900 font-bold [--edge:#fca5a5]' },
];
const WHEN: { id: string; label: string; minutes: number }[] = [
  { id: 'now', label: 'همین الان', minutes: 0 },
  { id: '10m', label: '۱۰ دقیقه پیش', minutes: 10 },
  { id: '1h', label: 'یک ساعت پیش', minutes: 60 },
  { id: 'today', label: 'امروز، زودتر', minutes: 180 },
  { id: 'yesterday', label: 'دیروز', minutes: 1440 },
];
const TRIP_KEY = 'trip_ctx_v1';
type TripContext = { riderType?: string; tripPurpose?: string; accessNeed?: string; gender?: string };
const loadTrip = (): TripContext => {
  try { return JSON.parse(localStorage.getItem(TRIP_KEY) ?? '{}'); } catch { return {}; }
};
const saveTrip = (t: TripContext) => {
  try { localStorage.setItem(TRIP_KEY, JSON.stringify(t)); } catch {}
};
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
  const [direction, setDirection] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);

  const [severity, setSeverity] = useState<Severity>('medium');
  const [impact, setImpact] = useState<Impact | null>(null);
  const [when, setWhen] = useState('now');
  const [trip, setTrip] = useState<TripContext>({});
  const [agreed, setAgreed] = useState(false);
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
    setTrip(loadTrip());
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

  // مسائل بر اساس وسیله‌ی انتخاب‌شده (مترو یا اتوبوس/بی‌آر‌تی) فیلتر می‌شوند
  const categories = useMemo(
    () => (meta?.categories ?? []).map((c) => ({
      ...c,
      subcategories: c.subcategories.filter((s) => !s.modes || s.modes.includes(mode)),
    })).filter((c) => c.subcategories.length > 0),
    [meta, mode],
  );
  const category = categories.find((c) => c.id === categoryId) ?? null;
  const subcategory = category?.subcategories.find((s) => s.id === subcategoryId) ?? null;
  const station = meta?.stations.find((s) => s.id === stationId) ?? null;
  const line = meta?.lines.find((l) => l.id === lineId) ?? null;
  const isOther = !!subcategory?.isOther || categoryId === '7';
  const canPhoto = !!subcategory?.allowsPhoto && !subcategory.isSensitive;

  const modeLines = useMemo(() => meta?.lines.filter((l) => l.mode === mode) ?? [], [meta, mode]);
  const stationList = useMemo(() => {
    if (!meta || modeLines.length === 0) return [];
    const modeLineIds = new Set(modeLines.map((l) => l.id));
    const q = normalizeFa(query);
    
    // اگر نه خطی انتخاب شده و نه جستجویی انجام شده، لیست خالی بماند
    if (!lineId && !q) return [];
    
    let list = meta.stations.filter(
      (s) =>
        s.lineIds.some((id) => modeLineIds.has(id)) &&
        (!lineId || s.lineIds.includes(lineId)) &&
        (!q || normalizeFa(s.name).includes(q)),
    );
    // فقط زمانی بر اساس فاصله مرتب شود که خط خاصی انتخاب نشده و جستجو انجام نشده است
    if (coords && !lineId && !q) {
      const d = (s: MetaStation) => (s.lat != null && s.lng != null ? distanceKm(coords.lat, coords.lng, s.lat, s.lng) : 1e9);
      list = [...list].sort((a, b) => d(a) - d(b));
    } else if (lineId && !q) {
      // Sort strictly by the station's position in this specific line
      list = [...list].sort((a, b) => {
        const orderA = a.lineOrders?.[lineId] ?? 999;
        const orderB = b.lineOrders?.[lineId] ?? 999;
        return orderA - orderB;
      });
    }
    return list;
  }, [meta, modeLines, lineId, query, coords]);
  const termini = line ? lineTermini(line.name) : [];

  function pickStation(s: MetaStation | null) {
    setStationId(s?.id ?? null);
    if (s && !lineId && s.lineIds.length === 1) { setLineId(s.lineIds[0]); setDirection(null); }
  }

  function updateTrip(key: keyof TripContext, value: string) {
    const next = { ...trip, [key]: trip[key] === value ? undefined : value };
    setTrip(next);
    saveTrip(next);
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
    const occurredAt = new Date(now.getTime() - (WHEN.find((w) => w.id === when)?.minutes ?? 0) * 60_000);
    const record: OfflineReport = {
      uuid,
      mode,
      lineId: lineId ?? undefined,
      stationId: stationId ?? undefined,
      direction: direction ?? undefined,
      vehicleContext: context,
      categoryId,
      subcategoryId: subcategory.id,
      description: description.trim() || undefined,
      photoData: canPhoto ? photo ?? undefined : undefined,
      // مختصات دقیق برای موارد حساس ذخیره نمی‌شود
      lat: subcategory.isSensitive ? undefined : coords?.lat,
      lng: subcategory.isSensitive ? undefined : coords?.lng,
      severity,
      impact: impact ?? undefined,
      riderType: trip.riderType,
      tripPurpose: trip.tripPurpose,
      accessNeed: trip.accessNeed,
      gender: trip.gender,
      isAnonymous: true,
      reporterToken: getReporterToken(),
      occurredAt,
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
    const localReports = await db.reports.orderBy('createdAt').toArray();
    const rewardInfo = awardPointsForReport({
      hasPhoto: Boolean(canPhoto && photo),
      isNight: hour >= 20 || hour < 6,
      reports: localReports,
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
    setContext('in_station'); setError(null); setDirection(null); setImpact(null); setWhen('now');
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
            <button onClick={() => location.reload()} className="btn btn-primary pressable mt-2 min-h-12 px-6">
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
            <Notice tone="warning" className="mt-2 text-right">
              ثبت شد — در انتظار ارسال. با اتصال به اینترنت خودکار ارسال می‌شود.
            </Notice>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">کد رهگیری</p>
          <p dir="ltr" className="mt-1 text-2xl font-bold tracking-widest text-slate-900">{done.code}</p>
          <Link href={`/track?code=${done.code}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 underline underline-offset-4">
            <ClipboardList size={16} /> پیگیری وضعیت رسیدگی
          </Link>
          <p className="mt-1 text-xs text-slate-400">این کد را نگه دارید؛ در «پروفایل ← گزارش‌های من» هم هست.</p>
        </div>

        {/* پاداش سکه و خدمات شهری */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-right text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-amber-300">
                <Trophy size={24} />
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
            <span className="text-sky-100">سکه‌ها در نسخه آزمایشی نمایشی‌اند و هنوز قابل تبدیل نیستند</span>
            <Link
              href="/profile"
              className="btn pressable shrink-0 gap-1 rounded-lg bg-white px-2.5 py-1 font-black text-blue-700 [--edge:#1e3a8a]"
            >
              <Gift size={13} />
              <span>جوایز و خدمات شهری</span>
            </Link>
          </div>
        </div>
        {result?.stationWeekCount != null && result.stationName && !done.sensitive && (
          <Notice tone="info" className="text-right text-sm font-medium">
            <p>
              این <b>{toFa(result.stationWeekCount)}</b>‌امین گزارش از ایستگاه «{result.stationName}» در ۷ روز گذشته است.
            </p>
            {done.stationId && (
            <Link href={`/public/list?station=${done.stationId}`} className="btn btn-primary pressable mt-3 w-full py-2.5">
                مشاهده وضعیت این ایستگاه
              </Link>
            )}
          </Notice>
        )}
        {done.sensitive && (
          <Notice tone="danger" icon={ShieldCheck} title="شما تنها نیستید" className="text-right">
            <p className="text-sm leading-7">
              گزارش شما کاملاً ناشناس ثبت شد. اگر همین حالا در خطر هستید یا به کمک نیاز دارید، تماس بگیرید:
            </p>
            <ul className="mt-3 space-y-2.5 text-sm">
              {[['۱۱۰', '110', 'پلیس'], ['۱۲۳', '123', 'اورژانس اجتماعی'], ['۱۱۵', '115', 'اورژانس']].map(([fa, n, t]) => (
                <li key={n}>
                  <a href={`tel:${n}`} className="btn btn-danger pressable min-h-12 w-full justify-between px-4">
                    <span>{t}</span>
                    <span className="flex items-center gap-2 font-bold"><Phone size={16} />{fa}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Notice>
        )}
        <div className="mt-2 flex flex-col gap-3">
          {done.stationId && result && !done.sensitive && (
          <Link href={`/public/list?station=${done.stationId}`} className="btn btn-dark pressable min-h-14">
              مشاهده گزارش‌های این ایستگاه
            </Link>
          )}
          <button onClick={reset} className="btn btn-primary pressable min-h-14">ثبت گزارش دیگر</button>
          <Link href="/" className="flex min-h-12 items-center justify-center gap-2 text-slate-600 underline underline-offset-4"><Home size={18} /> صفحه اصلی</Link>
        </div>
      </div>
    );
  }

  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  const stepTitle = step === 1 ? 'کجا هستید؟' : step === 2 ? (category ? clean(category.titleFa) : 'چه مشکلی؟') : 'جزئیات';
  const wizardSteps = [
    { id: 1, label: 'موقعیت' },
    { id: 2, label: 'مشکل' },
    { id: 3, label: 'جزئیات' },
  ] as const;

  function goToStep(target: 1 | 2 | 3) {
    if (submitting || target >= step) return;
    setError(null);
    setStep(target);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex min-h-14 items-center gap-2 px-3 py-1.5">
          {step > 1 && !submitting ? (
            <button onClick={back} aria-label="بازگشت" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 active:bg-slate-100"><ArrowRight size={22} /></button>
          ) : (
            <span className="h-11 w-11 shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-lg font-extrabold leading-6">{stepTitle}</h1>
            <p className="text-xs font-medium text-slate-500">مرحله {toFa(step)} از {toFa(3)}</p>
          </div>
          <span className="w-11 shrink-0" aria-hidden />
        </div>
        <div className="border-t border-slate-100 bg-white px-4 py-2.5">
          <div className="relative grid grid-cols-3 gap-2" aria-label="مراحل ثبت گزارش">
            <span className="absolute inset-x-[12%] top-3 h-0.5 bg-slate-200" aria-hidden />
            <span className="absolute right-[12%] top-3 h-0.5 bg-blue-600 transition-all" style={{ width: `${Math.max(0, progress - 33)}%` }} aria-hidden />
            {wizardSteps.map((item) => {
              const active = step === item.id;
              const completed = step > item.id;
              const canReturn = completed && !submitting;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToStep(item.id)}
                  disabled={!canReturn && !active}
                  aria-current={active ? 'step' : undefined}
                  className={`relative z-10 flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-extrabold transition ${
                    active
                      ? 'text-blue-700'
                      : completed
                        ? 'text-slate-700 active:bg-slate-100'
                        : 'text-slate-300'
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : completed
                        ? 'border border-blue-200 bg-blue-50 text-blue-700'
                        : 'border border-slate-200 bg-slate-50 text-slate-400'
                  }`}>
                    {completed ? <Check size={13} strokeWidth={3} aria-hidden /> : toFa(item.id)}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="notice notice-info items-center justify-between rounded-none border-b border-blue-100 px-4 py-1.5 text-[11px] font-bold">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-500 shrink-0" />
            ثبت این گزارش = ۵۰ سکه شهروندی (نمایشی)
          </span>
          <Link href="/profile" className="shrink-0 font-black text-blue-700 underline underline-offset-4">
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
              className="btn btn-primary pressable min-h-16 justify-start gap-3 px-4 py-3 text-right font-normal"
            >
              <MapPin size={26} className="shrink-0" />
              <span className="flex-1">
                <span className="block text-xs text-blue-100">نزدیک‌ترین ایستگاه به شما</span>
                <span className="block text-lg font-bold">{nearest.station.name}</span>
              </span>
              <span className="text-sm font-bold">همین‌جاست ←</span>
            </button>
          )}

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-800">نوع مسیر</p>
              <span className="text-xs text-slate-500">یک گزینه را انتخاب کنید</span>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm shadow-slate-200/50">
              {MODES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setLineId(null); setStationId(null); setQuery(''); setDirection(null); }}
                  aria-pressed={mode === id}
                  className={`pressable flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm font-black transition ${
                    mode === id
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20 [--edge:#1e40af]'
                      : 'border-transparent bg-transparent text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>

          {modeLines.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-800">خط را انتخاب کنید</p>
                  <p className="mt-1 text-xs text-slate-500">خط نزدیک به مسیرتان را بزنید</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-200 px-2 py-1 text-[11px] font-bold text-slate-600">
                  {MODES.find((m) => m.id === mode)?.label}
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/40">
                <div className="max-h-52 divide-y divide-slate-100 overflow-y-auto">
                  {modeLines.map((l) => {
                    const active = lineId === l.id;
                    const stops = lineTermini(l.name);
                    return (
                      <button
                        key={l.id}
                        title={l.name}
                        onClick={() => { setLineId(active ? null : l.id); setStationId(null); setDirection(null); }}
                        aria-pressed={active}
                        className={`pressable flex min-h-12 w-full items-center gap-3 px-3 text-right text-xs font-bold transition ${
                          active ? 'bg-blue-50 text-blue-800 [--edge:#1e40af]' : 'bg-white text-slate-800 [--edge:#cbd5e1] hover:bg-slate-50'
                        }`}
                      >
                        <span className="h-3 w-3 shrink-0 rounded-full shadow-sm ring-2 ring-white" style={{ background: l.color ?? '#94a3b8' }} />
                        <span className="min-w-0 flex-1 truncate">
                          {stops.length === 2 ? (
                            <>
                              {l.name.split(/\s+/).slice(0, 2).join(' ')}
                              <span className={`font-normal ${active ? 'text-blue-700' : 'text-slate-500'}`}> {stops[0]} تا {stops[1]}</span>
                            </>
                          ) : (
                            l.name
                          )}
                        </span>
                        {active ? <Check size={16} className="shrink-0 text-blue-700" aria-hidden /> : <ChevronLeft size={16} className="shrink-0 text-slate-400" aria-hidden />}
                      </button>
                    );
                  })}
                </div>
                <div className={`border-t p-3 ${lineId ? 'border-blue-100 bg-blue-50/60' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-black text-slate-700">
                      {line ? `ایستگاه ${line.name.split(/\s+/).slice(0, 2).join(' ')}` : 'ایستگاه را پیدا کنید'}
                    </p>
                    {lineId && (
                      <button
                        type="button"
                        onClick={() => { setLineId(null); setStationId(null); setDirection(null); setQuery(''); }}
                        className="shrink-0 text-xs font-bold text-blue-700 underline underline-offset-4"
                      >
                        پاک کردن
                      </button>
                    )}
                  </div>
                  <label className="relative block">
                    <Search size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="جستجوی ایستگاه…"
                      className="min-h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-3 text-base outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                  <ul className="mt-2 max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                    {stationList.map((s) => (
                      <li key={s.id}>
                        <button
                          onClick={() => pickStation(stationId === s.id ? null : s)}
                          aria-pressed={stationId === s.id}
                          className={`flex min-h-11 w-full items-center justify-between gap-3 px-3 text-right text-sm ${stationId === s.id ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'}`}
                        >
                          <span className="min-w-0 truncate">
                            {s.name}
                            {s.isInterchange && <span className="mr-2 text-xs text-slate-400">تبادلی</span>}
                            {!lineId && query && <span className="mr-2 text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{meta.lines.filter(l => s.lineIds.includes(l.id)).map(l => l.name).join('، ')}</span>}
                          </span>
                          {stationId === s.id && <Check size={18} className="shrink-0" />}
                        </button>
                      </li>
                    ))}
                    {stationList.length === 0 && (
                      <li className="p-4 text-center text-sm text-slate-500">
                        {!lineId && !query ? 'لطفاً یک خط را انتخاب کنید یا نام ایستگاه را جستجو کنید.' : 'ایستگاهی پیدا نشد'}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {modeLines.length === 0 && (
            <Notice tone="neutral" className="text-sm">
              فهرست خطوط و ایستگاه‌های این گزینه هنوز اضافه نشده؛ می‌توانید رد شوید و مشکل را ثبت کنید.
            </Notice>
          )}

          <section className="space-y-2">
            <p className="text-sm font-medium text-slate-600">کجای مسیر؟</p>
            <div className="grid grid-cols-3 gap-2">
              {CONTEXTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setContext(c.id)}
                  aria-pressed={context === c.id}
                  className={`pressable min-h-12 rounded-xl border text-sm font-bold ${context === c.id ? 'border-blue-600 bg-blue-600 text-white [--edge:#1e40af]' : 'border-slate-200 bg-white text-slate-700 [--edge:#cbd5e1]'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          {termini.length === 2 && context !== 'transfer_point' && (
            <section>
              <p className="mb-2 text-sm font-medium text-slate-600">جهت حرکت <span className="text-xs text-slate-400">(اختیاری)</span></p>
              <div className="grid grid-cols-2 gap-2">
                {termini.map((t) => (
                  <button
                    key={t}
                    onClick={() => setDirection(direction === t ? null : t)}
                    aria-pressed={direction === t}
                    className={`pressable min-h-12 rounded-xl border px-2 text-sm font-bold ${direction === t ? 'border-blue-600 bg-blue-600 text-white [--edge:#1e40af]' : 'border-slate-200 bg-white text-slate-700 [--edge:#cbd5e1]'}`}
                  >
                    به سمت {t}
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="mt-auto space-y-2 pt-2">
            {!stationId && (
              <Notice tone="warning" className="text-xs leading-6">
                اگر نمی‌دانید در کدام ایستگاه هستید، از «نمی‌دانم / رد کردن» استفاده کنید.
              </Notice>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setStationId(null); setLineId(null); setDirection(null); setStep(2); }}
                className="btn btn-neutral pressable min-h-14 flex-1"
              >
                نمی‌دانم / رد کردن
              </button>
              <button onClick={() => setStep(2)} disabled={!stationId} className="btn btn-primary pressable min-h-14 flex-[1.4]">
                ادامه
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── مرحله ۲: مشکل ───────────── */}
      {step === 2 && (
        <div className="flex flex-1 flex-col gap-3 p-4">
          {!category ? (
            <div className="grid grid-cols-2 gap-3">
              {categories.map((c) => {
                const Icon = CATEGORY_ICONS[c.id] ?? Pencil;
                const style = CATEGORY_STYLES[c.id] ?? { bg: 'bg-white', border: 'border-slate-200', edge: '[--edge:#cbd5e1]', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' };
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      // «سایر» فقط یک زیرمسئله دارد؛ مستقیم به جزئیات می‌رویم
                      if (c.subcategories.length === 1) { setSubcategoryId(c.subcategories[0].id); setStep(3); }
                    }}
                    className={`pressable flex min-h-36 flex-col items-center justify-center gap-3 rounded-3xl border p-4 text-center font-black ${style.bg} ${style.border} ${style.edge}`}
                  >
                    <span className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm ${style.iconBg} ${style.iconColor}`}>
                      <Icon size={28} strokeWidth={2.3} />
                    </span>
                    <span className="text-xs font-black text-slate-900 leading-5">{clean(c.titleFa)}</span>
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
                    className={`pressable flex min-h-14 w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-right font-bold ${
                      s.isOther ? 'border-dashed border-blue-300 bg-blue-50/60 text-blue-800' : 'border-slate-200 bg-white'
                    }`}
                  >
                    {s.isOther && <Pencil size={18} className="shrink-0" />}
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
          <div className="space-y-1 rounded-2xl border border-slate-200 bg-white p-3 text-sm">
            <p className="font-bold text-slate-900">{subcategory.titleFa}</p>
            <p className="text-slate-600">
              {station ? station.name : 'ایستگاه نامشخص'}
              {line ? ` · ${line.name}` : ''}{direction ? ` · به سمت ${direction}` : ''} · {CONTEXTS.find((c) => c.id === context)?.label}
            </p>
          </div>

          {subcategory.isSensitive && (
            <Notice tone="danger" icon={ShieldCheck} className="text-sm">
              این گزارش کاملاً ناشناس است. عکس گرفته نمی‌شود و در نمای عمومی فقط به‌صورت آمار تجمیعی دیده می‌شود.
            </Notice>
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
                <div className="relative overflow-hidden rounded-2xl border border-slate-200">
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
                  className="pressable flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white font-bold text-slate-700"
                >
                  {photoBusy ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                  افزودن عکس <span className="text-xs text-slate-400">(اختیاری — لطفاً از افراد عکس نگیرید)</span>
                </button>
              )}
            </section>
          )}

          <section>
            <p className="mb-2 text-xs font-bold text-slate-700">شدت مسئله را مشخص کنید:</p>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSeverity(s.id)}
                  aria-pressed={severity === s.id}
                  className={`pressable min-h-14 rounded-2xl border text-sm ${severity === s.id ? s.activeCls : s.inactiveCls}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-bold text-slate-700">چه زمانی رخ داد؟</p>
            <div className="flex flex-wrap gap-2">
              {WHEN.map((w) => (
                <Chip key={w.id} active={when === w.id} onClick={() => setWhen(w.id)}>{w.label}</Chip>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-bold text-slate-700">چه اثری روی سفرتان داشت؟ <span className="font-normal text-slate-400">(اختیاری)</span></p>
            <div className="flex flex-wrap gap-2">
              {(Object.entries(IMPACTS) as [Impact, string][]).map(([k, v]) => (
                <Chip key={k} active={impact === k} onClick={() => setImpact(impact === k ? null : k)}>{v}</Chip>
              ))}
            </div>
          </section>

          {isOther ? (
            <DescriptionField value={description} onChange={setDescription} label={subcategory?.isOther && categoryId !== '7' ? 'مشکل را با کلمات خودتان بنویسید' : 'توضیح دهید'} />
          ) : (
            <details className="rounded-2xl border border-slate-200 bg-white">
              <summary className="min-h-12 cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-600">افزودن توضیح (اختیاری)</summary>
              <div className="px-3 pb-3"><DescriptionField value={description} onChange={setDescription} /></div>
            </details>
          )}

          <details className="rounded-2xl border border-slate-200 bg-white">
            <summary className="min-h-12 cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-600">
              درباره سفر شما (اختیاری — برای تحلیل بهتر، بدون هویت)
            </summary>
            <div className="space-y-3 px-4 pb-4">
              <ChipGroup label="چقدر از حمل‌ونقل عمومی استفاده می‌کنید؟" options={RIDER_TYPES} value={trip.riderType} onPick={(v) => updateTrip('riderType', v)} />
              <ChipGroup label="هدف این سفر" options={TRIP_PURPOSES} value={trip.tripPurpose} onPick={(v) => updateTrip('tripPurpose', v)} />
              <ChipGroup label="نیاز ویژه" options={ACCESS_NEEDS} value={trip.accessNeed} onPick={(v) => updateTrip('accessNeed', v)} />
              <ChipGroup label="جنسیت (فقط برای آمار تجمیعی امنیت)" options={GENDERS} value={trip.gender} onPick={(v) => updateTrip('gender', v)} />
              <p className="text-[11px] text-slate-400">این پاسخ‌ها روی همین گوشی به خاطر سپرده می‌شوند و هرگز به‌صورت عمومی منتشر نمی‌شوند.</p>
            </div>
          </details>

          {!consented && (
            <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs leading-6 text-slate-600">
              <input id="consent" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-blue-600" />
              <span>
                می‌پذیرم که گزارشم بدون اطلاعات هویتی منتشر و برای بهبود خدمات حمل‌ونقل تحلیل شود. هر زمان بخواهم می‌توانم همه گزارش‌هایم را حذف کنم.{' '}
                <Link href="/privacy" className="font-bold text-blue-700 underline underline-offset-4">حریم خصوصی</Link>
              </span>
            </label>
          )}
          {error && <Notice tone="danger" role="alert" className="text-sm">{error}</Notice>}

          <button
            onClick={submit}
            disabled={submitting || photoBusy || (isOther && !description.trim()) || (!consented && !agreed)}
            className="btn btn-primary pressable mt-auto min-h-16 gap-2 text-xl font-extrabold"
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
        className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-base outline-none focus:border-blue-500"
      />
      <span className="mt-1 block text-left text-xs text-slate-400">{toFa(value.length)} / {toFa(MAX_DESCRIPTION)}</span>
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable min-h-10 rounded-full border px-3.5 text-xs font-bold ${active ? 'border-blue-600 bg-blue-600 text-white [--edge:#1e40af]' : 'border-slate-200 bg-white text-slate-700'}`}
    >
      {children}
    </button>
  );
}

function ChipGroup({ label, options, value, onPick }: { label: string; options: Record<string, string>; value?: string; onPick: (v: string) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-bold text-slate-600">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([k, v]) => (
          <Chip key={k} active={value === k} onClick={() => onPick(k)}>{v}</Chip>
        ))}
      </div>
    </div>
  );
}
