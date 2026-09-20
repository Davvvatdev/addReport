import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';
import { AppHeader, Surface } from '@/components/ui';

export const metadata: Metadata = { title: 'حریم خصوصی | دیده‌بان حمل‌ونقل تهران' };

const items = [
  ['چه چیزی ثبت نمی‌شود؟', 'نام، شماره تلفن، ایمیل یا هر اطلاعات هویتی دیگر. برای ثبت گزارش نیازی به ورود یا ساخت حساب نیست.'],
  ['شناسه دستگاه چیست؟', 'یک عدد تصادفی روی همین گوشی ذخیره می‌شود تا جلوی ارسال انبوه و اسپم گرفته شود. به هویت شما وصل نیست و هر وقت داده‌های مرورگر را پاک کنید از بین می‌رود.'],
  ['گزارش‌های امنیتی و اجتماعی', 'مزاحمت، آزار، سرقت، ناامنی و درگیری همیشه ناشناس ثبت می‌شوند. عکس گرفتن برای آن‌ها ممکن نیست، مختصات دقیق ذخیره نمی‌شود و در نمای عمومی فقط تعداد در هر ایستگاه یا خط دیده می‌شود، نه خودِ گزارش.'],
  ['چه چیزی عمومی است؟', 'گزارش‌های غیرحساس (دسته‌بندی، ایستگاه، زمان و توضیح) و آمار تجمیعی، بدون نیاز به ورود قابل مشاهده و دانلود است. هیچ نهادی نمی‌تواند گزارشی را حذف کند.'],
  ['عکس‌ها', 'لطفاً از افراد عکس نگیرید؛ فقط از تجهیزات و محیط. عکس‌ها پیش از ارسال روی گوشی شما کوچک می‌شوند.'],
];

export default function PrivacyPage() {
  return (
    <main className="app-bg min-h-screen">
      <AppHeader title="حریم خصوصی" eyebrow="زبان ساده، بدون حساب کاربری" icon={ShieldCheck} />
      <div className="mx-auto w-full max-w-md space-y-3 p-5">
        {items.map(([t, d]) => (
          <Surface key={t} className="p-4">
            <h2 className="mb-2 font-extrabold text-slate-950">{t}</h2>
            <p className="text-sm leading-7 text-slate-600">{d}</p>
          </Surface>
        ))}
        <Link href="/" className="flex min-h-12 items-center justify-center rounded-xl bg-slate-950 font-bold text-white">بازگشت</Link>
      </div>
    </main>
  );
}
