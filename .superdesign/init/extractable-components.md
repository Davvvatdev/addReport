# Extractable Components

The repository currently has very few shared visual components. For the first full-product design pass, skip component extraction and design directly from source context.

## ReportWizard
- Source: `src/components/ReportWizard.tsx`
- Category: layout
- Description: Full mobile reporting flow; too stateful to extract as a generic DraftComponent in this pass, but essential context for report-flow design.
- Extractable props: none
- Hardcoded: step labels, mode labels, category icons, sensitive-report messaging, severity buttons, offline copy.

## PageHeader Pattern
- Source: repeated inside page files
- Category: layout
- Description: Sticky mobile header with back action, icon, and page title.
- Extractable props: title, iconName, backHref, trailingAction
- Hardcoded: RTL layout and 44px icon button.

## ReportCard Pattern
- Source: `src/app/public/list/page.tsx`
- Category: basic
- Description: Public non-sensitive report list item with severity badge, station/line metadata, optional image, status/time footer.
- Extractable props: severity, status, hasPhoto
- Hardcoded: privacy rule that sensitive reports are excluded from item cards.

