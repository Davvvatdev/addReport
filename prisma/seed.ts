import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding categories and subcategories...')

  // Categories
  const categories = [
    { id: '1', titleFa: 'مسائل زمانی 🕐', sortOrder: 1 },
    { id: '2', titleFa: 'مسائل عملیاتی ⚙️', sortOrder: 2 },
    { id: '3', titleFa: 'مسائل کالبدی و محیطی 🏗️', sortOrder: 3 },
    { id: '4', titleFa: 'مسائل اجتماعی و امنیتی 🛡️', sortOrder: 4 },
    { id: '5', titleFa: 'مسائل اطلاع‌رسانی 📢', sortOrder: 5 },
    { id: '6', titleFa: 'مسائل کرایه و پرداخت 💳', sortOrder: 6 },
    { id: '7', titleFa: 'سایر ✏️', sortOrder: 7 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    })
  }

  // Subcategories
  const subcategories = [
    // Category 1
    { id: '1-1', categoryId: '1', titleFa: 'تأخیر در رسیدن قطار/اتوبوس', allowsPhoto: false, isSensitive: false },
    { id: '1-2', categoryId: '1', titleFa: 'فاصله زمانی طولانی بین سرویس‌ها', allowsPhoto: false, isSensitive: false },
    { id: '1-3', categoryId: '1', titleFa: 'عدم تطابق با زمان‌بندی اعلام‌شده', allowsPhoto: false, isSensitive: false },
    { id: '1-4', categoryId: '1', titleFa: 'از دست دادن اتصال در ایستگاه تبادلی', allowsPhoto: false, isSensitive: false },
    { id: '1-5', categoryId: '1', titleFa: 'شروع دیرهنگام یا قطع زودهنگام سرویس', allowsPhoto: false, isSensitive: false },
    // Category 2
    { id: '2-1', categoryId: '2', titleFa: 'توقف یا اختلال در حرکت', allowsPhoto: false, isSensitive: false },
    { id: '2-2', categoryId: '2', titleFa: 'ازدحام بیش از ظرفیت', allowsPhoto: true, isSensitive: false },
    { id: '2-3', categoryId: '2', titleFa: 'کمبود ناوگان در ساعت اوج', allowsPhoto: false, isSensitive: false },
    { id: '2-4', categoryId: '2', titleFa: 'عدم توقف در ایستگاه', allowsPhoto: false, isSensitive: false },
    { id: '2-5', categoryId: '2', titleFa: 'تغییر مسیر بدون اطلاع‌رسانی', allowsPhoto: false, isSensitive: false },
    // Category 3
    { id: '3-1', categoryId: '3', titleFa: 'پله‌برقی خراب', allowsPhoto: true, isSensitive: false },
    { id: '3-2', categoryId: '3', titleFa: 'آسانسور خراب یا موجود نبودن', allowsPhoto: true, isSensitive: false },
    { id: '3-3', categoryId: '3', titleFa: 'تهویه نامناسب (گرما/سرما)', allowsPhoto: false, isSensitive: false },
    { id: '3-4', categoryId: '3', titleFa: 'روشنایی ناکافی', allowsPhoto: true, isSensitive: false },
    { id: '3-5', categoryId: '3', titleFa: 'نظافت نامناسب', allowsPhoto: true, isSensitive: false },
    { id: '3-6', categoryId: '3', titleFa: 'خرابی درب، صندلی یا تجهیزات', allowsPhoto: true, isSensitive: false },
    { id: '3-7', categoryId: '3', titleFa: 'مشکل دسترسی افراد دارای معلولیت', allowsPhoto: true, isSensitive: false },
    { id: '3-8', categoryId: '3', titleFa: 'خرابی دستگاه بلیت یا گیت', allowsPhoto: true, isSensitive: false },
    // Category 4
    { id: '4-1', categoryId: '4', titleFa: 'مزاحمت کلامی', allowsPhoto: false, isSensitive: true },
    { id: '4-2', categoryId: '4', titleFa: 'مزاحمت یا آزار فیزیکی', allowsPhoto: false, isSensitive: true },
    { id: '4-3', categoryId: '4', titleFa: 'جیب‌بری یا سرقت', allowsPhoto: false, isSensitive: true },
    { id: '4-4', categoryId: '4', titleFa: 'احساس ناامنی در محیط', allowsPhoto: false, isSensitive: true },
    { id: '4-5', categoryId: '4', titleFa: 'درگیری یا نزاع', allowsPhoto: false, isSensitive: true },
    { id: '4-6', categoryId: '4', titleFa: 'حضور افراد در وضعیت بحران', allowsPhoto: false, isSensitive: false },
    { id: '4-7', categoryId: '4', titleFa: 'دستفروشی مزاحم', allowsPhoto: true, isSensitive: false },
    { id: '4-8', categoryId: '4', titleFa: 'رفتار ناهنجار (سیگار، سروصدا)', allowsPhoto: false, isSensitive: false },
    // Category 5
    { id: '5-1', categoryId: '5', titleFa: 'نبود اطلاع‌رسانی درباره اختلال', allowsPhoto: false, isSensitive: false },
    { id: '5-2', categoryId: '5', titleFa: 'تابلوی اطلاعات خراب یا خاموش', allowsPhoto: true, isSensitive: false },
    { id: '5-3', categoryId: '5', titleFa: 'اعلام زمان نادرست', allowsPhoto: true, isSensitive: false },
    { id: '5-4', categoryId: '5', titleFa: 'نبود راهنمای مسیر یا تابلوی جهت‌یابی', allowsPhoto: true, isSensitive: false },
    // Category 6
    { id: '6-1', categoryId: '6', titleFa: 'مشکل در شارژ کارت بلیت', allowsPhoto: true, isSensitive: false },
    { id: '6-2', categoryId: '6', titleFa: 'کسر اشتباه وجه', allowsPhoto: true, isSensitive: false },
    { id: '6-3', categoryId: '6', titleFa: 'خرابی گیت یا دستگاه اعتبارسنجی', allowsPhoto: true, isSensitive: false },
    { id: '6-4', categoryId: '6', titleFa: 'عدم پذیرش کارت', allowsPhoto: true, isSensitive: false },
    // Category 7
    { id: '7-1', categoryId: '7', titleFa: 'سایر موارد', allowsPhoto: true, isSensitive: false },
  ]

  for (const sub of subcategories) {
    await prisma.subcategory.upsert({
      where: { id: sub.id },
      update: sub,
      create: sub,
    })
  }

  console.log('Seeding stations (Mock Data)...')
  
  const lines = [
    { id: 'line-1', name: 'خط ۱', mode: 'metro', color: '#E3000F' },
    { id: 'line-2', name: 'خط ۲', mode: 'metro', color: '#0039A6' },
    { id: 'line-3', name: 'خط ۳', mode: 'metro', color: '#00BCE4' },
    { id: 'line-4', name: 'خط ۴', mode: 'metro', color: '#FFD700' },
  ]

  for (const line of lines) {
    await prisma.line.upsert({
      where: { id: line.id },
      update: line,
      create: line,
    })
  }

  const stations = [
    { id: 'st-1', name: 'صادقیه', lines: '["line-2"]', lat: 35.7197, lng: 51.3464, isInterchange: true },
    { id: 'st-2', name: 'امام خمینی', lines: '["line-1", "line-2"]', lat: 35.6865, lng: 51.4208, isInterchange: true },
    { id: 'st-3', name: 'هفت‌تیر', lines: '["line-1"]', lat: 35.7188, lng: 51.4278, isInterchange: true },
    { id: 'st-4', name: 'تئاتر شهر', lines: '["line-3", "line-4"]', lat: 35.7009, lng: 51.4020, isInterchange: true },
    { id: 'st-5', name: 'آزادی', lines: '["line-4"]', lat: 35.6997, lng: 51.3479, isInterchange: true },
  ]

  for (const st of stations) {
    await prisma.station.upsert({
      where: { id: st.id },
      update: st,
      create: st,
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

