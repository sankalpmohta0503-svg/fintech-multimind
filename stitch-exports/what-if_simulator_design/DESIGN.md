---
name: Corporate / Modern
colors:
  surface: '#FFFFFF'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
  canvas: '#F8FAFC'
  surface-subtle: '#F1F5F9'
  surface-emphasis: '#E2E8F0'
  border-default: '#CBD5E1'
  border-subtle: '#E2E8F0'
  border-strong: '#94A3B8'
  text-primary: '#0F172A'
  text-secondary: '#475569'
  text-muted: '#64748B'
  status-critical-bg: '#FEF2F2'
  status-critical-fg: '#991B1B'
  status-warning-bg: '#FFFBEB'
  status-warning-fg: '#92400E'
  status-opportunity-bg: '#EFF6FF'
  status-opportunity-fg: '#1E40AF'
  status-healthy-bg: '#F0FDF4'
  status-healthy-fg: '#166534'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  section-title:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-default:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  metric-value:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-3xs: 2px
  space-2xs: 4px
  space-xs: 8px
  space-sm: 12px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
  space-2xl: 48px
  container-max: 1280px
---

## Brand & Style

This design system embodies a calm, institutional fintech aesthetic. It projects absolute reliability, precision, and authority, prioritizing operational clarity and trust for professional financial advisors over superficial decoration.

- **Target Audience:** Certified financial advisors, wealth managers, and institutional auditors who require high-density, error-free data presentation.
- **Emotional Response:** Reassurance, focus, analytical clarity, and confident control.
- **Visual Style:** A rigorous Corporate/Modern hybrid utilizing structured information architecture, generous containment surfaces, restrained chromatic interventions, and uncompromising scannability.

## Colors

The palette is anchored by deep navy and slate tones representing institutional stability, paired with a restrained teal for positive progress and high-contrast semantic tones for audit findings.

- **Primary:** Deep slate navy (`#0F172A`) for high-impact structural elements, navigation, and primary branding.
- **Secondary / Accent:** Deep teal (`#0D9488`) deployed selectively for positive indicators, key interactive states, and active data visualization points.
- **Neutrals:** Carefully stepped cool grays (`#F8FAFC` canvas, `#FFFFFF` surfaces, `#0F172A` primary text) tuned to eliminate optical fatigue during extended analytical sessions.
- **Status & Feedback:** Explicitly mapped semantic tokens for critical, warning, opportunity, and healthy states. All status indicators guarantee accessible contrast ratios and remain fully decipherable in grayscale through strict pairing of icons, text, and background fills.

## Typography

The typography system relies on **Inter** to deliver exceptional legibility across dense data tables, financial metrics, and narrative audit reports.

- **Tabular Numerals:** All financial metrics and data grids must enforce tabular numeral variants (`font-variant-numeric: tabular-nums`) to ensure vertical alignment across rows.
- **Case Rules:** Sentence case is strictly mandated for all headings, UI labels, and button texts. All-caps styling is prohibited for labels exceeding three words to preserve cognitive processing speed.

## Layout & Spacing

The layout model is built on a responsive fixed-max container (`1280px`) utilizing a rigorous 8px baseline grid system. 

- **Rhythmic Density:** Component padding and section margins scale predictably using the defined spacing tokens, ensuring a high-density yet breathable workstation experience for advisors.
- **Breakpoints:** Responsive adaptations trigger at **320px** (mobile stacked), **768px** (tablet dual-column), **1024px** (compact desktop workspace), and **1440px** (expanded multi-panel audit view). Gutters scale dynamically between 16px and 32px.

## Elevation & Depth

Depth is handled with absolute restraint to maintain an uncluttered analytical workspace. 

- **Low-Contrast Outlines:** Primary structural separation relies on subtle borders (`border-subtle`, `border-default`) rather than drop shadows.
- **Surface Layering:** Hierarchy is conveyed through tonal surface stepping (`canvas` to `surface` to `surface-subtle`) rather than floating cards.
- **Shadows:** Micro-shadows are strictly reserved for active interactive overlays, floating action menus, and dropdown popovers, avoiding decorative shadows on nested containers.

## Shapes

The shape language reflects professional precision through controlled geometric radii.

- **Default Radius:** Cards, containers, and inputs utilize a tight **4px** (`0.25rem`) corner radius to maintain a crisp, institutional profile.
- **Interactive Controls:** Buttons and form elements use **4px** to **6px** radii.
- **Pill Elements:** Status badges and metric tags use fully rounded pill geometry (`9999px`) to immediately distinguish metadata from structural containers.

## Components

Components are engineered for speed, scannability, and audit compliance, utilizing Lucide React icons paired with mandatory text labels.

- **Buttons:** Available in primary (deep navy fill), secondary (subtle surface with border), and ghost variants. Focus states require high-contrast focus rings.
- **Status Badges:** Strict pill-shaped containers combining background fills, foreground text, and explicit icon markers for critical, warning, opportunity, and healthy states. Emojis are strictly banned.
- **Input Fields:** Clear label placement above, inline error messaging below, and explicit border color shifts on focus and error states.
- **Cards:** Structured container surfaces featuring a 1-pixel default border, clear section title, and optional header action region.
- **Tables & Data Grids:** High-density rows with alternating subtle background tints, fixed column headers, and right-aligned tabular numerals for all financial metrics.
- **Audit Findings Panels:** Specialized triage containers featuring severity left-border accents, collapsible evidence drawers, and direct advisor action triggers.