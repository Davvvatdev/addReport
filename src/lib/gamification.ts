/**
 * سیستم امتیازدهی، سکه شهروندی، نشان‌های افتخار و تبدیل به خدمات شهری
 * Gamification & Civic Rewards System
 */

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'report' | 'activity' | 'impact' | 'special';
}

export interface CityReward {
  id: string;
  title: string;
  category: 'metro' | 'culture' | 'sport' | 'green' | 'transit';
  categoryLabel: string;
  pointsCost: number;
  description: string;
  provider: string; // e.g. "شرکت بهره‌برداری مترو تهران", "سازمان فرهنگی هنری شهرداری"
  validityDays: number;
  icon: string;
}

export interface RedeemedVoucher {
  id: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  code: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
}

export interface CitizenProfile {
  name: string;
  avatar: string;
  joinedAt: string;
  points: number;
  level: number;
  levelTitle: string;
  nextLevelPoints: number;
  prevLevelPoints: number;
  progressPercent: number;
  reportsCount: number;
  resolvedCount: number;
  upvotesCount: number;
  badges: Badge[];
  redeemedVouchers: RedeemedVoucher[];
}

const STORAGE_KEY = 'tehran_citizen_profile_v1';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_report',
    title: 'اولین گزارش',
    description: 'اولین گزارش وضعیت شهری را در دیده‌بان ثبت کردید.',
    icon: '🏁',
    unlocked: true,
    unlockedAt: '۱۴۰۳/۰۴/۱۰',
    category: 'report',
  },
  {
    id: 'road_warrior',
    title: 'ناظر مسیر',
    description: 'ثبت بیش از ۳ گزارش در ایستگاه‌های تبادلی و خطوط پرتردد.',
    icon: '🚧',
    unlocked: true,
    unlockedAt: '۱۴۰۳/۰۵/۰۲',
    category: 'activity',
  },
  {
    id: 'trash_buster',
    title: 'پاکبان شهر',
    description: 'گزارش موفق در زمینه بهداشت، نظافت و سطل‌های زباله ایستگاه.',
    icon: '♻️',
    unlocked: true,
    unlockedAt: '۱۴۰۳/۰۵/۱۸',
    category: 'impact',
  },
  {
    id: 'night_owl',
    title: 'دیده‌بان شب',
    description: 'ثبت گزارش در ساعات پایانی شب (بعد از ساعت ۲۰).',
    icon: '💡',
    unlocked: false,
    category: 'special',
  },
  {
    id: 'city_hero',
    title: 'قهرمان شهر',
    description: 'رسیدن به سطح ۵ و ثبت بیش از ۲۰ گزارش موثر در شهر.',
    icon: '👑',
    unlocked: false,
    category: 'impact',
  },
  {
    id: 'speed_reporter',
    title: 'گزارشگر چابک',
    description: 'ثبت گزارش سریع در زیر ۳۰ ثانیه بدون معطلی.',
    icon: '⚡',
    unlocked: true,
    unlockedAt: '۱۴۰۳/۰۶/۰۱',
    category: 'activity',
  },
  {
    id: 'photo_scout',
    title: 'شاهد عینی',
    description: 'ارسال تصویر به همراه گزارش برای تسریع در پیگیری مسئولین.',
    icon: '📸',
    unlocked: false,
    category: 'report',
  },
  {
    id: 'metro_master',
    title: 'استاد مترو',
    description: 'ثبت گزارش در حداقل ۳ خط مختلف متروی تهران.',
    icon: '🚇',
    unlocked: false,
    category: 'activity',
  },
];

export const CITY_REWARDS_CATALOG: CityReward[] = [
  {
    id: 'metro_charge_50',
    title: 'شارژ ۵۰,۰۰۰ تومانی کارت بلیت مترو و BRT',
    category: 'metro',
    categoryLabel: 'حمل‌ونقل عمومی',
    pointsCost: 450,
    description: 'اعتبار مستقیم قابل شارژ روی کارت بلیت الکترونیک تهران (ای‌تیکت / البرز کارت)',
    provider: 'شرکت بهره‌برداری راه‌آهن شهری تهران و حومه',
    validityDays: 60,
    icon: '💳',
  },
  {
    id: 'metro_charge_20',
    title: 'شارژ ۲۰,۰۰۰ تومانی کارت بلیت مترو',
    category: 'metro',
    categoryLabel: 'حمل‌ونقل عمومی',
    pointsCost: 200,
    description: 'اعتبار شارژ برای سفرهای درون‌شهری مترو و اتوبوس‌های تندرو',
    provider: 'شرکت بهره‌برداری متروی تهران',
    validityDays: 45,
    icon: '🚇',
  },
  {
    id: 'cinema_discount_50',
    title: 'کد تخفیف ۵۰٪ پردیس‌های سینمایی شهرداری',
    category: 'culture',
    categoryLabel: 'فرهنگی و تفریحی',
    pointsCost: 250,
    description: 'قابل استفاده در سینماهای آزادی، ملت، کوروش و پردیس‌های شهرداری تهران',
    provider: 'موسسه تصویر شهر — شهرداری تهران',
    validityDays: 30,
    icon: '🎬',
  },
  {
    id: 'pool_discount_40',
    title: 'بن تخفیف ۴۰٪ مجموعه‌های آبی و ورزشی',
    category: 'sport',
    categoryLabel: 'ورزش و سلامت',
    pointsCost: 300,
    description: 'قابل استفاده در تمام استخرها و سالن‌های ورزشی وابسته به سازمان ورزش شهرداری',
    provider: 'سازمان ورزش شهرداری تهران',
    validityDays: 45,
    icon: '🏊‍♂️',
  },
  {
    id: 'bike_share_3h',
    title: '۳ ساعت اشتراک رایگان دوچرخه و اسکوتر برقی',
    category: 'transit',
    categoryLabel: 'هوای پاک',
    pointsCost: 150,
    description: 'اعتبار زمانی برای استفاده از ناوگان دوچرخه‌ها و اسکوترهای اشتراکی پایتخت',
    provider: 'سامانه دوچرخه اشتراکی تهران',
    validityDays: 30,
    icon: '🚲',
  },
  {
    id: 'tree_planting',
    title: 'کاشت نهال شناسنامه‌دار به نام شما در بوستان‌های تهران',
    category: 'green',
    categoryLabel: 'محیط زیست',
    pointsCost: 600,
    description: 'کاشت یک اصله نهال با پلاک اختصاصی و شناسنامه دیجیتال در طرح کمربند سبز تهران',
    provider: 'سازمان بوستان‌ها و فضای سبز شهر تهران',
    validityDays: 180,
    icon: '🌳',
  },
  {
    id: 'library_membership',
    title: 'عضویت رایگان یک‌ساله شبکه کتابخانه‌های عمومی',
    category: 'culture',
    categoryLabel: 'فرهنگی',
    pointsCost: 200,
    description: 'امکان امانت کتاب از بیش از ۸۰ کتابخانه فعال زیر نظر فرهنگسراهای تهران',
    provider: 'سازمان فرهنگی هنری شهرداری تهران',
    validityDays: 90,
    icon: '📚',
  },
];

const LEVELS = [
  { level: 1, title: 'مسافر آگاه', min: 0, max: 299 },
  { level: 2, title: 'دیده‌بان محله', min: 300, max: 599 },
  { level: 3, title: 'همیار فعال شهر', min: 600, max: 999 },
  { level: 4, title: 'سفیر حمل‌ونقل', min: 1000, max: 1499 },
  { level: 5, title: 'دیده‌بان ارشد پایتخت', min: 1500, max: 2500 },
];

export function calculateLevel(points: number) {
  for (const lvl of LEVELS) {
    if (points >= lvl.min && points <= lvl.max) {
      const range = lvl.max - lvl.min;
      const progress = Math.min(100, Math.round(((points - lvl.min) / range) * 100));
      return {
        level: lvl.level,
        levelTitle: lvl.title,
        prevLevelPoints: lvl.min,
        nextLevelPoints: lvl.max,
        progressPercent: progress,
      };
    }
  }
  // Level 5+
  return {
    level: 5,
    levelTitle: 'دیده‌بان ارشد پایتخت',
    prevLevelPoints: 1500,
    nextLevelPoints: 2000,
    progressPercent: 95,
  };
}

const DEFAULT_PROFILE: CitizenProfile = {
  name: 'شهروند دیده‌بان',
  avatar: '👋',
  joinedAt: '۳ ماه پیش',
  points: 1240, // همانند موکاپ ۱۲۴۰ امتیاز جذاب برای نمایش اولیه
  level: 4,
  levelTitle: 'گزارشگر سطح ۴',
  nextLevelPoints: 1500,
  prevLevelPoints: 1000,
  progressPercent: 83,
  reportsCount: 23,
  resolvedCount: 15,
  upvotesCount: 87,
  badges: ALL_BADGES,
  redeemedVouchers: [
    {
      id: 'v-sample-1',
      rewardId: 'metro_charge_20',
      rewardTitle: 'شارژ ۲۰,۰۰۰ تومانی کارت بلیت مترو',
      pointsSpent: 200,
      code: 'METRO-7824-TH',
      createdAt: '۱۴۰۳/۰۶/۱۰',
      expiresAt: '۱۴۰۳/۰۷/۲۵',
      isUsed: false,
    },
  ],
};

export function getCitizenProfile(): CitizenProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    const lvl = calculateLevel(parsed.points ?? 1240);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      level: lvl.level,
      levelTitle: lvl.levelTitle,
      nextLevelPoints: lvl.nextLevelPoints,
      prevLevelPoints: lvl.prevLevelPoints,
      progressPercent: lvl.progressPercent,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveCitizenProfile(profile: CitizenProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save citizen profile', e);
  }
}

export function awardPointsForReport(options?: { hasPhoto?: boolean; isNight?: boolean }): {
  pointsEarned: number;
  newTotal: number;
  unlockedBadge?: Badge;
  profile: CitizenProfile;
} {
  const profile = getCitizenProfile();
  let pointsToAdd = 50; // پایه برای هر گزارش
  if (options?.hasPhoto) pointsToAdd += 25; // پاداش تصویر
  if (options?.isNight) pointsToAdd += 15; // پاداش گزارش شبانه

  const newPoints = profile.points + pointsToAdd;
  const newReportsCount = profile.reportsCount + 1;
  const newUpvotes = profile.upvotesCount + Math.floor(Math.random() * 3) + 1;

  // بررسی آنلاک شدن نشان‌ها
  let newlyUnlockedBadge: Badge | undefined;
  const updatedBadges = profile.badges.map((b) => {
    if (!b.unlocked) {
      if (b.id === 'photo_scout' && options?.hasPhoto) {
        newlyUnlockedBadge = { ...b, unlocked: true, unlockedAt: 'همین الان' };
        return newlyUnlockedBadge;
      }
      if (b.id === 'night_owl' && options?.isNight) {
        newlyUnlockedBadge = { ...b, unlocked: true, unlockedAt: 'همین الان' };
        return newlyUnlockedBadge;
      }
      if (b.id === 'city_hero' && newReportsCount >= 25) {
        newlyUnlockedBadge = { ...b, unlocked: true, unlockedAt: 'همین الان' };
        return newlyUnlockedBadge;
      }
    }
    return b;
  });

  const lvl = calculateLevel(newPoints);
  const updatedProfile: CitizenProfile = {
    ...profile,
    points: newPoints,
    reportsCount: newReportsCount,
    upvotesCount: newUpvotes,
    badges: updatedBadges,
    level: lvl.level,
    levelTitle: lvl.levelTitle,
    nextLevelPoints: lvl.nextLevelPoints,
    prevLevelPoints: lvl.prevLevelPoints,
    progressPercent: lvl.progressPercent,
  };

  saveCitizenProfile(updatedProfile);

  return {
    pointsEarned: pointsToAdd,
    newTotal: newPoints,
    unlockedBadge: newlyUnlockedBadge,
    profile: updatedProfile,
  };
}

export function redeemCityService(rewardId: string): {
  success: boolean;
  message: string;
  voucher?: RedeemedVoucher;
  updatedProfile?: CitizenProfile;
} {
  const profile = getCitizenProfile();
  const reward = CITY_REWARDS_CATALOG.find((r) => r.id === rewardId);

  if (!reward) {
    return { success: false, message: 'جایزه یا خدمت مورد نظر یافت نشد.' };
  }

  if (profile.points < reward.pointsCost) {
    return {
      success: false,
      message: `سکه کافی ندارید. شما ${profile.points} سکه دارید، اما این خدمت نیاز به ${reward.pointsCost} سکه دارد.`,
    };
  }

  // Generate random readable voucher
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const prefix = reward.category.toUpperCase().slice(0, 3);
  const code = `TEH-${prefix}-${randNum}`;

  const now = new Date();
  const exp = new Date(now.getTime() + reward.validityDays * 864e5);
  const dateStr = now.toLocaleDateString('fa-IR');
  const expStr = exp.toLocaleDateString('fa-IR');

  const newVoucher: RedeemedVoucher = {
    id: `v-${Date.now()}`,
    rewardId: reward.id,
    rewardTitle: reward.title,
    pointsSpent: reward.pointsCost,
    code,
    createdAt: dateStr,
    expiresAt: expStr,
    isUsed: false,
  };

  const newPoints = profile.points - reward.pointsCost;
  const lvl = calculateLevel(newPoints);

  const updatedProfile: CitizenProfile = {
    ...profile,
    points: newPoints,
    redeemedVouchers: [newVoucher, ...profile.redeemedVouchers],
    level: lvl.level,
    levelTitle: lvl.levelTitle,
    nextLevelPoints: lvl.nextLevelPoints,
    prevLevelPoints: lvl.prevLevelPoints,
    progressPercent: lvl.progressPercent,
  };

  saveCitizenProfile(updatedProfile);

  return {
    success: true,
    message: `تبریک! خدمت شهری «${reward.title}» با موفقیت دریافت شد.`,
    voucher: newVoucher,
    updatedProfile,
  };
}
