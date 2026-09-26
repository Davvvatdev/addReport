-- مهاجرت ۲: گردش کار رسیدگی، تأیید جمعی، فیلدهای جدید فرم و زیرمسئله‌های تکمیلی
-- اجرای دوباره‌ی این فایل بی‌خطر است.
BEGIN;

-- حساب کاربری (اگر قبلاً ساخته نشده)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "userId" TEXT;
DO $$ BEGIN
  ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- فیلدهای جدید گزارش
ALTER TABLE "reports"
  ADD COLUMN IF NOT EXISTS "impact" TEXT,
  ADD COLUMN IF NOT EXISTS "tripPurpose" TEXT,
  ADD COLUMN IF NOT EXISTS "riderType" TEXT,
  ADD COLUMN IF NOT EXISTS "accessNeed" TEXT,
  ADD COLUMN IF NOT EXISTS "gender" TEXT,
  ADD COLUMN IF NOT EXISTS "assignedUnit" TEXT,
  ADD COLUMN IF NOT EXISTS "statusNote" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "reports_stationId_subcategoryId_occurredAt_idx" ON "reports"("stationId", "subcategoryId", "occurredAt");
CREATE INDEX IF NOT EXISTS "reports_reporterToken_idx" ON "reports"("reporterToken");

-- تاریخچه رسیدگی
CREATE TABLE IF NOT EXISTS "report_events" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "assignedUnit" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "report_events_reportId_idx" ON "report_events"("reportId");

-- «من هم دیدم»
CREATE TABLE IF NOT EXISTS "report_confirmations" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reporterToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "report_confirmations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "report_confirmations_reportId_reporterToken_key" ON "report_confirmations"("reportId", "reporterToken");

-- رأی «حل شد / نشد»
CREATE TABLE IF NOT EXISTS "resolution_votes" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reporterToken" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resolution_votes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "resolution_votes_reportId_reporterToken_key" ON "resolution_votes"("reportId", "reporterToken");

DO $$ BEGIN
  ALTER TABLE "report_events" ADD CONSTRAINT "report_events_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "report_confirmations" ADD CONSTRAINT "report_confirmations_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "resolution_votes" ADD CONSTRAINT "resolution_votes_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- وضعیت قدیمی «تأییدشده» → «در حال بررسی»
UPDATE "reports" SET "status" = 'under_review' WHERE "status" = 'acknowledged';

-- برای گزارش‌های قدیمی یک رویداد «ثبت شد» بساز تا روند رسیدگی خالی نباشد
INSERT INTO "report_events" ("id", "reportId", "status", "createdAt")
SELECT gen_random_uuid()::text, r."id", 'submitted', r."createdAt"
FROM "reports" r
WHERE NOT EXISTS (SELECT 1 FROM "report_events" e WHERE e."reportId" = r."id");

-- زیرمسئله‌های تکمیلی
INSERT INTO "subcategories" ("id", "categoryId", "titleFa", "allowsPhoto", "isSensitive", "sortOrder", "icon") VALUES
  ('2-6', '2', 'ازدحام روی سکو یا داخل ایستگاه', TRUE, FALSE, 6, NULL),
  ('2-7', '2', 'رفتار نامناسب کارکنان یا راننده', FALSE, FALSE, 7, NULL),
  ('3-9', '3', 'نقص مسیر انتقال بین مترو و اتوبوس', TRUE, FALSE, 9, NULL),
  ('3-10', '3', 'مسیر انتقال باریک یا بیش از حد شلوغ', TRUE, FALSE, 10, NULL),
  ('3-11', '3', 'بوی نامطبوع یا آلودگی محیطی', TRUE, FALSE, 11, NULL),
  ('4-9', '4', 'آزار جنسیتی', FALSE, TRUE, 9, NULL),
  ('4-10', '4', 'شرایط تهدیدکننده برای سالمندان، کودکان یا افراد آسیب‌پذیر', FALSE, TRUE, 10, NULL),
  ('5-5', '5', 'اعلام مبهم یا ناقص علت تأخیر', FALSE, FALSE, 5, NULL),
  ('5-6', '5', 'نبود اطلاعات درباره مسیر جایگزین', FALSE, FALSE, 6, NULL),
  ('5-7', '5', 'نبود اطلاع‌رسانی در نقطه تبادل مترو و اتوبوس', TRUE, FALSE, 7, NULL)
ON CONFLICT ("id") DO NOTHING;

-- ترتیب نمایش زیرمسئله‌های قبلی
UPDATE "subcategories" SET "sortOrder" = CAST(split_part("id", '-', 2) AS INTEGER) WHERE "sortOrder" = 0;

COMMIT;
