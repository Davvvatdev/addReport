import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding lines and stations...')

  // Lines
  const lines = [
    { id: 'line-1', name: 'خط ۱ (تجریش - کهریزک)', mode: 'metro', color: '#E3000F' },
    { id: 'line-2', name: 'خط ۲ (صادقیه - فرهنگسرا)', mode: 'metro', color: '#0039A6' },
    { id: 'line-3', name: 'خط ۳ (قائم - آزادگان)', mode: 'metro', color: '#00BCE4' },
    { id: 'line-4', name: 'خط ۴ (شهید کلاهدوز - ارم سبز)', mode: 'metro', color: '#FFD700' },
    { id: 'line-5', name: 'خط ۵ (صادقیه - گلشهر)', mode: 'metro', color: '#008000' },
    { id: 'line-6', name: 'خط ۶ (دولت‌آباد - کوهسار)', mode: 'metro', color: '#FF69B4' },
    { id: 'line-7', name: 'خط ۷ (بسیج - میدان کتاب)', mode: 'metro', color: '#8A2BE2' },
    { id: 'brt-1', name: 'خط ۱ BRT (چهارراه تهرانپارس - آزادی)', mode: 'brt', color: '#FF0000' },
    { id: 'brt-7', name: 'خط ۷ BRT (راه‌آهن - تجریش)', mode: 'brt', color: '#00FF00' },
  ]

  for (const line of lines) {
    await prisma.line.upsert({
      where: { id: line.id },
      update: line,
      create: line,
    })
  }

  const stationsData = [
    // Line 1
    { name: 'تجریش', lines: '["line-1"]', lat: 35.8055, lng: 51.4284 },
    { name: 'قیطریه', lines: '["line-1"]' },
    { name: 'شهید صدر', lines: '["line-1"]' },
    { name: 'قلهک', lines: '["line-1"]' },
    { name: 'دکتر شریعتی', lines: '["line-1"]' },
    { name: 'میرداماد', lines: '["line-1"]' },
    { name: 'شهید حقانی', lines: '["line-1"]' },
    { name: 'شهید همت', lines: '["line-1"]' },
    { name: 'مصلی امام خمینی', lines: '["line-1"]' },
    { name: 'شهید بهشتی', lines: '["line-1", "line-3"]', isInterchange: true },
    { name: 'شهید مفتح', lines: '["line-1"]' },
    { name: 'شهدای هفتم تیر', lines: '["line-1", "line-6"]', isInterchange: true },
    { name: 'طالقانی', lines: '["line-1"]' },
    { name: 'دروازه دولت', lines: '["line-1", "line-4"]', isInterchange: true },
    { name: 'سعدی', lines: '["line-1"]' },
    { name: 'امام خمینی', lines: '["line-1", "line-2"]', lat: 35.6865, lng: 51.4208, isInterchange: true },
    { name: 'پانزده خرداد', lines: '["line-1"]' },
    { name: 'خیام', lines: '["line-1"]' },
    { name: 'میدان محمدیه', lines: '["line-1", "line-7"]', isInterchange: true },
    { name: 'شوش', lines: '["line-1"]' },
    { name: 'پایانه جنوب', lines: '["line-1"]' },
    { name: 'شهید بخارایی', lines: '["line-1"]' },
    { name: 'علی‌آباد', lines: '["line-1"]' },
    { name: 'جوانمرد قصاب', lines: '["line-1"]' },
    { name: 'شهرری', lines: '["line-1"]' },
    { name: 'پالایشگاه', lines: '["line-1"]' },
    { name: 'شاهد - باقرشهر', lines: '["line-1"]' },
    { name: 'حرم امام خمینی', lines: '["line-1"]' },
    { name: 'کهریزک', lines: '["line-1"]' },

    // Line 2
    { name: 'صادقیه', lines: '["line-2", "line-5"]', lat: 35.7197, lng: 51.3464, isInterchange: true },
    { name: 'طرشت', lines: '["line-2"]' },
    { name: 'دانشگاه شریف', lines: '["line-2"]' },
    { name: 'شادمان', lines: '["line-2", "line-4"]', isInterchange: true },
    { name: 'شهید نواب صفوی', lines: '["line-2", "line-7"]', isInterchange: true },
    { name: 'میدان حر', lines: '["line-2"]' },
    { name: 'دانشگاه امام علی', lines: '["line-2"]' },
    { name: 'حسن‌آباد', lines: '["line-2"]' },
    { name: 'ملت', lines: '["line-2"]' },
    { name: 'بهارستان', lines: '["line-2"]' },
    { name: 'دروازه شمیران', lines: '["line-2", "line-4"]', isInterchange: true },
    { name: 'امام حسین', lines: '["line-2", "line-6"]', isInterchange: true },
    { name: 'شهید مدنی', lines: '["line-2"]' },
    { name: 'سبلان', lines: '["line-2"]' },
    { name: 'فدک', lines: '["line-2"]' },
    { name: 'جانبازان', lines: '["line-2"]' },
    { name: 'سرسبز', lines: '["line-2"]' },
    { name: 'دانشگاه علم و صنعت', lines: '["line-2"]' },
    { name: 'شهید باقری', lines: '["line-2"]' },
    { name: 'تهرانپارس', lines: '["line-2"]' },
    { name: 'فرهنگسرا', lines: '["line-2"]' },

    // Line 3
    { name: 'قائم', lines: '["line-3"]' },
    { name: 'شهید محلاتی', lines: '["line-3"]' },
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
    { name: 'میدان ولیعصر', lines: '["line-3", "line-6"]', isInterchange: true },
    { name: 'تئاتر شهر', lines: '["line-3", "line-4"]', lat: 35.7009, lng: 51.4020, isInterchange: true },
    { name: 'منیریه', lines: '["line-3"]' },
    { name: 'راه‌آهن', lines: '["line-3"]' },
    { name: 'جوادیه', lines: '["line-3"]' },
    { name: 'زمزم', lines: '["line-3"]' },
    { name: 'شهرک شریعتی', lines: '["line-3"]' },
    { name: 'عبدالآباد', lines: '["line-3"]' },
    { name: 'نعمت‌آباد', lines: '["line-3"]' },
    { name: 'آزادگان', lines: '["line-3"]' },

    // Line 4
    { name: 'شهید کلاهدوز', lines: '["line-4"]' },
    { name: 'نیروی هوایی', lines: '["line-4"]' },
    { name: 'نبرد', lines: '["line-4"]' },
    { name: 'پیروزی', lines: '["line-4"]' },
    { name: 'ابن‌سینا', lines: '["line-4"]' },
    { name: 'میدان شهدا', lines: '["line-4", "line-6"]', isInterchange: true },
    { name: 'فردوسی', lines: '["line-4"]' },
    { name: 'میدان انقلاب اسلامی', lines: '["line-4"]' },
    { name: 'توحید', lines: '["line-4", "line-7"]', isInterchange: true },
    { name: 'دکتر حبیب‌الله', lines: '["line-4"]' },
    { name: 'استاد معین', lines: '["line-4"]' },
    { name: 'میدان آزادی', lines: '["line-4", "brt-1"]', lat: 35.6997, lng: 51.3479, isInterchange: true },
    { name: 'بیمه', lines: '["line-4"]' },
    { name: 'شهرک اکباتان', lines: '["line-4"]' },
    { name: 'ارم سبز', lines: '["line-4", "line-5"]', isInterchange: true },

    // BRT Line 1 (Tehranpars to Azadi)
    { name: 'چهارراه تهرانپارس', lines: '["brt-1"]' },
    { name: 'داریوش', lines: '["brt-1"]' },
    { name: 'آیت', lines: '["brt-1"]' },
    { name: 'ابوریحان', lines: '["brt-1"]' },
    { name: 'خاقانی', lines: '["brt-1"]' },
    { name: 'وحیدیه', lines: '["brt-1"]' },
    { name: 'سبلان', lines: '["brt-1"]' },
    { name: 'فرودگاه', lines: '["brt-1"]' },
    { name: 'منتظری', lines: '["brt-1"]' },
    { name: 'میدان امام حسین (ع)', lines: '["brt-1"]', isInterchange: true },
    { name: 'پل چوبی', lines: '["brt-1"]' },
    { name: 'پیچ شمیران', lines: '["brt-1"]' },
    { name: 'دروازه دولت', lines: '["brt-1"]', isInterchange: true },
    { name: 'میدان فردوسی', lines: '["brt-1"]' },
    { name: 'چهارراه ولیعصر (تئاتر شهر)', lines: '["brt-1", "brt-7"]', isInterchange: true },
    { name: 'دانشگاه تهران', lines: '["brt-1"]' },
    { name: 'میدان انقلاب اسلامی', lines: '["brt-1"]', isInterchange: true },
    { name: 'قریب', lines: '["brt-1"]' },
    { name: 'نواب', lines: '["brt-1"]', isInterchange: true },
    { name: 'بهبودی', lines: '["brt-1"]' },
    { name: 'دانشگاه شریف', lines: '["brt-1"]' },
    { name: 'استاد معین', lines: '["brt-1"]' },

    // BRT Line 7 (Rah Ahan to Tajrish)
    { name: 'میدان تجریش', lines: '["brt-7"]', isInterchange: true },
    { name: 'باغ فردوس', lines: '["brt-7"]' },
    { name: 'محمودیه', lines: '["brt-7"]' },
    { name: 'چهارراه پارک وی', lines: '["brt-7"]' },
    { name: 'امانیه', lines: '["brt-7"]' },
    { name: 'نیایش', lines: '["brt-7"]' },
    { name: 'ظفر', lines: '["brt-7"]' },
    { name: 'میرداماد', lines: '["brt-7"]' },
    { name: 'میدان ونک', lines: '["brt-7"]', isInterchange: true },
    { name: 'همت', lines: '["brt-7"]' },
    { name: 'توانیر', lines: '["brt-7"]' },
    { name: 'پله سوم', lines: '["brt-7"]' },
    { name: 'شهید بهشتی', lines: '["brt-7"]', isInterchange: true },
    { name: 'شهید مطهری', lines: '["brt-7"]' },
    { name: 'میدان ولیعصر (عج)', lines: '["brt-7"]', isInterchange: true },
    { name: 'طالقانی', lines: '["brt-7"]' },
    { name: 'جمهوری', lines: '["brt-7"]' },
    { name: 'جامی', lines: '["brt-7"]' },
    { name: 'منیریه', lines: '["brt-7"]' },
    { name: 'میدان قزوین', lines: '["brt-7"]' },
    { name: 'مولوی', lines: '["brt-7"]' },
    { name: 'مختاری', lines: '["brt-7"]' },
    { name: 'میدان راه‌آهن', lines: '["brt-7"]', isInterchange: true },
  ]

  let i = 1
  for (const st of stationsData) {
    const id = `st-bulk-${i++}`
    await prisma.station.upsert({
      where: { id: id },
      update: {
        name: st.name,
        lines: st.lines,
        isInterchange: st.isInterchange || false,
        lat: st.lat || null,
        lng: st.lng || null
      },
      create: {
        id: id,
        name: st.name,
        lines: st.lines,
        isInterchange: st.isInterchange || false,
        lat: st.lat || null,
        lng: st.lng || null
      },
    })
  }

  console.log(`Seeded ${stationsData.length} stations!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
