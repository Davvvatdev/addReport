# Pages

## `/` Home
Entry: `src/app/page.tsx`
Dependencies:
- `src/lib/prisma.ts`
- `src/lib/format.ts`

## `/report` Report Wizard
Entry: `src/app/report/page.tsx`
Dependencies:
- `src/components/ReportWizard.tsx`
  - `src/lib/db.ts`
  - `src/lib/client.ts`
  - `src/lib/format.ts`
  - `src/lib/sync.ts`
  - `src/lib/types.ts`

## `/public/list`
Entry: `src/app/public/list/page.tsx`
Dependencies:
- `src/lib/prisma.ts`
- `src/lib/format.ts`

## `/public/map`
Entry: `src/app/public/map/page.tsx`
Dependencies:
- `src/app/public/map/MapWrapper.tsx`
  - `src/app/public/map/MapComponent.tsx`
- `src/lib/prisma.ts`

## `/public/stats`
Entry: `src/app/public/stats/page.tsx`
Dependencies:
- `src/app/public/stats/StatsChart.tsx`
- Prisma client

## `/dashboard`
Entry: `src/app/dashboard/page.tsx`
Dependencies:
- Prisma client
- `next/cache`

## `/feedback`
Entry: `src/app/feedback/page.tsx`
Dependencies:
- Browser fetch to `/api/feedback`

## `/privacy`
Entry: `src/app/privacy/page.tsx`
Dependencies:
- none beyond Next `Link`

