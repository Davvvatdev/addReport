'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Gift,
  HelpCircle,
  History,
  Lock,
  MessageSquare,
  QrCode,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  Trophy,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import {
  Badge,
  CitizenProfile,
  CityReward,
  CITY_REWARDS_CATALOG,
  getCitizenProfile,
  redeemCityService,
  saveCitizenProfile,
} from '@/lib/gamification';
import { toFa } from '@/lib/format';
import { db, OfflineReport } from '@/lib/db';

export default function ProfilePage() {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [selectedReward, setSelectedReward] = useState<CityReward | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rewards' | 'reports' | 'faq'>('rewards');
  const [myReports, setMyReports] = useState<OfflineReport[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [customName, setCustomName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👋');

  useEffect(() => {
    const p = getCitizenProfile();
    setProfile(p);
    setCustomName(p.name);
    setSelectedAvatar(p.avatar);

    // بارگذاری گزارش‌های محلی ذخیره شده کاربر
    db.reports.toArray().then((items) => {
      setMyReports(items);
    }).catch(() => {});
  }, []);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  function handleRedeem(reward: CityReward) {
    const res = redeemCityService(reward.id);
    if (res.success && res.updatedProfile) {
      setProfile(res.updatedProfile);
      setRedeemSuccess(`کد تخفیف «${reward.title}» با موفقیت صادر شد!`);
      setRedeemError(null);
      setSelectedReward(null);
    } else {
      setRedeemError(res.message);
    }
  }

  function handleCopy(code: string) {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  function handleSaveProfile() {
    if (!profile) return;
    const updated: CitizenProfile = {
      ...profile,
      name: customName.trim() || 'شهروند دیده‌بان',
      avatar: selectedAvatar,
    };
    saveCitizenProfile(updated);
    setProfile(updated);
    setShowSettings(false);
  }

  const AVATAR_OPTIONS = ['👋', '🦁', '🌟', '🚇', '🏙️', '🦸‍♂️', '🌱', '🚀'];

  return (
    <main className="min-h-screen bg-slate-50/80 px-4 pb-28 pt-4">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        
        {/* هدر صفحه: مشابه موکاپ اصلی */}
        <header className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">پروفایل شهروندی</h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm border border-slate-200/70 active:scale-95 transition-transform"
            aria-label="تنظیمات پروفایل"
          >
            <Settings size={20} />
          </button>
        </header>

        {/* کارت کاربر با آواتار و برچسب سطح */}
        <section className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-100 via-sky-50 to-blue-100 text-3xl shadow-inner border border-sky-100">
            <span>{profile.avatar}</span>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] font-black border-2 border-white shadow-sm">
              ✓
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 truncate">{profile.name}</h2>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">عضو دیده‌بان از {profile.joinedAt}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200/60">
              <span>⭐</span>
              <span>{profile.levelTitle}</span>
            </div>
          </div>
        </section>

        {/* کارت بزرگ و پرانرژی امتیاز و سکه شهروندی (عین موکاپ) */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-sky-500 to-blue-600 p-6 text-white shadow-xl shadow-sky-500/20">
          {/* جلوه نور پس‌زمینه */}
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-blue-700/30 blur-2xl" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="text-sm font-bold text-sky-100/90">سکه و امتیاز شهروندی (CityPulse)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">{toFa(profile.points.toLocaleString('fa-IR'))}</span>
                <span className="text-sm font-bold text-sky-100">سکه</span>
              </div>
            </div>

            {/* نشان سه بعدی جام قهرمانی */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/25">
              <Trophy size={36} className="text-amber-300 drop-shadow-md animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
          </div>

          {/* نوار پیشرفت سطح */}
          <div className="relative z-10 mt-6">
            <div className="flex items-center justify-between text-xs font-bold text-sky-100">
              <span>سطح بعدی: {toFa(profile.nextLevelPoints.toLocaleString('fa-IR'))} امتیاز</span>
              <span>{toFa(profile.progressPercent)}٪</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-black/20 backdrop-blur-sm p-0.5">
              <div
                className="h-full rounded-full bg-white transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(8, profile.progressPercent))}%` }}
              />
            </div>
          </div>
        </section>

        {/* سه کارت آماری مربعی و مینیمال (عین موکاپ) */}
        <section className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 text-lg">
              📝
            </div>
            <span className="mt-2 text-xl font-black text-slate-900">{toFa(profile.reportsCount)}</span>
            <span className="text-xs font-medium text-slate-500">گزارش‌ها</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-lg">
              ✅
            </div>
            <span className="mt-2 text-xl font-black text-slate-900">{toFa(profile.resolvedCount)}</span>
            <span className="text-xs font-medium text-slate-500">رسیدگی‌شده</span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 text-lg">
              👍
            </div>
            <span className="mt-2 text-xl font-black text-slate-900">{toFa(profile.upvotesCount)}</span>
            <span className="text-xs font-medium text-slate-500">اثرگذاری</span>
          </div>
        </section>

        {/* بخش نشان‌ها (Badges) با قابلیت لمس و نمایش توضیحات */}
        <section className="rounded-3xl bg-white p-4 shadow-sm border border-slate-100">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-base">نشان‌های افتخار</h3>
            <span className="text-xs font-bold text-sky-600 cursor-pointer">
              {toFa(profile.badges.filter((b) => b.unlocked).length)} از {toFa(profile.badges.length)} نشان
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 text-center">
            {profile.badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`group flex flex-col items-center rounded-2xl p-2 transition-all active:scale-95 ${
                  badge.unlocked ? 'hover:bg-slate-50' : 'opacity-50 grayscale'
                }`}
              >
                <div
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-2xl shadow-sm transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-b from-white to-slate-100 border border-slate-200/80 shadow-slate-200'
                      : 'bg-slate-100 border border-dashed border-slate-300'
                  }`}
                >
                  <span>{badge.icon}</span>
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-200/60 backdrop-blur-[1px]">
                      <Lock size={15} className="text-slate-600" />
                    </div>
                  )}
                </div>
                <span className="mt-1.5 text-[11px] font-extrabold text-slate-800 line-clamp-1">
                  {badge.title}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* پیام موفقیت / خطا در تبدیل پاداش */}
        {redeemSuccess && (
          <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-900 text-sm font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <span>{redeemSuccess}</span>
            </div>
            <button onClick={() => setRedeemSuccess(null)} className="text-emerald-700 p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {redeemError && (
          <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-900 text-sm font-bold">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
              <span>{redeemError}</span>
            </div>
            <button onClick={() => setRedeemError(null)} className="text-rose-700 p-1">
              <X size={16} />
            </button>
          </div>
        )}

        {/* تب‌های عملیاتی: جوایز شهری، گزارش‌های من، راهنما */}
        <div className="flex rounded-2xl bg-slate-200/60 p-1 font-bold text-xs">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Gift size={16} />
            <span>تبدیل به خدمات شهری</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={16} />
            <span>گزارش‌های من</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle size={16} />
            <span>راهنمای امتیازات</span>
          </button>
        </div>

        {/* محتوای تب ۱: کاتالوگ خدمات شهری و کدهای تخفیف */}
        {activeTab === 'rewards' && (
          <section className="space-y-4">
            {/* اگر کاربر ووچرهای فعال دارد */}
            {profile.redeemedVouchers.length > 0 && (
              <div className="rounded-3xl bg-amber-500/10 border border-amber-300/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Ticket size={18} className="text-amber-700" />
                    <h4 className="font-black text-amber-950 text-sm">کدهای فعال و جوایز دریافت‌شده شما</h4>
                  </div>
                  <span className="text-xs font-bold text-amber-800">{toFa(profile.redeemedVouchers.length)} کد</span>
                </div>
                <div className="space-y-2.5 mt-3">
                  {profile.redeemedVouchers.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm border border-amber-200/50"
                    >
                      <div>
                        <p className="font-extrabold text-slate-900 text-xs">{v.rewardTitle}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">انقضا: {v.expiresAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span dir="ltr" className="font-mono text-xs font-black bg-slate-100 px-2 py-1 rounded-lg text-slate-800">
                          {v.code}
                        </span>
                        <button
                          onClick={() => handleCopy(v.code)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-700 active:scale-95"
                          title="کپی کد"
                        >
                          {copiedCode === v.code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* کاتالوگ خدمات شهری */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-slate-900 text-sm">خدمات شهری قابل دریافت با سکه</h3>
                <span className="text-xs text-slate-500 font-medium">موجودی: {toFa(profile.points)} سکه</span>
              </div>

              {CITY_REWARDS_CATALOG.map((reward) => {
                const canAfford = profile.points >= reward.pointsCost;
                return (
                  <div
                    key={reward.id}
                    className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:border-sky-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-2xl border border-slate-100">
                        {reward.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                            {reward.categoryLabel}
                          </span>
                          <span className="font-black text-slate-900 text-sm">
                            {toFa(reward.pointsCost)} <span className="text-xs font-normal text-slate-500">سکه</span>
                          </span>
                        </div>
                        <h4 className="mt-1 font-black text-slate-900 text-sm">{reward.title}</h4>
                        <p className="mt-1 text-xs text-slate-500 leading-5">{reward.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium">
                        ارائه‌دهنده: {reward.provider}
                      </span>
                      <button
                        onClick={() => setSelectedReward(reward)}
                        className={`rounded-xl px-4 py-2 text-xs font-black transition-all active:scale-95 ${
                          canAfford
                            ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 hover:bg-sky-600'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? 'دریافت خدمت' : `${toFa(reward.pointsCost - profile.points)} سکه تا دریافت`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* محتوای تب ۲: گزارش‌های من */}
        {activeTab === 'reports' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-black text-slate-900 text-sm">گزارش‌های ثبت‌شده با این دستگاه</h3>
              <Link href="/report" className="text-xs font-bold text-sky-600">
                + ثبت گزارش جدید
              </Link>
            </div>

            {myReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center border border-slate-100">
                <span className="text-4xl mb-2">📋</span>
                <p className="font-bold text-slate-800">هنوز گزارشی ثبت نکرده‌اید</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-5">
                  با ثبت اولین گزارش از مترو یا اتوبوس، ۵۰ سکه شهروندی دریافت کرده و نشان «اولین گزارش» را باز کنید!
                </p>
                <Link
                  href="/report"
                  className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-600/20 active:scale-95"
                >
                  شروع ثبت گزارش (+۵۰ سکه)
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myReports.map((r, i) => (
                  <div
                    key={r.uuid || i}
                    className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                          {r.mode === 'metro' ? 'مترو' : r.mode === 'bus' ? 'اتوبوس' : 'بی‌آر‌تی'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {new Date(r.createdAt).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-slate-800 truncate">
                        {r.description || 'گزارش وضعیت و تجربه مسافر'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        +۵۰ سکه
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {r.syncStatus === 'synced' ? 'ارسال‌شده به سامانه' : 'در صف ارسال'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* محتوای تب ۳: راهنما و قوانین باشگاه شهروندی */}
        {activeTab === 'faq' && (
          <section className="space-y-3">
            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                چگونه سکه شهروندی به دست آوریم؟
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 leading-6 list-disc list-inside">
                <li><strong className="text-slate-800">هر گزارش معمولی:</strong> ۵۰ سکه شهروندی</li>
                <li><strong className="text-slate-800">ضمیمه کردن عکس واقعی:</strong> ۲۵ سکه پاداش اضافه</li>
                <li><strong className="text-slate-800">گزارش در ساعات شلوغی:</strong> ۱۰ سکه پاداش اضافه</li>
                <li><strong className="text-slate-800">تأیید گزارش توسط دیگران:</strong> ۵ سکه به ازای هر تأیید</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Gift size={16} className="text-sky-500" />
                چگونه سکه‌ها را به خدمات شهری تبدیل کنیم؟
              </h4>
              <p className="text-xs text-slate-600 leading-6">
                سکه‌های شما در این سامانه یک دارایی واقعی اجتماعی است. با رسیدن به سقف امتیاز هر خدمت (شارژ بلیت مترو، بلیت سینما، بن استخر و...) روی دکمه دریافت خدمت بزنید تا کد ووچر اختصاصی برای شما صادر شود. این کد را می‌توانید در گیشه‌های مترو یا وب‌سایت‌های خدمات شهری ارائه دهید.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Shield size={16} className="text-teal-600" />
                آیا هویت من فاش می‌شود؟
              </h4>
              <p className="text-xs text-slate-600 leading-6">
                خیر! تمام داده‌ها بر پایه توکن تصادفی دستگاه شما ذخیره می‌شوند و هیچ نام و شماره تماسی به گزارش‌های ثبت‌شده پیوند داده نمی‌شود. هدف فقط تشویق مشارکت سازنده شهروندان در ارتقای کیفیت حمل‌ونقل عمومی تهران است.
              </p>
            </div>
          </section>
        )}

        {/* منوهای متفرقه پایین صفحه (مشابه موکاپ) */}
        <section className="space-y-2">
          <Link
            href="/privacy"
            className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100 active:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Shield size={18} />
              </span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">حریم خصوصی و امنیت داده</p>
                <p className="text-[11px] text-slate-500">مدیریت اطلاعات و تعهدات ناشناسی</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-400" />
          </Link>

          <Link
            href="/feedback"
            className="flex items-center justify-between rounded-2xl bg-white p-3.5 shadow-sm border border-slate-100 active:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <MessageSquare size={18} />
              </span>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">ارزیابی کاربردپذیری سامانه (SUS)</p>
                <p className="text-[11px] text-slate-500">کمک به پژوهش علمی و بهبود تجربه مسافران</p>
              </div>
            </div>
            <ChevronLeft size={18} className="text-slate-400" />
          </Link>
        </section>

      </div>

      {/* مدال جزئیات نشان افتخار */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center border border-slate-100 animate-scaleUp">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl shadow-inner border border-slate-200">
              {selectedBadge.icon}
            </div>
            <h3 className="mt-4 text-xl font-black text-slate-900">{selectedBadge.title}</h3>
            <p className="mt-2 text-xs text-slate-600 leading-6">{selectedBadge.description}</p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs font-bold text-slate-700">
              {selectedBadge.unlocked ? (
                <span className="text-emerald-600 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={16} /> باز شده در تاریخ {selectedBadge.unlockedAt || 'قبلی'}
                </span>
              ) : (
                <span className="text-slate-500 flex items-center justify-center gap-1.5">
                  <Lock size={16} /> هنوز به دست نیامده است
                </span>
              )}
            </div>

            <button
              onClick={() => setSelectedBadge(null)}
              className="mt-5 w-full rounded-2xl bg-slate-900 py-3 text-xs font-black text-white active:bg-slate-800"
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {/* مدال تأیید دریافت خدمت شهری */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center border border-slate-100 animate-scaleUp">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-3xl border border-sky-100">
              {selectedReward.icon}
            </div>
            <h3 className="mt-3 text-lg font-black text-slate-900">{selectedReward.title}</h3>
            <p className="mt-2 text-xs text-slate-600 leading-6">{selectedReward.description}</p>

            <div className="my-4 rounded-2xl bg-sky-50 p-4 border border-sky-100 text-center">
              <p className="text-xs text-slate-500 font-medium">کسر از موجودی شما:</p>
              <p className="text-2xl font-black text-sky-700 mt-1">
                {toFa(selectedReward.pointsCost)} <span className="text-xs font-normal">سکه</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                موجودی پس از دریافت: {toFa(profile.points - selectedReward.pointsCost)} سکه
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 rounded-2xl bg-slate-100 py-3 text-xs font-black text-slate-700 active:bg-slate-200"
              >
                انصراف
              </button>
              <button
                onClick={() => handleRedeem(selectedReward)}
                className="flex-1 rounded-2xl bg-sky-500 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/25 active:bg-sky-600"
              >
                تأیید و دریافت کد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مدال تنظیمات نام و آواتار کاربر */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">تنظیمات پروفایل دیده‌بان</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 p-1">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">انتخاب نشان آواتار:</label>
                <div className="grid grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-12 rounded-2xl text-2xl flex items-center justify-center transition-all ${
                        selectedAvatar === av
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-105'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نام نمایشی یا نام مستعار:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="مثلاً: شهروند مسئول یا نام دلخواه"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 rounded-2xl bg-slate-100 py-3 text-xs font-bold text-slate-700"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 rounded-2xl bg-sky-500 py-3 text-xs font-black text-white shadow-md shadow-sky-500/20"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
