import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding lines and stations...')

  // ======== LINES ========
  const lines = [
    // Metro
    { id: 'line-1', name: 'خط ۱ (تجریش - کهریزک)', mode: 'metro', color: '#E3000F' },
    { id: 'line-2', name: 'خط ۲ (صادقیه - فرهنگسرا)', mode: 'metro', color: '#0039A6' },
    { id: 'line-3', name: 'خط ۳ (قائم - آزادگان)', mode: 'metro', color: '#00BCE4' },
    { id: 'line-4', name: 'خط ۴ (شهید کلاهدوز - علامه جعفری)', mode: 'metro', color: '#FFD700' },
    { id: 'line-5', name: 'خط ۵ (صادقیه - هشتگرد)', mode: 'metro', color: '#008000' },
    { id: 'line-6', name: 'خط ۶ (دولت‌آباد - کوهسار)', mode: 'metro', color: '#FF69B4' },
    { id: 'line-7', name: 'خط ۷ (بسیج - میدان کتاب)', mode: 'metro', color: '#8A2BE2' },
    // BRT
    { id: 'brt-1', name: 'خط ۱ BRT (تهرانپارس - آزادی)', mode: 'brt', color: '#FF0000' },
    { id: 'brt-2', name: 'خط ۲ BRT (خاوران - آزادی)', mode: 'brt', color: '#0000FF' },
    { id: 'brt-3', name: 'خط ۳ BRT (خاوران - علم و صنعت)', mode: 'brt', color: '#00AA00' },
    { id: 'brt-4', name: 'خط ۴ BRT (شهید افشار - پایانه جنوب)', mode: 'brt', color: '#FFA500' },
    { id: 'brt-5', name: 'خط ۵ BRT (علم و صنعت - بیهقی)', mode: 'brt', color: '#800080' },
    { id: 'brt-6', name: 'خط ۶ BRT (لاله - شهید افشار)', mode: 'brt', color: '#008080' },
    { id: 'brt-7', name: 'خط ۷ BRT (تجریش - راه‌آهن)', mode: 'brt', color: '#00FF00' },
    { id: 'brt-8', name: 'خط ۸ BRT (خاوران - پایانه جنوب)', mode: 'brt', color: '#00CED1' },
    { id: 'brt-9', name: 'خط ۹ BRT (لاله - جوانمرد قصاب)', mode: 'brt', color: '#90EE90' },
    { id: 'brt-10', name: 'خط ۱۰ BRT (علوم و تحقیقات - آزادگان)', mode: 'brt', color: '#FF8C00' },
  ]

  for (const line of lines) {
    await prisma.line.upsert({
      where: { id: line.id },
      update: line,
      create: line,
    })
  }

  // ======== STATIONS ========
  interface StationInput {
    name: string
    lines: string
    isInterchange?: boolean
    lat?: number
    lng?: number
  }

  const stationsData: StationInput[] = [

    // ===========================
    // METRO خط ۱ (تجریش - کهریزک)
    // ===========================
    { name: 'تجریش', lines: '["line-1"]', lat: 35.8055, lng: 51.4284 },
    { name: 'قیطریه', lines: '["line-1"]' },
    { name: 'شهید صدر', lines: '["line-1"]' },
    { name: 'قلهک', lines: '["line-1"]' },
    { name: 'دکتر شریعتی', lines: '["line-1"]' },
    { name: 'میرداماد', lines: '["line-1"]' },
    { name: 'شهید حقانی', lines: '["line-1"]' },
    { name: 'شهید همت', lines: '["line-1"]' },
    { name: 'مصلی امام خمینی', lines: '["line-1"]' },
    { name: 'شهید بهشتی', lines: '["line-1"]', isInterchange: true },
    { name: 'شهید مفتح', lines: '["line-1"]' },
    { name: 'شهدای هفتم تیر', lines: '["line-1"]', isInterchange: true },
    { name: 'طالقانی', lines: '["line-1"]' },
    { name: 'دروازه دولت', lines: '["line-1"]', isInterchange: true },
    { name: 'سعدی', lines: '["line-1"]' },
    { name: 'امام خمینی', lines: '["line-1"]', isInterchange: true, lat: 35.6865, lng: 51.4208 },
    { name: 'پانزده خرداد', lines: '["line-1"]' },
    { name: 'خیام', lines: '["line-1"]' },
    { name: 'میدان محمدیه', lines: '["line-1"]', isInterchange: true },
    { name: 'شوش', lines: '["line-1"]' },
    { name: 'پایانه جنوب', lines: '["line-1"]' },
    { name: 'شهید بخارایی', lines: '["line-1"]' },
    { name: 'علی‌آباد', lines: '["line-1"]' },
    { name: 'جوانمرد قصاب', lines: '["line-1"]' },
    { name: 'شهرری', lines: '["line-1"]' },
    { name: 'پالایشگاه', lines: '["line-1"]' },
    { name: 'شاهد - باقرشهر', lines: '["line-1"]' },
    { name: 'حرم مطهر امام خمینی', lines: '["line-1"]' },
    { name: 'کهریزک', lines: '["line-1"]' },
    { name: 'نمایشگاه شهر آفتاب', lines: '["line-1"]' },
    { name: 'فرودگاه امام خمینی', lines: '["line-1"]' },
    { name: 'پرند', lines: '["line-1"]' },

    // ===========================
    // METRO خط ۲ (صادقیه - فرهنگسرا)
    // ===========================
    { name: 'صادقیه', lines: '["line-2"]', isInterchange: true, lat: 35.7197, lng: 51.3464 },
    { name: 'طرشت', lines: '["line-2"]' },
    { name: 'دانشگاه شریف', lines: '["line-2"]' },
    { name: 'شادمان', lines: '["line-2"]', isInterchange: true },
    { name: 'شهید نواب صفوی', lines: '["line-2"]', isInterchange: true },
    { name: 'میدان حر', lines: '["line-2"]' },
    { name: 'دانشگاه امام علی', lines: '["line-2"]' },
    { name: 'حسن‌آباد', lines: '["line-2"]' },
    { name: 'امام خمینی', lines: '["line-2"]', isInterchange: true, lat: 35.6865, lng: 51.4208 },
    { name: 'ملت', lines: '["line-2"]' },
    { name: 'بهارستان', lines: '["line-2"]' },
    { name: 'دروازه شمیران', lines: '["line-2"]', isInterchange: true },
    { name: 'امام حسین', lines: '["line-2"]', isInterchange: true },
    { name: 'شهید مدنی', lines: '["line-2"]' },
    { name: 'سبلان', lines: '["line-2"]' },
    { name: 'فدک', lines: '["line-2"]' },
    { name: 'جانبازان', lines: '["line-2"]' },
    { name: 'سرسبز', lines: '["line-2"]' },
    { name: 'دانشگاه علم و صنعت', lines: '["line-2"]' },
    { name: 'شهید باقری', lines: '["line-2"]' },
    { name: 'تهرانپارس', lines: '["line-2"]' },
    { name: 'فرهنگسرا', lines: '["line-2"]' },

    // ===========================
    // METRO خط ۳ (قائم - آزادگان)
    // ===========================
    { name: 'قائم', lines: '["line-3"]' },
    { name: 'شهید محلاتی', lines: '["line-3"]' },
    { name: 'اقدسیه', lines: '["line-3"]' },
    { name: 'نوبنیاد', lines: '["line-3"]' },
    { name: 'حسین‌آباد', lines: '["line-3"]' },
    { name: 'میدان هروی', lines: '["line-3"]' },
    { name: 'شهید زین‌الدین', lines: '["line-3"]' },
    { name: 'خواجه عبدالله انصاری', lines: '["line-3"]' },
    { name: 'شهید صیاد شیرازی', lines: '["line-3"]' },
    { name: 'شهید قدوسی', lines: '["line-3"]' },
    { name: 'سهروردی', lines: '["line-3"]' },
    { name: 'میرزای شیرازی', lines: '["line-3"]' },
    { name: 'میدان جهاد', lines: '["line-3"]' },
    { name: 'میدان ولیعصر', lines: '["line-3"]', isInterchange: true },
    { name: 'تئاتر شهر', lines: '["line-3"]', isInterchange: true, lat: 35.7009, lng: 51.4020 },
    { name: 'منیریه', lines: '["line-3"]' },
    { name: 'راه‌آهن', lines: '["line-3"]' },
    { name: 'جوادیه', lines: '["line-3"]' },
    { name: 'زمزم', lines: '["line-3"]' },
    { name: 'شهرک شریعتی', lines: '["line-3"]' },
    { name: 'عبدالآباد', lines: '["line-3"]' },
    { name: 'نعمت‌آباد', lines: '["line-3"]' },
    { name: 'آزادگان', lines: '["line-3"]' },

    // ===========================
    // METRO خط ۴ (شهید کلاهدوز - علامه جعفری)
    // ===========================
    { name: 'شهید کلاهدوز', lines: '["line-4"]' },
    { name: 'نیروی هوایی', lines: '["line-4"]' },
    { name: 'نبرد', lines: '["line-4"]' },
    { name: 'پیروزی', lines: '["line-4"]' },
    { name: 'ابن‌سینا', lines: '["line-4"]' },
    { name: 'میدان شهدا', lines: '["line-4"]', isInterchange: true },
    { name: 'دروازه شمیران', lines: '["line-4"]', isInterchange: true },
    { name: 'دروازه دولت', lines: '["line-4"]', isInterchange: true },
    { name: 'فردوسی', lines: '["line-4"]' },
    { name: 'تئاتر شهر', lines: '["line-4"]', isInterchange: true, lat: 35.7009, lng: 51.4020 },
    { name: 'میدان انقلاب اسلامی', lines: '["line-4"]' },
    { name: 'توحید', lines: '["line-4"]', isInterchange: true },
    { name: 'شادمان', lines: '["line-4"]', isInterchange: true },
    { name: 'دکتر حبیب‌الله', lines: '["line-4"]' },
    { name: 'استاد معین', lines: '["line-4"]' },
    { name: 'میدان آزادی', lines: '["line-4"]', lat: 35.6997, lng: 51.3479 },
    { name: 'بیمه', lines: '["line-4"]' },
    { name: 'شهرک اکباتان', lines: '["line-4"]' },
    { name: 'ارم سبز', lines: '["line-4"]', isInterchange: true },
    { name: 'علامه جعفری', lines: '["line-4"]' },
    { name: 'پایانه ۱ و ۲ فرودگاه مهرآباد', lines: '["line-4"]' },
    { name: 'پایانه ۴ و ۶ فرودگاه مهرآباد', lines: '["line-4"]' },

    // ===========================
    // METRO خط ۵ (صادقیه - شهید سلیمانی)
    // ===========================
    { name: 'صادقیه', lines: '["line-5"]', isInterchange: true, lat: 35.7197, lng: 51.3464 },
    { name: 'ارم سبز', lines: '["line-5"]', isInterchange: true },
    { name: 'ورزشگاه آزادی', lines: '["line-5"]' },
    { name: 'پیکان‌شهر', lines: '["line-5"]' },
    { name: 'چیتگر', lines: '["line-5"]' },
    { name: 'ایران خودرو', lines: '["line-5"]' },
    { name: 'وردآورد', lines: '["line-5"]' },
    { name: 'گرمدره', lines: '["line-5"]' },
    { name: 'اتمسفر', lines: '["line-5"]' },
    { name: 'کرج', lines: '["line-5"]' },
    { name: 'محمدشهر', lines: '["line-5"]' },
    { name: 'گلشهر', lines: '["line-5"]' },
    { name: 'شهید فخری‌زاده', lines: '["line-5"]' },
    { name: 'شهید سپهبد قاسم سلیمانی (هشتگرد)', lines: '["line-5"]' },

    // ===========================
    // METRO خط ۶ (کوهسار - دولت‌آباد)
    // ===========================
    { name: 'کوهسار', lines: '["line-6"]' },
    { name: 'شهدای کن', lines: '["line-6"]' },
    { name: 'شهران', lines: '["line-6"]' },
    { name: 'شهر زیبا', lines: '["line-6"]' },
    { name: 'آیت‌الله کاشانی', lines: '["line-6"]' },
    { name: 'شهید ستاری', lines: '["line-6"]' },
    { name: 'شهید اشرفی اصفهانی', lines: '["line-6"]' },
    { name: 'یادگار امام', lines: '["line-6"]' },
    { name: 'مرزداران', lines: '["line-6"]' },
    { name: 'شهرک آزمایش', lines: '["line-6"]' },
    { name: 'دانشگاه تربیت مدرس', lines: '["line-6"]', isInterchange: true },
    { name: 'کارگر', lines: '["line-6"]' },
    { name: 'بوستان لاله', lines: '["line-6"]' },
    { name: 'میدان ولیعصر', lines: '["line-6"]', isInterchange: true },
    { name: 'شهید نجات‌اللهی', lines: '["line-6"]' },
    { name: 'شهدای هفتم تیر', lines: '["line-6"]', isInterchange: true },
    { name: 'بهار شیراز', lines: '["line-6"]' },
    { name: 'سرباز', lines: '["line-6"]' },
    { name: 'امام حسین', lines: '["line-6"]', isInterchange: true },
    { name: 'میدان شهدا', lines: '["line-6"]', isInterchange: true },
    { name: 'امیرکبیر', lines: '["line-6"]' },
    { name: 'شهدای هفده شهریور', lines: '["line-6"]', isInterchange: true },
    { name: 'میدان خراسان', lines: '["line-6"]' },
    { name: 'شهید رضایی', lines: '["line-6"]' },
    { name: 'بعثت', lines: '["line-6"]' },
    { name: 'کیان‌شهر', lines: '["line-6"]' },
    { name: 'دولت‌آباد', lines: '["line-6"]' },

    // ===========================
    // METRO خط ۷ (میدان کتاب - ورزشگاه تختی)
    // ===========================
    { name: 'میدان کتاب', lines: '["line-7"]' },
    { name: 'شهید دادمان', lines: '["line-7"]' },
    { name: 'میدان صنعت', lines: '["line-7"]' },
    { name: 'برج میلاد', lines: '["line-7"]' },
    { name: 'بوستان گفتگو', lines: '["line-7"]' },
    { name: 'دانشگاه تربیت مدرس', lines: '["line-7"]', isInterchange: true },
    { name: 'مدافعان سلامت', lines: '["line-7"]' },
    { name: 'توحید', lines: '["line-7"]', isInterchange: true },
    { name: 'شهید نواب صفوی', lines: '["line-7"]', isInterchange: true },
    { name: 'رودکی', lines: '["line-7"]' },
    { name: 'کمیل', lines: '["line-7"]' },
    { name: 'بریانک', lines: '["line-7"]' },
    { name: 'هلال احمر', lines: '["line-7"]', isInterchange: true },
    { name: 'مهدیه', lines: '["line-7"]' },
    { name: 'میدان محمدیه', lines: '["line-7"]', isInterchange: true },
    { name: 'مولوی', lines: '["line-7"]' },
    { name: 'میدان قیام', lines: '["line-7"]' },
    { name: 'شهدای هفده شهریور', lines: '["line-7"]', isInterchange: true },
    { name: 'چهل تن دولاب', lines: '["line-7"]' },
    { name: 'آهنگ', lines: '["line-7"]' },
    { name: 'بسیج', lines: '["line-7"]' },
    { name: 'ورزشگاه تختی', lines: '["line-7"]' },
    // ===========================
    // BRT LINE 1 (چهارراه تهرانپارس - پایانه آزادی)
    // ===========================
    { name: 'چهارراه تهرانپارس', lines: '["brt-1"]' },
    { name: 'داریوش', lines: '["brt-1"]' },
    { name: 'خاقانی', lines: '["brt-1"]' },
    { name: 'ابوریحان', lines: '["brt-1"]' },
    { name: 'شهید دکتر آیت', lines: '["brt-1", "brt-3"]', isInterchange: true },
    { name: 'پل نیروی هوایی', lines: '["brt-1"]' },
    { name: 'وحیدیه', lines: '["brt-1"]' },
    { name: 'سبلان (BRT)', lines: '["brt-1"]' },
    { name: 'فرودگاه (بهرامی)', lines: '["brt-1"]' },
    { name: 'شهید فتحنایی', lines: '["brt-1"]' },
    { name: 'بوعلی', lines: '["brt-1"]' },
    { name: 'شهید منتظری', lines: '["brt-1"]' },
    { name: 'میدان امام حسین (BRT)', lines: '["brt-1"]' },
    { name: 'پل چوبی', lines: '["brt-1"]' },
    { name: 'پیچ شمیران', lines: '["brt-1"]' },
    { name: 'دروازه دولت (BRT)', lines: '["brt-1"]' },
    { name: 'میدان فردوسی', lines: '["brt-1"]' },
    { name: 'چهارراه ولیعصر', lines: '["brt-1", "brt-7"]', isInterchange: true },
    { name: 'دانشگاه تهران', lines: '["brt-1"]' },
    { name: 'میدان انقلاب (BRT)', lines: '["brt-1"]' },
    { name: 'دکتر قریب', lines: '["brt-1"]' },
    { name: 'نواب (BRT)', lines: '["brt-1", "brt-4"]', isInterchange: true },
    { name: 'بهبودی', lines: '["brt-1"]' },
    { name: 'دانشگاه شریف (BRT)', lines: '["brt-1"]' },
    { name: 'استاد معین (BRT)', lines: '["brt-1"]' },
    { name: 'میدان آزادی (BRT)', lines: '["brt-1", "brt-2", "brt-10"]', isInterchange: true },
    { name: 'پایانه آزادی', lines: '["brt-1", "brt-2", "brt-10"]', isInterchange: true },

    // ===========================
    // BRT LINE 2 (پایانه خاوران - پایانه آزادی)
    // ===========================
    { name: 'پایانه خاوران', lines: '["brt-2", "brt-3", "brt-8"]', isInterchange: true },
    { name: 'پمپ بنزین (خاوران)', lines: '["brt-2"]' },
    { name: 'فرهنگسرای خاوران', lines: '["brt-2"]' },
    { name: 'باسکول', lines: '["brt-2"]' },
    { name: 'اتابک', lines: '["brt-2"]' },
    { name: 'نفیس', lines: '["brt-2"]' },
    { name: 'امیرسلیمانی', lines: '["brt-2"]' },
    { name: 'مخبر', lines: '["brt-2"]' },
    { name: 'میدان خراسان (BRT)', lines: '["brt-2"]' },
    { name: 'زیبا', lines: '["brt-2"]' },
    { name: 'شهید مشهدی‌رحیم', lines: '["brt-2"]' },
    { name: 'میدان قیام (BRT)', lines: '["brt-2"]' },
    { name: 'چهارراه مولوی', lines: '["brt-2"]' },
    { name: 'سعادت', lines: '["brt-2"]' },
    { name: 'میدان محمدیه (BRT)', lines: '["brt-2"]' },
    { name: 'وحدت اسلامی', lines: '["brt-2"]' },
    { name: 'ولیعصر (مولوی)', lines: '["brt-2", "brt-7"]', isInterchange: true },
    { name: 'میدان رازی', lines: '["brt-2"]' },
    { name: 'عباسی', lines: '["brt-2"]' },
    { name: 'هلال احمر (BRT)', lines: '["brt-2", "brt-4"]', isInterchange: true },
    { name: 'کشاورز', lines: '["brt-2"]' },
    { name: 'امامزاده معصوم', lines: '["brt-2"]' },
    { name: 'دوراهی قپان', lines: '["brt-2"]' },
    { name: 'فرهنگسرای قرآن', lines: '["brt-2"]' },
    { name: 'سه‌راه آذری', lines: '["brt-2"]' },
    { name: 'شمشیری', lines: '["brt-2"]' },
    { name: 'شهید بختیاری', lines: '["brt-2"]' },
    { name: 'هاشمی', lines: '["brt-2"]' },
    // میدان آزادی (BRT) and پایانه آزادی already added in BRT Line 1

    // ===========================
    // BRT LINE 3 (پایانه خاوران - پایانه علم و صنعت)
    // ===========================
    // پایانه خاوران already added in BRT Line 2
    { name: 'بسیج (BRT)', lines: '["brt-3"]' },
    { name: 'شهید رحمانی', lines: '["brt-3"]' },
    { name: 'ولیعصر (بسیج)', lines: '["brt-3"]' },
    { name: 'شهید آشوری', lines: '["brt-3"]' },
    { name: 'آهنگ (BRT)', lines: '["brt-3"]' },
    { name: 'شهید رحیمی', lines: '["brt-3"]' },
    { name: 'شهید محلاتی (BRT)', lines: '["brt-3"]' },
    { name: 'قصر فیروزه', lines: '["brt-3"]' },
    { name: 'ائمه اطهار', lines: '["brt-3"]' },
    { name: 'شهید حبیبی', lines: '["brt-3"]' },
    { name: 'پیروزی (BRT)', lines: '["brt-3"]' },
    { name: 'نیروی هوایی (BRT)', lines: '["brt-3"]' },
    { name: 'امامت', lines: '["brt-3"]' },
    // شهید دکتر آیت already added in BRT Line 1 with interchange
    { name: 'تلفن‌خانه', lines: '["brt-3"]' },
    { name: 'نبوت', lines: '["brt-3"]' },
    { name: 'سرسبز (BRT)', lines: '["brt-3"]' },
    { name: 'پایانه علم و صنعت', lines: '["brt-3", "brt-5"]', isInterchange: true },

    // ===========================
    // BRT LINE 4 (پایانه شهید افشار - پایانه جنوب)
    // ===========================
    { name: 'پایانه شهید افشار', lines: '["brt-4", "brt-6", "brt-7"]', isInterchange: true },
    { name: 'تابناک', lines: '["brt-4"]' },
    { name: 'نمایشگاه بین‌المللی', lines: '["brt-4"]' },
    { name: 'آتی‌ساز', lines: '["brt-4"]' },
    { name: 'پل مدیریت', lines: '["brt-4"]' },
    { name: 'ملاصدرا', lines: '["brt-4"]' },
    { name: 'کوی نصر (گیشا)', lines: '["brt-4"]' },
    { name: 'باقرخان', lines: '["brt-4"]' },
    { name: 'میدان توحید', lines: '["brt-4"]' },
    { name: 'فرصت شیرازی', lines: '["brt-4"]' },
    { name: 'میدان جمهوری اسلامی', lines: '["brt-4"]' },
    { name: 'آذربایجان', lines: '["brt-4"]' },
    { name: 'امام خمینی (نواب)', lines: '["brt-4"]' },
    { name: 'کمیل (BRT)', lines: '["brt-4"]' },
    { name: 'شهید صفدری', lines: '["brt-4"]' },
    { name: 'پل قزوین', lines: '["brt-4"]' },
    // هلال احمر (BRT) already added in BRT Line 2 with interchange
    { name: 'رباط‌کریم', lines: '["brt-4"]' },
    { name: 'پل جوادیه', lines: '["brt-4"]' },
    { name: 'قالیشویی', lines: '["brt-4"]' },
    { name: 'میدان بهمن', lines: '["brt-4"]' },
    { name: 'شهید امامی', lines: '["brt-4"]' },
    { name: 'شهید رجایی (BRT4)', lines: '["brt-4"]' },
    { name: 'پایانه جنوب (BRT)', lines: '["brt-4", "brt-8"]', isInterchange: true },

    // ===========================
    // BRT LINE 5 (پایانه علم و صنعت - پایانه بیهقی)
    // ===========================
    // پایانه علم و صنعت already added in BRT Line 3 with interchange
    { name: 'دکتر آیت (رسالت)', lines: '["brt-5"]' },
    { name: 'میدان رسالت', lines: '["brt-5", "brt-9"]', isInterchange: true },
    { name: 'کرمان', lines: '["brt-5"]' },
    { name: 'اثنی‌عشری', lines: '["brt-5"]' },
    { name: 'استاد حسن بنا', lines: '["brt-5"]' },
    { name: 'سید خندان', lines: '["brt-5"]' },
    { name: 'بهشت مادران', lines: '["brt-5"]' },
    { name: 'مصلی امام خمینی (BRT)', lines: '["brt-5"]' },
    { name: 'پایانه بیهقی', lines: '["brt-5"]' },

    // ===========================
    // BRT LINE 6 (پایانه لاله - پایانه شهید افشار)
    // ===========================
    { name: 'پایانه لاله', lines: '["brt-6", "brt-9"]', isInterchange: true },
    { name: 'کوی یاس', lines: '["brt-6"]' },
    { name: 'کوثر (لاله)', lines: '["brt-6"]' },
    { name: 'دانشگاه اهل بیت', lines: '["brt-6"]' },
    { name: 'سازمان جنگل‌ها', lines: '["brt-6"]' },
    { name: 'ایران خودرو (BRT)', lines: '["brt-6"]' },
    { name: 'شهرک شهید محلاتی', lines: '["brt-6"]' },
    { name: 'دانشگاه پیام نور', lines: '["brt-6"]' },
    { name: 'ازگل', lines: '["brt-6"]' },
    { name: 'اراج', lines: '["brt-6"]' },
    { name: 'شهرک شهید رجایی', lines: '["brt-6"]' },
    { name: 'نوبنیاد (BRT)', lines: '["brt-6"]' },
    { name: 'اختیاریه شمالی', lines: '["brt-6"]' },
    { name: 'دیباجی', lines: '["brt-6"]' },
    { name: 'قیطریه (BRT)', lines: '["brt-6"]' },
    { name: 'بهار', lines: '["brt-6"]' },
    { name: 'دستور', lines: '["brt-6"]' },
    { name: 'الهیه', lines: '["brt-6"]' },
    // پایانه شهید افشار already added in BRT Line 4 with interchange

    // ===========================
    // BRT LINE 7 (پایانه تجریش - پایانه معین/راه‌آهن)
    // ===========================
    { name: 'پایانه تجریش', lines: '["brt-7"]' },
    { name: 'شهید کاظمی', lines: '["brt-7"]' },
    { name: 'باغ فردوس', lines: '["brt-7"]' },
    { name: 'پسیان', lines: '["brt-7"]' },
    { name: 'همایونی', lines: '["brt-7"]' },
    { name: 'محمودیه', lines: '["brt-7"]' },
    // پایانه شهید افشار already added in BRT Line 4 with interchange
    { name: 'امانیه', lines: '["brt-7"]' },
    { name: 'خبرنگاران', lines: '["brt-7"]' },
    { name: 'پارک ملت', lines: '["brt-7"]' },
    { name: 'نیایش', lines: '["brt-7"]' },
    { name: 'ظفر', lines: '["brt-7"]' },
    { name: 'میرداماد (BRT)', lines: '["brt-7"]' },
    { name: 'سه راه ونک', lines: '["brt-7"]' },
    { name: 'میدان ونک', lines: '["brt-7"]' },
    { name: 'پل همت', lines: '["brt-7"]' },
    { name: 'توانیر', lines: '["brt-7"]' },
    { name: 'حماسی', lines: '["brt-7"]' },
    { name: 'آبشار', lines: '["brt-7"]' },
    { name: 'پله سوم', lines: '["brt-7"]' },
    { name: 'پله اول', lines: '["brt-7"]' },
    { name: 'شهید بهشتی (BRT)', lines: '["brt-7"]' },
    { name: 'شهید مطهری', lines: '["brt-7"]' },
    { name: 'قدس', lines: '["brt-7"]' },
    { name: 'میدان ولیعصر (BRT)', lines: '["brt-7"]' },
    { name: 'دمشق', lines: '["brt-7"]' },
    { name: 'طالقانی (BRT)', lines: '["brt-7"]' },
    // چهارراه ولیعصر already added in BRT Line 1 with interchange
    { name: 'جمهوری', lines: '["brt-7"]' },
    { name: 'جامی', lines: '["brt-7"]' },
    { name: 'امام خمینی (BRT7)', lines: '["brt-7"]' },
    { name: 'منیریه (BRT)', lines: '["brt-7"]' },
    { name: 'فرهنگ', lines: '["brt-7"]' },
    { name: 'پل امیربهادر', lines: '["brt-7"]' },
    { name: 'شهید مدرس', lines: '["brt-7"]' },
    { name: 'معزالسلطان', lines: '["brt-7"]' },
    { name: 'مولوی (BRT)', lines: '["brt-7"]' },
    { name: 'دلبخواه', lines: '["brt-7"]' },
    { name: 'مختاری', lines: '["brt-7"]' },
    { name: 'پایانه معین (راه‌آهن)', lines: '["brt-7"]' },

    // ===========================
    // BRT LINE 8 (پایانه خاوران - پایانه جنوب)
    // ===========================
    // پایانه خاوران already added in BRT Line 2 with interchange
    { name: 'شهرک شهید بروجردی', lines: '["brt-8"]' },
    { name: 'شهرک شاهد', lines: '["brt-8"]' },
    { name: '۱۷ شهریور', lines: '["brt-8"]' },
    { name: 'پارک بعثت', lines: '["brt-8"]' },
    // پایانه جنوب (BRT) already added in BRT Line 4 with interchange

    // ===========================
    // BRT LINE 9 (پایانه لاله - پایانه جوانمرد قصاب)
    // ===========================
    // پایانه لاله already added in BRT Line 6 with interchange
    { name: 'کوثر (BRT9)', lines: '["brt-9"]' },
    { name: 'قائم (BRT)', lines: '["brt-9"]' },
    { name: 'مینی‌سیتی', lines: '["brt-9"]' },
    { name: 'پیام نور (BRT9)', lines: '["brt-9"]' },
    { name: 'ازگل (BRT9)', lines: '["brt-9"]' },
    { name: 'اراج (BRT9)', lines: '["brt-9"]' },
    { name: 'گلشن', lines: '["brt-9"]' },
    { name: 'شهید رجایی (BRT9)', lines: '["brt-9"]' },
    { name: 'شعبانلو', lines: '["brt-9"]' },
    { name: 'کوثری', lines: '["brt-9"]' },
    { name: 'فرجام', lines: '["brt-9"]' },
    // میدان رسالت already added in BRT Line 5 with interchange
    { name: 'رحمتی', lines: '["brt-9"]' },
    { name: 'همسایگان', lines: '["brt-9"]' },
    { name: 'لشگر', lines: '["brt-9"]' },
    { name: 'سبلان (BRT9)', lines: '["brt-9"]' },
    { name: 'اکبرنژاد', lines: '["brt-9"]' },
    { name: 'شهید مدنی (BRT9)', lines: '["brt-9"]' },
    { name: 'دماوند', lines: '["brt-9"]' },
    { name: 'صفا', lines: '["brt-9"]' },
    { name: 'پیروزی (BRT9)', lines: '["brt-9"]' },
    { name: 'نیکنام', lines: '["brt-9"]' },
    { name: 'بوستان رجبی', lines: '["brt-9"]' },
    { name: 'شهید محلاتی (BRT9)', lines: '["brt-9"]' },
    { name: 'زمزم (BRT)', lines: '["brt-9"]' },
    { name: 'خاوران (BRT9)', lines: '["brt-9"]' },
    { name: 'شهید ابراهیمی', lines: '["brt-9"]' },
    { name: 'شهید رضایی (BRT9)', lines: '["brt-9"]' },
    { name: 'شهید بروجردی', lines: '["brt-9"]' },
    { name: 'توسکا', lines: '["brt-9"]' },
    { name: 'معدن', lines: '["brt-9"]' },
    { name: 'شهید تراب', lines: '["brt-9"]' },
    { name: 'شهید غیوری', lines: '["brt-9"]' },
    { name: 'دیلمان', lines: '["brt-9"]' },
    { name: 'گذرنامه', lines: '["brt-9"]' },
    { name: 'میدان نماز', lines: '["brt-9"]' },
    { name: 'پایانه جوانمرد قصاب', lines: '["brt-9"]' },

    // ===========================
    // BRT LINE 10 (علوم و تحقیقات - پایانه آزادگان)
    // ===========================
    { name: 'دانشگاه آزاد علوم و تحقیقات', lines: '["brt-10"]' },
    { name: 'مخابرات', lines: '["brt-10"]' },
    { name: 'الوند', lines: '["brt-10"]' },
    { name: 'شهید اشرفی اصفهانی (BRT)', lines: '["brt-10"]' },
    { name: 'آیت‌الله طالقانی (BRT)', lines: '["brt-10"]' },
    { name: 'مجتمع قضایی قدس', lines: '["brt-10"]' },
    { name: 'پونک شمالی', lines: '["brt-10"]' },
    { name: 'پونک جنوبی', lines: '["brt-10"]' },
    { name: 'شهید مخبری', lines: '["brt-10"]' },
    { name: 'تیراژه', lines: '["brt-10"]' },
    { name: 'باغ فیض', lines: '["brt-10"]' },
    { name: 'مرزداران (BRT)', lines: '["brt-10"]' },
    { name: 'مسجد جامع', lines: '["brt-10"]' },
    { name: 'سازمان آب', lines: '["brt-10"]' },
    { name: 'فلکه دوم صادقیه', lines: '["brt-10"]' },
    { name: 'پایانه صادقیه', lines: '["brt-10"]' },
    { name: 'محمدعلی جناح', lines: '["brt-10"]' },
    // میدان آزادی (BRT) already added in BRT Line 1 with interchange
    { name: 'بوتان', lines: '["brt-10"]' },
    { name: 'درمانگاه مشیری', lines: '["brt-10"]' },
    { name: 'بلوار معلم', lines: '["brt-10"]' },
    { name: 'آموزش و پرورش منطقه ۱۸', lines: '["brt-10"]' },
    { name: 'شهرداری منطقه ۱۸', lines: '["brt-10"]' },
    { name: 'شهید پژاوند', lines: '["brt-10"]' },
    { name: 'شهید سروری', lines: '["brt-10"]' },
    { name: 'نعمت‌آباد (BRT)', lines: '["brt-10"]' },
    { name: 'آزادگان (BRT)', lines: '["brt-10"]' },
    { name: 'پایانه آزادگان', lines: '["brt-10"]' },
  ]

  // Delete existing stations to avoid orphans from old schema
  await prisma.station.deleteMany({})

  // Compute lineOrders and map stations by name
  const stationMap = new Map<string, any>()
  
  for (const st of stationsData) {
    let linesArr: string[] = []
    try { linesArr = JSON.parse(st.lines) } catch {}
    
    if (!stationMap.has(st.name)) {
      stationMap.set(st.name, {
        name: st.name,
        lines: new Set(linesArr),
        isInterchange: st.isInterchange || false,
        lat: st.lat || null,
        lng: st.lng || null,
        lineOrders: {} as Record<string, number>
      })
    } else {
      // Merge lines and properties for duplicate occurrences
      const existing = stationMap.get(st.name)
      linesArr.forEach(l => existing.lines.add(l))
      if (st.isInterchange) existing.isInterchange = true
      if (st.lat) existing.lat = st.lat
      if (st.lng) existing.lng = st.lng
    }
  }

  // Now assign order per line based on occurrence in the array
  const lineCounters: Record<string, number> = {}
  for (const st of stationsData) {
    let linesArr: string[] = []
    try { linesArr = JSON.parse(st.lines) } catch {}
    
    const existing = stationMap.get(st.name)
    for (const l of linesArr) {
      if (!lineCounters[l]) lineCounters[l] = 1
      if (!existing.lineOrders[l]) {
        existing.lineOrders[l] = lineCounters[l]++
      }
    }
  }

  let i = 1
  for (const [name, st] of stationMap.entries()) {
    const sortOrder = i
    const id = `st-${i++}`
    await prisma.station.create({
      data: {
        id,
        name: st.name,
        lines: JSON.stringify(Array.from(st.lines)),
        isInterchange: st.isInterchange || false,
        lat: st.lat || null,
        lng: st.lng || null,
        sortOrder,
        lineOrders: JSON.stringify(st.lineOrders),
      },
    })
  }

  // Also delete old lines that no longer exist
  await prisma.line.deleteMany({
    where: {
      id: { notIn: lines.map(l => l.id) },
    },
  })

  console.log(`Seeded ${lines.length} lines and ${stationsData.length} stations!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
