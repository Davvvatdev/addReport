# Components

Framework: Next.js App Router, React 19, TypeScript. Styling is Tailwind CSS v4 through utility classes. Icons are from `lucide-react`.

No dedicated shared primitive directory exists yet. The app currently uses page-local Tailwind button/card/input patterns.

## ReportWizard
- File: `src/components/ReportWizard.tsx`
- Component: `ReportWizard`
- Description: Main mobile-first RTL report submission wizard with four steps, offline queue, category/subcategory selection, optional photo, severity, and sensitive-report protections.
- Key visual props: none; state is internal.

```tsx
See `src/components/ReportWizard.tsx`. This file is the main reusable UI component and should be passed as context for report-flow designs.
```

## SyncManager
- File: `src/components/SyncManager.tsx`
- Component: `SyncManager`
- Description: Background offline sync helper. It renders only sync status behavior and is not a visible page layout primitive.

```tsx
See `src/components/SyncManager.tsx`.
```

