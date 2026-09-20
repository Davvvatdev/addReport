# Theme

## Part 1 - Compact Token Summary

- Direction/language: Persian, RTL, mobile-first.
- Font: `Vazirmatn` via `next/font/google`, fallback `ui-sans-serif, system-ui, sans-serif`.
- Current colors:
  - background: `#f8fafc` / Tailwind `slate-50`
  - foreground: `#0f172a` / Tailwind `slate-900`
  - primary blue: `#2563eb` / `blue-600`
  - public/admin dark: `#0f172a` / `slate-900`
  - sensitive rose: `rose-50`, `rose-200`, `rose-900`
  - success emerald: `emerald-50`, `emerald-600`
  - warning amber: `amber-50`, `amber-800`
- Border radius: current UI commonly uses `rounded-xl` and `rounded-2xl`; future cards should stay at 8px or less where practical, with larger radius reserved for primary mobile tap targets.
- Touch targets: minimum 44px, current pattern uses `min-h-11`, `min-h-12`, `min-h-14`, `min-h-16`.
- Shadows: subtle `shadow-sm`; primary CTA uses colored shadow.
- Layout: compact mobile container `max-w-md`, sticky headers, bottom fixed CTA on long forms.
- Icons: `lucide-react`; use familiar symbols inside buttons.

## Product Design Direction For New Drafts

Design should feel civic, urgent, trustworthy, and fast. Avoid a generic SaaS landing page. The first screen must be the usable product, not marketing.

Recommended visual system:
- Base: warm white and very pale stone/sage surfaces, deep ink text.
- Primary action: strong Tehran-transit blue with high contrast.
- Accent system: metro-line color chips, emerald for successful sync, amber for pending/offline, rose only for sensitive safety states, cyan/teal for public data.
- Typography: Vazirmatn only. No decorative or serif fonts.
- Cards: compact, scan-friendly, 8px radius for repeated report/data cards; larger pill-like controls only for high-priority mobile actions.
- Navigation: mobile bottom action rail or compact top tabs where useful; no nested cards.
- Data views: dense but calm, with filters as segmented controls/chips, clear export actions, and chart/map surfaces that prioritize legibility.

## Part 2 - Raw Source Dumps

### `src/app/globals.css`

```css
@import "tailwindcss";

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-vazirmatn), ui-sans-serif, system-ui, sans-serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

### Tailwind

Tailwind CSS v4 is configured via CSS `@theme`; there is no `tailwind.config.*` file.

