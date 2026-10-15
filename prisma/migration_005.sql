-- مهاجرت ۵: برچسب داده‌ی شبیه‌سازی‌شده (برای تفکیک از داده‌ی واقعی در پایان‌نامه)
-- اجرای دوباره‌ی این فایل بی‌خطر است.
BEGIN;
ALTER TABLE "reports" ADD COLUMN IF NOT EXISTS "isSynthetic" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "report_events" ADD COLUMN IF NOT EXISTS "isSynthetic" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "report_confirmations" ADD COLUMN IF NOT EXISTS "isSynthetic" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "resolution_votes" ADD COLUMN IF NOT EXISTS "isSynthetic" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "isSynthetic" BOOLEAN NOT NULL DEFAULT FALSE;
COMMIT;
