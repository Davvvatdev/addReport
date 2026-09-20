const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** اعداد لاتین → فارسی (فقط برای نمایش) */
export function toFa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** تاریخ شمسی برای نمایش؛ در پایگاه داده میلادی می‌ماند */
export function formatJalali(date: Date | string, withTime = true): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' };
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', opts).format(d);
}

/** کد رهگیری از روی UUID (آفلاین و آنلاین یکسان است) */
export function trackingCode(uuid: string): string {
  return `TR-${uuid.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}

/** یکسان‌سازی متن فارسی برای جستجو */
export function normalizeFa(s: string): string {
  return s
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‏‎]/g, ' ')
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
