'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BadgeCheck,
  ChevronLeft,
  CircleCheck,
  Construction,
  Crown,
  Gift,
  HelpCircle,
  History,
  Lock,
  LogIn,
  LogOut,
  MessageSquare,
  FilePenLine,
  Flag,
  Lightbulb,
  Recycle,
  Settings,
  Shield,
  Sparkles,
  Star,
  Ticket,
  ThumbsUp,
  Trophy,
  X,
  CheckCircle2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { Notice } from '@/components/ui';
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
  const [account, setAccount] = useState<{ username: string } | null | undefined>(undefined);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setAccount(data.user))
      .catch(() => setAccount(null));
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      db.reports
        .toArray()
        .then((items) => {
          const sortedItems = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const p = getCitizenProfile(sortedItems);
          setMyReports(sortedItems);
          setProfile(p);
          setCustomName(p.name);
          setSelectedAvatar(p.avatar);
        })
        .catch(() => {
          const p = getCitizenProfile();
          setProfile(p);
          setCustomName(p.name);
          setSelectedAvatar(p.avatar);
        });
    });
  }, []);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  function handleRedeem(reward: CityReward) {
    const res = redeemCityService(reward.id, profile ?? undefined);
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
    setProfile(getCitizenProfile(myReports));
    setShowSettings(false);
  }

  const AVATAR_OPTIONS = ['👋', '🦁', '🌟', '🚇', '🏙️', '🦸‍♂️', '🌱', '🚀'];
  const unlockedBadgesCount = profile.badges.filter((b) => b.unlocked).length;
  const badgeIconMap: Record<string, typeof Award> = {
    first_report: Flag,
    road_warrior: Construction,
    trash_buster: Recycle,
    night_owl: Lightbulb,
    city_hero: Crown,
    speed_reporter: Zap,
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-28 pt-4">
      <div className="mx-auto flex w-full max-w-md flex-col gap-5">
        
        <header className="flex items-center justify-between border-b border-slate-100 bg-white/80 pb-4 pt-1 backdrop-blur">
          <div>
            <p className="text-xs font-bold text-slate-500">باشگاه شهروندی دیده‌بان</p>
            <h1 className="mt-0.5 text-2xl font-black tracking-normal text-slate-950">پروفایل شهروندی</h1>
          </div>
          <div className="flex items-center gap-2">
            {account === null && (
              <Link
                href="/login"
                className="tap btn btn-secondary pressable px-3 py-2.5 text-xs"
              >
                <LogIn size={16} />
                ورود
              </Link>
            )}
            {account && (
              <button
                onClick={() => logout()}
                className="tap btn btn-neutral pressable px-3 py-2.5 text-xs"
                title={`خروج از حساب ${account.username}`}
              >
                <LogOut size={16} />
                خروج ({account.username})
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="tap btn btn-neutral pressable w-11 shrink-0"
              aria-label="تنظیمات پروفایل"
            >
              <Settings size={21} />
            </button>
          </div>
        </header>

        <section className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-3xl text-blue-600">
            <span>{profile.avatar}</span>
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-sm">
              <BadgeCheck size={13} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate text-lg font-black text-slate-950">{profile.name}</h2>
              <BadgeCheck size={20} className="mt-1 shrink-0 text-emerald-500" />
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">عضو دیده‌بان از {profile.joinedAt}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
              <Star size={13} className="fill-amber-400 text-amber-500" />
              <span>{profile.levelTitle}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-blue-100">سکه و امتیاز شهروندی (CityPulse)</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-tight">{toFa(profile.points.toLocaleString('fa-IR'))}</span>
                <span className="text-sm font-bold text-blue-100">سکه</span>
              </div>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-amber-300">
              <Trophy size={30} />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-blue-100">
              <span>سطح بعدی: {toFa(profile.nextLevelPoints.toLocaleString('fa-IR'))} امتیاز</span>
              <span>{toFa(profile.progressPercent)}٪</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-700/40 p-0.5">
              <div
                className="h-full rounded-full bg-white transition-all duration-700 shadow-sm"
                style={{ width: `${Math.min(100, Math.max(8, profile.progressPercent))}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-2.5">
          <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FilePenLine size={20} />
            </div>
            <span className="mt-1 text-xl font-black text-slate-950">{toFa(profile.reportsCount)}</span>
            <span className="text-[11px] font-medium text-slate-500">گزارش‌ها</span>
          </div>

          <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CircleCheck size={20} />
            </div>
            <span className="mt-1 text-xl font-black text-slate-950">{toFa(profile.resolvedCount)}</span>
            <span className="text-[11px] font-medium text-slate-500">ارسال‌شده</span>
          </div>

          <div className="flex min-h-[92px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ThumbsUp size={20} />
            </div>
            <span className="mt-1 text-xl font-black text-slate-950">{toFa(profile.upvotesCount)}</span>
            <span className="text-[11px] font-medium text-slate-500">تأییدها</span>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-950">نشان‌های افتخار</h3>
            <span className="text-xs font-bold text-blue-600">
              {toFa(unlockedBadgesCount)} از {toFa(profile.badges.length)} نشان
            </span>
          </div>

          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1 text-center">
            {profile.badges.map((badge) => (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`group flex w-16 shrink-0 flex-col items-center rounded-2xl p-1 transition active:scale-95 ${
                  badge.unlocked ? 'hover:bg-slate-50' : 'opacity-50'
                }`}
              >
                {(() => {
                  const Icon = badgeIconMap[badge.id] || Award;
                  return (
                <div
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full text-lg transition ${
                    badge.unlocked
                      ? 'border border-slate-200 bg-slate-50 text-blue-600'
                      : 'border border-dashed border-slate-300 bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon size={20} />
                  {!badge.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-100/75">
                      <Lock size={14} className="text-slate-500" />
                    </div>
                  )}
                </div>
                  );
                })()}
                <span className="mt-1.5 text-[11px] font-extrabold text-slate-800 line-clamp-1">
                  {badge.title}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* پیام موفقیت / خطا در تبدیل پاداش */}
        {redeemSuccess && (
          <Notice
            tone="success"
            role="status"
            className="animate-fadeIn text-sm font-bold"
            action={
              <button onClick={() => setRedeemSuccess(null)} aria-label="بستن پیام" className="btn btn-neutral pressable h-8 w-8 shrink-0 rounded-lg">
                <X size={16} />
              </button>
            }
          >
            {redeemSuccess}
          </Notice>
        )}

        {redeemError && (
          <Notice
            tone="danger"
            role="alert"
            className="text-sm font-bold"
            action={
              <button onClick={() => setRedeemError(null)} aria-label="بستن پیام" className="btn btn-neutral pressable h-8 w-8 shrink-0 rounded-lg">
                <X size={16} />
              </button>
            }
          >
            {redeemError}
          </Notice>
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
                          className="btn btn-secondary pressable h-8 w-8 rounded-lg"
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
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4"
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
                        className={`btn pressable rounded-xl px-4 py-2 text-xs font-black ${
                          canAfford ? 'btn-primary' : 'btn-neutral text-slate-400'
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
              <Link href="/report" className="btn btn-secondary pressable rounded-xl px-3 py-1.5 text-xs">
                + ثبت گزارش جدید
              </Link>
            </div>

            {myReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center border border-slate-100">
                <span className="text-4xl mb-2">📋</span>
                <p className="font-bold text-slate-800">هنوز گزارشی ثبت نکرده‌اید</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-5">
                  آمار و سکه‌های پروفایل فقط بعد از ثبت گزارش واقعی روی همین دستگاه ساخته می‌شود.
                </p>
                <Link
                  href="/report"
                  className="btn btn-primary pressable mt-4 rounded-xl px-5 py-2.5 text-xs font-black"
                >
                  شروع ثبت گزارش (+۵۰ سکه)
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {myReports.map((r, i) => (
                  <div
                    key={r.uuid || i}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5"
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
                        +{toFa(50 + (r.photoData ? 25 : 0))} سکه
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
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                چگونه سکه شهروندی به دست آوریم؟
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 leading-6 list-disc list-inside">
                <li><strong className="text-slate-800">هر گزارش معمولی:</strong> ۵۰ سکه شهروندی</li>
                <li><strong className="text-slate-800">ضمیمه کردن عکس واقعی:</strong> ۲۵ سکه پاداش اضافه</li>
                <li><strong className="text-slate-800">گزارش در ساعات شلوغی:</strong> ۱۰ سکه پاداش اضافه</li>
                <li><strong className="text-slate-800">ارسال موفق گزارش:</strong> در بخش آمار با وضعیت ارسال‌شده دیده می‌شود.</li>
              </ul>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Gift size={16} className="text-sky-500" />
                چگونه سکه‌ها را به خدمات شهری تبدیل کنیم؟
              </h4>
              <p className="text-xs text-slate-600 leading-6">
                سکه‌های شما در این سامانه یک دارایی واقعی اجتماعی است. با رسیدن به سقف امتیاز هر خدمت (شارژ بلیت مترو، بلیت سینما، بن استخر و...) روی دکمه دریافت خدمت بزنید تا کد ووچر اختصاصی برای شما صادر شود. این کد را می‌توانید در گیشه‌های مترو یا وب‌سایت‌های خدمات شهری ارائه دهید.
              </p>
            </div>

            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
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
            className="pressable flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 hover:border-slate-300"
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
            <ChevronLeft size={18} className="text-slate-500" />
          </Link>

          <Link
            href="/feedback"
            className="pressable flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 hover:border-slate-300"
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
            <ChevronLeft size={18} className="text-slate-500" />
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
              className="btn btn-dark pressable mt-5 w-full py-3 text-xs font-black"
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
                className="btn btn-neutral pressable flex-1 py-3 text-xs font-black"
              >
                انصراف
              </button>
              <button
                onClick={() => handleRedeem(selectedReward)}
                className="btn btn-primary pressable flex-1 py-3 text-xs font-black"
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
              <button onClick={() => setShowSettings(false)} aria-label="بستن" className="btn btn-neutral pressable h-8 w-8 rounded-lg">
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
                  className="btn btn-neutral pressable flex-1 py-3 text-xs"
                >
                  انصراف
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="btn btn-primary pressable flex-1 py-3 text-xs font-black"
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
