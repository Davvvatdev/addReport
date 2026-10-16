// تولید داده‌ی شبیه‌سازی‌شده‌ی استفاده از اپ برای بازه‌ی ۲۰ سپتامبر تا ۱۵ اکتبر ۲۰۲۶.
// همه‌ی رکوردها با isSynthetic = true علامت می‌خورند و در پایان‌نامه باید به‌عنوان داده‌ی شبیه‌سازی‌شده گزارش شوند.
//
//   node prisma/seed-synthetic.js          # افزودن داده
//   node prisma/seed-synthetic.js --reset  # حذف همه‌ی داده‌های شبیه‌سازی‌شده
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// ---- تولیدکننده‌ی تصادفی با seed ثابت (تکرارپذیر) ----
let seed = 20260920
function rnd() {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const pick = (a) => a[Math.floor(rnd() * a.length)]
const int = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1))
function weighted(items) {
  const total = items.reduce((s, [, w]) => s + w, 0)
  let r = rnd() * total
  for (const [v, w] of items) { if ((r -= w) <= 0) return v }
  return items[items.length - 1][0]
}
const uuid = () => 'syn-' + Math.floor(rnd() * 1e16).toString(36) + Math.floor(rnd() * 1e16).toString(36)

const START = Date.UTC(2026, 8, 20)  // 2026-09-20
const END = Date.UTC(2026, 9, 15)    // 2026-10-15
const DAY = 86400000
const TEHRAN_OFFSET = 3.5 * 3600000

// ساعت‌های شلوغ: صبح و عصر
const HOUR_W = [[5,1],[6,4],[7,12],[8,16],[9,10],[10,6],[11,5],[12,6],[13,6],[14,5],[15,6],[16,9],[17,14],[18,13],[19,8],[20,5],[21,3],[22,2]]

async function reset() {
  const r = await prisma.report.deleteMany({ where: { isSynthetic: true } })
  const f = await prisma.feedback.deleteMany({ where: { isSynthetic: true } })
  console.log(`حذف شد: ${r.count} گزارش (به‌همراه رویدادها/تأییدها/رأی‌ها)، ${f.count} بازخورد`)
}

async function main() {
  if (process.argv.includes('--reset')) return reset()
  if (await prisma.report.count({ where: { isSynthetic: true } })) {
    console.log('داده‌ی شبیه‌سازی‌شده از قبل وجود دارد. ابتدا با --reset پاک کنید.')
    return
  }

  const [lines, stations, subs] = await Promise.all([
    prisma.line.findMany(), prisma.station.findMany(), prisma.subcategory.findMany(),
  ])
  const stationsByLine = {}
  for (const s of stations) {
    let ids = []
    try { ids = JSON.parse(s.lines) } catch {}
    for (const id of ids) (stationsByLine[id] ||= []).push(s)
  }
  const linesByMode = { metro: [], bus: [], brt: [] }
  for (const l of lines) if (linesByMode[l.mode] && stationsByLine[l.id]?.length) linesByMode[l.mode].push(l)

  // ایستگاه‌های پرتردد (شلوغ‌تر گزارش می‌شوند)
  const hot = new Set(stations.filter((s) => s.isInterchange).map((s) => s.id))

  // مخزن کاربران ناشناس؛ تعداد بر اساس رشد تدریجی
  const tokens = Array.from({ length: 220 }, () => 'syn-tok-' + uuid().slice(4))
  const riderTypes = [['daily', 5], ['occasional', 3], ['student', 3], ['elderly', 1]]
  const purposes = [['work', 5], ['study', 3], ['shopping', 2], ['other', 2]]
  const genders = [['female', 5], ['male', 5], ['unspecified', 1]]

  const descByCat = {
    default: ['', '', '', 'در ساعت شلوغ صبح اتفاق افتاد.', 'چند دقیقه طول کشید و کسی اطلاع‌رسانی نکرد.', 'این مشکل قبلاً هم دیده شده بود.'],
  }

  const reports = []
  const events = []
  const confirmations = []
  const votes = []
  let dayIndex = 0

  const TARGET = 450
  const rawCounts = []
  for (let t = START, d = 0; t <= END; t += DAY, d++) {
    const dow = new Date(t).getUTCDay()
    rawCounts.push((0.55 + (d / 25) * 0.9) * (dow === 5 ? 0.45 : dow === 4 ? 0.8 : 1) * (0.8 + rnd() * 0.4))
  }
  const rawSum = rawCounts.reduce((a, b) => a + b, 0)
  const exact = rawCounts.map((c) => (c / rawSum) * TARGET)
  const dayCounts = exact.map(Math.floor)
  let rest = TARGET - dayCounts.reduce((a, b) => a + b, 0)
  exact.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).slice(0, rest).forEach(([, i]) => dayCounts[i]++)

  for (let t = START; t <= END; t += DAY, dayIndex++) {
    const n = dayCounts[dayIndex]

    for (let i = 0; i < n; i++) {
      const mode = weighted([['metro', 6], ['bus', 3], ['brt', 3]].filter(([m]) => linesByMode[m].length))
      const line = pick(linesByMode[mode])
      const pool = stationsByLine[line.id]
      const station = rnd() < 0.3 ? (pool.filter((s) => hot.has(s.id))[0] ? pick(pool.filter((s) => hot.has(s.id))) : pick(pool)) : pick(pool)
      const modeSubs = subs.filter((s) => s.modes.split(',').includes(mode))
      const sub = pick(modeSubs)
      const hour = weighted(HOUR_W)
      const occurred = new Date(t + hour * 3600000 + int(0, 59) * 60000 + int(0, 59) * 1000 - TEHRAN_OFFSET)
      const created = new Date(occurred.getTime() + int(1, 25) * 60000)
      if (created.getTime() > (END + DAY)) continue

      const sensitive = sub.isSensitive
      const severity = sensitive ? weighted([['high', 4], ['critical', 2], ['medium', 3]])
        : weighted([['low', 3], ['medium', 6], ['high', 2], ['critical', 0.4]])
      const ageDays = (END + DAY - t) / DAY
      // وضعیت: فقط ثبت‌شده / در حال بررسی / در حال انجام (بدون رد، ارجاع یا رفع)
      let status = 'submitted'
      const p = rnd()
      if (ageDays > 12) status = p < 0.4 ? 'in_progress' : p < 0.75 ? 'under_review' : 'submitted'
      else status = p < 0.15 ? 'in_progress' : p < 0.4 ? 'under_review' : 'submitted'

      const id = uuid()
      const token = pick(tokens)
      const gender = weighted(genders)
      reports.push({
        id, createdAt: created, occurredAt: occurred, updatedAt: created,
        mode, lineId: line.id, stationId: station.id, direction: 'unknown',
        vehicleContext: mode === 'metro' ? weighted([['in_station', 5], ['on_vehicle', 4], ['transfer_point', 2]])
          : weighted([['in_station', 4], ['on_vehicle', 5]]),
        categoryId: sub.categoryId, subcategoryId: sub.id,
        description: sub.isOther ? 'توضیح کاربر دربارهٔ مورد دیگر (داده شبیه‌سازی‌شده).' : pick(descByCat.default) || null,
        lat: station.lat ?? null, lng: station.lng ?? null,
        severity, impact: weighted([['time_loss', 5], ['safety_risk', sensitive ? 5 : 1], ['health', 1], ['could_not_board', 2], ['accessibility', 1]]),
        tripPurpose: weighted(purposes), riderType: weighted(riderTypes), accessNeed: rnd() < 0.9 ? 'none' : 'mobility',
        gender, isAnonymous: true, reporterToken: token, status,
        assignedUnit: status === 'in_progress' ? pick(['فنی', 'بهره‌برداری', 'ایمنی', 'خدمات مشتریان']) : null,
        syncStatus: 'synced', isSynthetic: true,
      })

      // رویدادهای تغییر وضعیت
      const path = ['submitted', 'under_review', 'in_progress']
      const finalIdx = path.indexOf(status)
      let when = created.getTime()
      for (let k = 0; k <= finalIdx; k++) {
        when += k === 0 ? 0 : int(2, 36) * 3600000
        if (when > (END + DAY)) break
        events.push({ id: uuid(), reportId: id, status: k === finalIdx && status === 'rejected' ? 'rejected' : path[k],
          note: null, createdAt: new Date(when), isSynthetic: true })
      }

      // تأیید «من هم همین را دیدم» از کاربران دیگر
      const nConf = 0
      const used = new Set([token])
      for (let c = 0; c < nConf; c++) {
        const tk = pick(tokens)
        if (used.has(tk)) continue
        used.add(tk)
        confirmations.push({ id: uuid(), reportId: id, reporterToken: tk,
          createdAt: new Date(created.getTime() + int(10, 600) * 60000), isSynthetic: true })
      }
    }
  }

  // بازخورد SUS (۱۰ گویه، مقیاس ۱ تا ۵) — ۳۸ پاسخ
  const feedback = Array.from({ length: 38 }, (_, i) => {
    const pos = int(3, 5), neg = int(1, 3)
    const scores = Array.from({ length: 10 }, (_, q) => (q % 2 === 0 ? pos : neg))
    return {
      id: uuid(), isSynthetic: true, reporterToken: pick(tokens),
      createdAt: new Date(START + int(0, 25) * DAY + int(8, 22) * 3600000),
      susScores: JSON.stringify(scores),
      freeComment: rnd() < 0.3 ? 'بازخورد شبیه‌سازی‌شده' : null,
    }
  })

  const chunk = async (fn, arr, size = 500) => { for (let i = 0; i < arr.length; i += size) await fn(arr.slice(i, i + size)) }
  await chunk((d) => prisma.report.createMany({ data: d }), reports)
  await chunk((d) => prisma.reportEvent.createMany({ data: d }), events)
  await chunk((d) => prisma.reportConfirmation.createMany({ data: d, skipDuplicates: true }), confirmations)
  await chunk((d) => prisma.resolutionVote.createMany({ data: d, skipDuplicates: true }), votes)
  await prisma.feedback.createMany({ data: feedback })

  console.log(`ایجاد شد: ${reports.length} گزارش، ${events.length} رویداد، ${confirmations.length} تأیید، ${votes.length} رأی، ${feedback.length} بازخورد`)
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
