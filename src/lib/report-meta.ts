export const STATUSES = ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'] as const;
export type Status = (typeof STATUSES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  submitted: 'ثبت شد',
  under_review: 'در حال بررسی',
  assigned: 'ارجاع شد',
  in_progress: 'در حال اقدام',
  resolved: 'حل شد',
  rejected: 'رد شد',
};

export const STATUS_CLS: Record<Status, string> = {
  submitted: 'bg-amber-100 text-amber-800',
  under_review: 'bg-indigo-100 text-indigo-800',
  assigned: 'bg-sky-100 text-sky-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-slate-200 text-slate-700',
};

export const statusLabel = (s: string) => STATUS_LABEL[s as Status] ?? s;
export const statusCls = (s: string) => STATUS_CLS[s as Status] ?? 'bg-slate-100 text-slate-700';

export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type Severity = (typeof SEVERITIES)[number];

export const SEVERITY_LABEL: Record<Severity, string> = { low: 'کم', medium: 'متوسط', high: 'زیاد', critical: 'بحرانی' };
export const SEVERITY_CLS: Record<Severity, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
  critical: 'bg-red-700 text-white',
};
export const SEVERITY_RANK: Record<Severity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
export const severityLabel = (s: string) => SEVERITY_LABEL[s as Severity] ?? s;
export const severityCls = (s: string) => SEVERITY_CLS[s as Severity] ?? 'bg-slate-100 text-slate-700';

export const IMPACTS = {
  time_loss: 'اتلاف زمان',
  could_not_board: 'نتوانستم سوار شوم',
  safety_risk: 'خطر امنیتی یا ایمنی',
  health: 'آسیب به سلامت یا بهداشت',
  accessibility: 'مانع دسترسی',
} as const;
export type Impact = keyof typeof IMPACTS;

export const UNITS = {
  metro: 'شرکت بهره‌برداری مترو',
  bus: 'شرکت واحد اتوبوسرانی',
  station: 'مدیریت ایستگاه / پایانه',
  info: 'واحد اطلاع‌رسانی',
  security: 'واحد انتظامی و امنیت',
  traffic: 'سازمان حمل‌ونقل و ترافیک',
} as const;
export type Unit = keyof typeof UNITS;

export const TRIP_PURPOSES = { work: 'کار', study: 'تحصیل', shopping: 'خرید و کارهای روزمره', leisure: 'تفریح', other: 'سایر' } as const;
export const RIDER_TYPES = { daily: 'مسافر روزانه', weekly: 'مسافر هفتگی', occasional: 'گاه‌به‌گاه', visitor: 'مهمان شهر' } as const;
export const ACCESS_NEEDS = { elderly: 'سالمند', disability: 'دارای معلولیت', stroller: 'همراه با کالسکه', luggage: 'همراه با بار', pregnant: 'باردار' } as const;
export const GENDERS = { female: 'زن', male: 'مرد' } as const;

export const pick = <T extends object>(options: T, v: unknown): keyof T | null =>
  typeof v === 'string' && v in options ? (v as keyof T) : null;

/** شاخص‌های تجربه سفر بر اساس زیرمسئله‌ها */
export const KPI_GROUPS: { key: string; label: string; subcategories: string[] }[] = [
  { key: 'reliability', label: 'قابلیت اتکا', subcategories: ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9', '2-1', '2-4', '2-5', '2-8', '2-10', '2-11', '2-12', '2-13'] },
  { key: 'crowding', label: 'ازدحام', subcategories: ['2-2', '2-3', '2-6', '2-9', '3-10'] },
  { key: 'environment', label: 'کیفیت محیطی', subcategories: ['3-3', '3-4', '3-5', '3-11', '3-12'] },
  { key: 'safety', label: 'احساس امنیت', subcategories: ['4-1', '4-2', '4-3', '4-4', '4-5', '4-6', '4-8', '4-9', '4-10', '4-11', '4-12', '4-13'] },
  { key: 'information', label: 'کیفیت اطلاع‌رسانی', subcategories: ['5-1', '5-2', '5-3', '5-4', '5-5', '5-6', '5-7', '5-8', '5-9', '5-10', '5-11', '5-12'] },
];

/** دو ایستگاه انتهایی خط از روی نامش، مثل «خط ۱ (تجریش - کهریزک)» */
export function lineTermini(lineName: string): string[] {
  const m = lineName.match(/\(([^)]+)\)/);
  if (!m) return [];
  return m[1].split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
}
