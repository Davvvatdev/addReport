# Design System - دیده‌بان حمل‌ونقل تهران

## Product Context

A mobile-first Persian RTL civic web app for reporting public transit problems in Tehran. The core experience must let a tired passenger submit a common report in under 30 seconds without typing. Public transparency is equally important: aggregated reports, maps, stats, and data exports should feel open and credible.

Primary users:
- Passenger in metro/bus with weak internet and one hand available.
- Civic activist or NGO member reviewing public data.
- Urban operations staff reviewing and updating report status.

## Experience Principles

1. Speed over completeness: every design must keep the golden path to three taps plus optional photo.
2. No typing by default: category, line, station, severity, and context use large tap targets, chips, segmented controls, or searchable lists.
3. Public trust: data views must look inspectable, not promotional.
4. Privacy by design: sensitive social/security reports are visually protected, anonymous, and shown publicly only as aggregate data.
5. Offline confidence: pending sync states must be visible, calm, and reassuring.

## Visual Direction

Use a quiet civic-transport interface, not a marketing landing page. The product should feel like a reliable field tool with polished public-data views.

Palette:
- Ink: `#111827`
- Slate text: `#334155`, muted `#64748b`
- App background: `#f7f8f5` or `#f8fafc`
- Surface: `#ffffff`
- Border: `#d8ded8`
- Primary transit blue: `#2563eb`
- Deep action blue: `#1d4ed8`
- Public-data teal: `#0f766e`
- Success green: `#059669`
- Pending amber: `#d97706`
- Sensitive rose: `#be123c`
- Metro line chips may use real line colors where available; keep them as small identifiers, not full-page themes.

Typography:
- Font: Vazirmatn only.
- No serif, decorative, condensed, or Latin-first fonts.
- Use compact hierarchy: page titles 20-24px mobile, section labels 13-15px, body 14-16px, CTAs 16-20px.
- Letter spacing: 0.

Shape and spacing:
- Repeated cards: 8px radius, 1px borders, subtle shadow or no shadow.
- Primary CTA and bottom action buttons: 12-16px radius allowed for thumb ergonomics.
- Touch targets: at least 44x44px.
- Avoid nested cards and decorative gradients/orbs.
- Use full-width bands or constrained unframed layouts for sections.

Iconography:
- Use lucide-style line icons.
- Buttons should use icons where familiar: back, home, camera, download, map, chart, filter, search, sync, check.
- Do not rely on emoji as functional icons.

## Key Screens To Design

### Home
- First viewport is the usable app.
- Large "ثبت گزارش" action with report-time promise.
- Live stat for today's reports.
- Quick links to public list, map, stats, feedback/privacy.
- Make offline/sync readiness visible without clutter.

### Report Wizard
- Four-state flow: location, issue, details, confirmation.
- Use sticky progress header and bottom CTA.
- Location step: nearest station suggestion, mode segmented control, line chips, searchable station list, skip button.
- Issue step: seven large category tiles, then one-tap subcategory list.
- Details step: photo only when allowed and non-sensitive, severity segmented control, collapsed optional note.
- Confirmation: tracking code, pending/synced state, station-week impact message, sensitive support message and emergency call buttons when needed.

### Public List
- No login cues.
- Filters as compact chips/controls.
- Sensitive reports appear only in an aggregate module.
- Non-sensitive reports appear as dense, scannable cards with status, time, station, category, severity, optional image.

### Public Map
- Full-bleed map area with filter sheet/rail.
- Clustered report markers by category/severity.
- Sensitive data shown at station/aggregate level only.
- Easy switch to list view.

### Public Stats
- Open-data dashboard for mobile and desktop.
- KPIs, top stations, category distribution, time-of-day pattern, weekly/monthly trend.
- CSV and JSON export buttons must be prominent and trustworthy.

### Admin Dashboard
- Work-focused, denser desktop layout.
- Filters, status lanes or table, report detail drawer, status update controls, public response note.
- No delete action anywhere.

### SUS Feedback
- 10 question Likert flow with progress, clear 1-5 control, live completion state, score after submit.

### Privacy
- Plain-language sections, compact, trust-focused.

## Hard Constraints

- Entire UI is Persian RTL.
- Public layer requires no login.
- Sensitive reports: no photo button, always anonymous, public aggregation only.
- Numbers display Persian digits; persisted data remains Latin/internal.
- Use ONLY this design system's fonts, colors, spacing, and component styles. Do not introduce unrelated colors, purple gradients, beige-heavy themes, decorative blobs, stock hero art, or marketing copy layouts.

