# Routes

## `/`
- File: `src/app/page.tsx`
- Layout: `src/app/layout.tsx`
- Summary: Mobile home screen with product title, large primary "ثبت گزارش جدید" CTA, reports-today stat, and three navigation tiles for list, map, and stats.

## `/report`
- File: `src/app/report/page.tsx`
- Main component: `src/components/ReportWizard.tsx`
- Summary: Golden-path wizard for reporting a transit problem in under 30 seconds.

## `/public/list`
- File: `src/app/public/list/page.tsx`
- Summary: Public transparency list with filters, non-sensitive report cards, and sensitive reports shown only as aggregate station counts.

## `/public/map`
- Files: `src/app/public/map/page.tsx`, `src/app/public/map/MapWrapper.tsx`, `src/app/public/map/MapComponent.tsx`
- Summary: Leaflet/OpenStreetMap report distribution map with report popups.

## `/public/stats`
- Files: `src/app/public/stats/page.tsx`, `src/app/public/stats/StatsChart.tsx`
- Summary: Public open-data dashboard with KPI cards, category chart, and CSV/JSON export buttons.

## `/dashboard`
- File: `src/app/dashboard/page.tsx`
- Summary: Management dashboard table for reviewing reports and advancing status. Deletion is intentionally absent.

## `/feedback`
- File: `src/app/feedback/page.tsx`
- Summary: SUS questionnaire with 10 Likert questions, free comment, calculated score, and success state.

## `/privacy`
- File: `src/app/privacy/page.tsx`
- Summary: Plain-language privacy policy for anonymous, public civic reporting.

