// استخراج اعداد پایان‌نامه — فقط خواندن (SELECT)، فقط داده‌ی واقعی (isSynthetic = false)
// اجرا:  node thesis-extract.js            (کل داده)
//        ROUND2_START=2026-10-08T00:00:00+03:30 node thesis-extract.js   (تفکیک دو دور)
// دور ۱ = ۹ تا ۱۱ مهر ۱۴۰۵ (۱ تا ۳ اکتبر ۲۰۲۶) به وقت تهران؛ دور ۲ = از ROUND2_START به بعد.
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const R1 = ['2026-09-30T20:30:00Z', '2026-10-03T20:30:00Z']
const R2_START = process.env.ROUND2_START ? new Date(process.env.ROUND2_START).toISOString() : null

const dtf = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', { timeZone: 'Asia/Tehran', year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
const jal = (d) => {
  if (!d) return '—'
  const p = Object.fromEntries(dtf.formatToParts(new Date(d)).map((x) => [x.type, x.value]))
  return `${p.year}/${p.month}/${p.day} ${p.hour}:${p.minute}`
}
const iso = (d) => (d ? new Date(d).toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : '—')
const out = []
const say = (s = '') => out.push(s)
const table = (head, rows) => { say('| ' + head.join(' | ') + ' |'); say('|' + head.map(() => '---').join('|') + '|'); rows.forEach((r) => say('| ' + r.join(' | ') + ' |')); say() }
const clean = (n) => Number(n)

function range(col, from, to) {
  const c = []
  if (from) c.push(`${col} >= '${from}'`)
  if (to) c.push(`${col} < '${to}'`)
  return c.length ? ' AND ' + c.join(' AND ') : ''
}

async function section(title, from, to) {
  say(`## ${title}`)
  say()
  const rw = range('r."createdAt"', from, to)
  const fw = range('"createdAt"', from, to)
  const q = (sql) => prisma.$queryRawUnsafe(sql)

  // ۳) کاربران
  const [tk] = await q(`select count(distinct t) n from (select "reporterToken" t from reports r where not r."isSynthetic" ${rw} union select "reporterToken" from feedback where not "isSynthetic" ${fw}) x`)
  const [tkr] = await q(`select count(distinct "reporterToken") n from reports r where not r."isSynthetic" ${rw}`)
  const [tkf] = await q(`select count(distinct "reporterToken") n from feedback where not "isSynthetic" ${fw}`)
  const [acc] = await q(`select count(*) n from users where true ${fw}`)
  const [accRep] = await q(`select count(distinct "userId") n from reports r where not r."isSynthetic" and r."userId" is not null ${rw}`)
  say('### ۳. کاربران')
  table(['معیار', 'تعداد'], [
    ['توکن یکتا (گزارش‌دهنده یا پاسخ‌دهنده)', clean(tk.n)],
    ['توکن یکتا در گزارش‌ها', clean(tkr.n)],
    ['توکن یکتا در پاسخ‌های ارزیابی', clean(tkf.n)],
    ['حساب‌های ساخته‌شده در این بازه (users)', clean(acc.n)],
    ['حساب‌داران که حداقل یک گزارش ثبت کرده‌اند', clean(accRep.n)],
  ])

  // ۴) گزارش‌ها
  const [tot] = await q(`select count(*) n from reports r where not r."isSynthetic" ${rw}`)
  say('### ۴. گزارش‌ها')
  say(`کل گزارش‌ها: **${clean(tot.n)}**`)
  say()
  const cat = await q(`select c.id, c."titleFa" t, count(r.id) n from categories c left join reports r on r."categoryId"=c.id and not r."isSynthetic" ${rw} group by c.id, c."titleFa", c."sortOrder" order by c."sortOrder"`)
  table(['دسته', 'تعداد'], cat.map((x) => [`${x.id} — ${x.t}`, clean(x.n)]))
  const lines = await q(`select coalesce(l.name,'(بدون خط)') t, count(*) n from reports r left join lines l on l.id=r."lineId" where not r."isSynthetic" ${rw} group by 1 order by 2 desc`)
  table(['خط', 'تعداد'], lines.map((x) => [x.t, clean(x.n)]))
  const st = await q(`select coalesce(s.name,'(بدون ایستگاه)') t, count(*) n from reports r left join stations s on s.id=r."stationId" where not r."isSynthetic" ${rw} group by 1 order by 2 desc, 1 limit 10`)
  table(['ایستگاه (۱۰ پرگزارش)', 'تعداد'], st.map((x) => [x.t, clean(x.n)]))
  const [fl] = await q(`select count(*) filter (where sc."isSensitive") sens, count(*) filter (where r."photoUrl" is not null) photo, count(*) filter (where r.lat is not null and r.lng is not null) coords from reports r join subcategories sc on sc.id=r."subcategoryId" where not r."isSynthetic" ${rw}`)
  table(['ویژگی', 'تعداد'], [['حساس امنیتی (زیرمسئله‌ی isSensitive)', clean(fl.sens)], ['دارای عکس', clean(fl.photo)], ['دارای مختصات', clean(fl.coords)]])

  // ۵) SUS
  const rows = await q(`select "susScores" s, "freeComment" c, "createdAt" d from feedback where not "isSynthetic" ${fw} order by "createdAt"`)
  const scores = []
  const items = Array.from({ length: 10 }, () => [])
  let invalid = 0
  for (const r of rows) {
    let a
    try { a = typeof r.s === 'string' ? JSON.parse(r.s) : r.s } catch { a = null }
    if (!Array.isArray(a) || a.length !== 10 || a.some((v) => !Number.isInteger(Number(v)) || Number(v) < 1 || Number(v) > 5)) { invalid++; continue }
    a = a.map(Number)
    a.forEach((v, i) => items[i].push(v))
    scores.push(a.reduce((s, v, i) => s + (i % 2 === 0 ? v - 1 : 5 - v), 0) * 2.5)
  }
  say('### ۵. SUS')
  say(`کل رکوردهای feedback: ${rows.length} — کامل و معتبر: **${scores.length}** — ناقص/نامعتبر (کنار گذاشته شد): ${invalid}`)
  say()
  if (scores.length) {
    const sorted = [...scores].sort((a, b) => a - b)
    const mid = sorted.length / 2
    const median = sorted.length % 2 ? sorted[Math.floor(mid)] : (sorted[mid - 1] + sorted[mid]) / 2
    const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length
    table(['آماره', 'مقدار'], [['میانگین', mean(scores)], ['میانه', median], ['کمینه', sorted[0]], ['بیشینه', sorted[sorted.length - 1]]])
    table(['گویه', 'میانگین'], items.map((v, i) => [i + 1, mean(v)]))
  } else say('داده‌ی SUS برای این بازه وجود ندارد.\n')

  // ۶) نظرها
  const comments = rows.filter((r) => r.c && String(r.c).trim())
  say('### ۶. نظرهای آزاد')
  say(`تعداد نظرنویسان: **${comments.length}**`)
  say()
  comments.forEach((r) => say('- ' + String(r.c).replace(/\s*\n\s*/g, ' ⏎ ')))
  say()
}

async function main() {
  const q = (sql) => prisma.$queryRawUnsafe(sql)
  say('# خروجی استخراج پایان‌نامه (داده‌ی واقعی، isSynthetic = false)')
  say()
  say(`زمان اجرا: ${iso(new Date())}`)
  say()

  const [syn] = await q(`select (select count(*) from reports where "isSynthetic") rs, (select count(*) from feedback where "isSynthetic") fs`)
  say(`> برای اطلاع: ${clean(syn.rs)} گزارش و ${clean(syn.fs)} پاسخ ارزیابی ساختگی در این دیتابیس هست که در هیچ عددی شمرده نشده.`)
  say()

  say('## ۱. بازه‌ی زمانی هر جدول')
  say()
  const spans = [
    ['reports', `select count(*) n, min("createdAt") a, max("createdAt") b from reports where not "isSynthetic"`],
    ['feedback (SUS)', `select count(*) n, min("createdAt") a, max("createdAt") b from feedback where not "isSynthetic"`],
    ['users', `select count(*) n, min("createdAt") a, max("createdAt") b from users`],
    ['report_events', `select count(*) n, min("createdAt") a, max("createdAt") b from report_events where not "isSynthetic"`],
    ['report_confirmations', `select count(*) n, min("createdAt") a, max("createdAt") b from report_confirmations where not "isSynthetic"`],
    ['resolution_votes', `select count(*) n, min("createdAt") a, max("createdAt") b from resolution_votes where not "isSynthetic"`],
  ]
  const rowsT = []
  for (const [name, sql] of spans) {
    const [r] = await q(sql)
    rowsT.push([name, clean(r.n), iso(r.a), jal(r.a), iso(r.b), jal(r.b)])
  }
  table(['جدول', 'تعداد', 'اولین (میلادی)', 'اولین (شمسی، تهران)', 'آخرین (میلادی)', 'آخرین (شمسی، تهران)'], rowsT)
  say('آمار استفاده (بازدید صفحه): جدولی برای آن وجود ندارد — قابل استخراج نیست.')
  say()

  say('## ۲. تفکیک دو دور')
  say()
  say(`دور ۱: createdAt بین ${R1[0]} و ${R1[1]} (۹ تا ۱۱ مهر ۱۴۰۵ به وقت تهران).`)
  say(R2_START ? `دور ۲: createdAt از ${R2_START} به بعد.` : 'دور ۲: ROUND2_START داده نشده؛ فقط «دور ۱» و «کل» محاسبه می‌شود.')
  say()

  await section('بخش ب — دور ۱ (تمرین کلاسی)', R1[0], R1[1])
  if (R2_START) await section('بخش ب — دور ۲', R2_START, null)
  await section('بخش ب — کل', null, null)

  say('## ۱۱. داده‌ی ثابت (از دیتابیس همین سرور)')
  say()
  const [c] = await q(`select (select count(*) from lines) l, (select count(*) from lines where mode='metro') lm, (select count(*) from lines where mode='brt') lb, (select count(*) from lines where mode='bus') lbus, (select count(*) from stations) s, (select count(*) from stations where "isInterchange") si, (select count(*) from stations where lat is not null and lng is not null) sc, (select count(*) from categories) cat, (select count(*) from subcategories) sub, (select count(*) from subcategories where "isSensitive") ss`)
  table(['مورد', 'تعداد'], [['خط', clean(c.l)], ['خط مترو', clean(c.lm)], ['خط BRT', clean(c.lb)], ['خط اتوبوس', clean(c.lbus)], ['ایستگاه', clean(c.s)], ['ایستگاه تبادلی', clean(c.si)], ['ایستگاه دارای مختصات', clean(c.sc)], ['دسته', clean(c.cat)], ['زیرمسئله', clean(c.sub)], ['زیرمسئله‌ی حساس', clean(c.ss)]])

  console.log(out.join('\n'))
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
