import type { Meta } from './types';

const safe = <T,>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

/** توکن تصادفی دستگاه — فقط برای جلوگیری از اسپم، نه هویت */
export function getReporterToken(): string {
  return safe(() => {
    let t = localStorage.getItem('reporter_token');
    if (!t) {
      t = crypto.randomUUID();
      localStorage.setItem('reporter_token', t);
    }
    return t;
  }, crypto.randomUUID());
}

export const hasConsented = () => safe(() => localStorage.getItem('consent_v1') === '1', false);
export const setConsented = () => safe(() => localStorage.setItem('consent_v1', '1'), undefined);

const META_KEY = 'meta_v1';

/** دسته‌ها/خطوط/ایستگاه‌ها: از شبکه، و در نبود آن از آخرین نسخه ذخیره‌شده */
export async function loadMeta(): Promise<Meta | null> {
  try {
    const res = await fetch('/api/meta');
    if (res.ok) {
      const meta: Meta = await res.json();
      safe(() => localStorage.setItem(META_KEY, JSON.stringify(meta)), undefined);
      return meta;
    }
  } catch {}
  return safe(() => {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Meta) : null;
  }, null);
}

export function cachedMeta(): Meta | null {
  return safe(() => {
    const raw = localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as Meta) : null;
  }, null);
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

/** کوچک‌سازی تصویر در سمت کاربر تا حداکثر ~۵۰۰ کیلوبایت */
export async function compressImage(file: File, maxBytes = 500 * 1024): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  let quality = 0.8;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  let dataUrl = '';
  for (let i = 0; i < 8; i++) {
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    // اندازه واقعی ≈ ۳/۴ طول base64
    if ((dataUrl.length * 3) / 4 <= maxBytes) break;
    quality = Math.max(0.4, quality - 0.1);
    scale *= 0.85;
  }
  bitmap.close();
  return dataUrl;
}
