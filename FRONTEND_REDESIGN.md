# FinAuditX Frontend Redesign Specification

**Status:** Design specification only  
**Scope:** Frontend redesign; no application code changes are included in this audit  
**Audience:** Product, UX, frontend, and API-integration contributors  
**Date:** 2026-09-06

## 1. Executive direction

FinAuditX already contains the core workflow for an advisor-facing financial decision-support product: consolidate a client profile, assess financial health, audit gaps, inspect goals and portfolio, test scenarios, review recommendations, and produce a report. The redesign should preserve that deterministic, explainable workflow while making the interface calmer, more decision-oriented, more responsive, and more credible for professional advisor use.

The current frontend is a functional React 18/Vite prototype with eight client-side routes. It uses Tailwind CSS utility classes, Recharts, Lucide icons, Axios, and a shared layout. The current interface is visually consistent at a basic level, but most screens are implemented as large page components with repeated card, loading, filter, and status logic. The redesign should introduce a clear application shell, a small design system, reusable data-display patterns, a resilient data-fetching boundary, and a stronger hierarchy between **what needs attention**, **why it matters**, and **what the advisor can do next**.

The primary redesign principle is:

> **Surface the decision first, preserve the evidence one level below, and keep the advisor in control.**

The redesign is not a backend rewrite. Existing API endpoints and response concepts should remain usable behind an adapter layer. Any API contract changes must be explicitly versioned and coordinated with backend owners.

## 2. Audit baseline

### 2.1 Frontend architecture

| Area | Current implementation | Redesign implication |
|---|---|---|
| Framework | React 18 with `ReactDOM.createRoot` and `StrictMode` | Retain React. Add consistent hooks, composition, and page-level boundaries. |
| Build and dev server | Vite 6; frontend on port 5173 | Retain Vite and the existing `/api` development proxy. |
| Routing | `react-router-dom` v6 with routes declared directly in `App.jsx` | Keep route-based navigation, but centralize route metadata, page titles, breadcrumbs, and active-navigation behavior. |
| Styling | Tailwind CSS 3 with a small `@layer components` set in `index.css` | Formalize tokens and primitives. Avoid page-specific styling drift. |
| Charts | Recharts; one dedicated `GoalTrajectoryChart` | Add chart wrappers, accessible summaries, consistent tooltip formatting, and empty/error states. |
| Icons | Lucide React plus text emoji in several pages and utilities | Standardize on Lucide icons for semantic UI. Do not use emoji as the only severity signal. |
| State | Local `useState` and `useEffect` in each page | Introduce a predictable server-state pattern or a thin query abstraction. Keep transient UI state local. |
| API boundary | Centralized Axios methods in `src/services/api.js` | Preserve the service boundary, add typed/normalized view models, error normalization, and request cancellation where appropriate. |
| Domain logic | Backend engines are described as deterministic and explainable | Frontend should present assumptions, evidence, and disclaimers without duplicating calculation logic. |

### 2.2 Routes and current page maturity

| Route | Current role | Current condition | Redesign priority |
|---|---|---|---|
| `/` | Executive dashboard | Most complete page; loads health score, summary, audit, and goals in parallel | P0 |
| `/profile` | Client financial profile | Broad data dump in sequential cards; useful but not task-oriented | P1 |
| `/audit` | Findings and audit methodology | Strongest explanation model; large inline expandable component | P0 |
| `/goals` | Goal selector and trajectory analysis | Good analytical content; desktop-oriented four-column layouts | P1 |
| `/portfolio` | Portfolio analysis | Placeholder only: “Coming soon…” | P0 |
| `/simulator` | What-if scenarios | Rich interaction model; inputs, presets, and results are all in one large component | P0 |
| `/recommendations` | Prioritized recommendations | Useful explainability fields; repeats audit accordion and filter patterns | P0 |
| `/report` | Advisor-ready report | Print-first document with a basic print stylesheet; no real download action | P1 |

### 2.3 Current UI observations

The current interface uses a left sidebar, white cards, light gray page background, blue primary actions, and severity colors. The `Layout` component keeps the sidebar at 256px or 80px and places content in a `max-w-7xl` container with uniform padding. The visual language is approachable, but it reads more like a dashboard prototype than a professional advisory workspace.

The dashboard currently places the score, dimension bars, critical insights, eight metric cards, goal health, and quick actions in a long vertical sequence. This provides breadth, but the most urgent action is not clearly separated from context. Several pages repeat the same large title/subtitle header and card styling. Critical content is often communicated by color, emoji, or small text rather than by a combination of label, icon, position, and text.

The current UI was inspected from the source implementation. A live runtime inspection was not possible because `http://localhost:5173` was not running during the audit. Visual acceptance must therefore include a browser review after implementation.

## 3. Product and UX goals

### 3.1 Goals

1. **Reduce time to first decision.** An advisor should understand the client’s current health, top risks, and recommended next action within one screen.
2. **Make explainability progressive.** Show a concise conclusion first, then expose evidence, rule context, assumptions, and trade-offs on demand.
3. **Create one coherent workspace.** Navigation, headers, filters, charts, status labels, and actions should behave consistently across all routes.
4. **Support advisor conversations.** The UI should make it easy to discuss a finding with a client, compare alternatives, and prepare a report without losing context.
5. **Work on real laptop widths and smaller screens.** Desktop remains the primary target, but no route should require horizontal scrolling at common tablet widths.
6. **Preserve financial trust.** Formatting, disclaimers, calculation timestamps, and assumptions must be explicit and stable.

### 3.2 Non-goals

The redesign does not authorize changing backend calculations, audit thresholds, recommendation rules, financial formulas, user permissions, authentication, or persistence behavior. It also does not authorize replacing the existing API with GraphQL or introducing a new backend framework.

## 4. Target information architecture

### 4.1 Application shell

Replace the current single-purpose sidebar shell with a professional workspace shell containing:

- A collapsible desktop sidebar with grouped navigation.
- A compact mobile header with a menu drawer.
- A top context bar containing client identity, risk profile, last updated time, and a global “Generate report” action.
- A breadcrumb or page-context line for deep analytical pages.
- A main content region with a consistent maximum width and responsive gutters.
- A persistent but unobtrusive disclaimer/status footer for prototype and calculation context.

Navigation groups should be:

| Group | Routes | Rationale |
|---|---|---|
| Overview | Dashboard | Entry point and portfolio-wide triage. |
| Understand | Client Profile, Goals, Portfolio | Inspect client situation and planning structure. |
| Diagnose | Financial Audit, Recommendations | Move from detected issue to prioritized action. |
| Explore | What-If Simulator | Test advisor-controlled alternatives. |
| Deliver | Advisor Report | Prepare a reviewable client-facing artifact. |

Each navigation item should expose an active state, accessible name, optional count badge for unresolved findings, and a tooltip when the sidebar is collapsed. The current client identity should not be hardcoded in the shell; it should be derived from client data or an explicit demo context.

### 4.2 Proposed route metadata

Create a single route configuration source containing path, label, group, icon, page title, breadcrumb label, and whether the route requires client data. `App.jsx` should compose routes from this configuration rather than duplicating navigation and route definitions independently.

The initial route set remains:

```text
/
/profile
/audit
/goals
/portfolio
/simulator
/recommendations
/report
```

Add a not-found route and a route-level error boundary. If a future client selector is introduced, prefer `/clients/:clientId/...` as a backward-compatible extension rather than silently changing current URLs.

## 5. Screen-by-screen redesign specification

### 5.1 Dashboard: “What needs attention today?”

The dashboard should become a triage screen rather than a complete data dump.

**Top region:**

- Page title: `Financial overview`.
- Client context line: client name, age, location, risk profile, and last calculated timestamp.
- Primary action: `Review critical issues` when critical findings exist; otherwise `Review recommendations`.
- Secondary actions: `Run scenario` and `Open report`.

**Hero summary:**

- Large health score with status label and a plain-language interpretation.
- A compact “change since last review” slot, shown only when a comparison exists.
- Eight dimensions shown as a ranked horizontal list or compact matrix, with the lowest two dimensions emphasized.
- An explicit `View methodology` affordance for score explanation.

**Attention panel:**

- Show the three highest-priority unresolved findings.
- Each item must contain severity text, finding title, one-line impact, and a destination action.
- Show counts for critical, warning, opportunity, and healthy states.
- Do not use emoji-only severity indicators.

**Financial snapshot:**

- Use a responsive metric grid with six to eight metrics.
- Each metric should have label, formatted value, supporting context, and optional directional trend.
- Avoid presenting all metrics with equal visual weight; net worth, surplus, debt, and protection should be the primary metrics.

**Goal health:**

- Use a compact table/list with goal name, status, funding percentage, gap, and next action.
- Allow a goal row to open the goal analysis route with the selected goal preserved.

**Loading and failure behavior:**

- Use page skeletons that match the final layout instead of a centered spinner.
- If one data block fails, keep other blocks visible and show an inline retry state for that block.
- Show a clear “last successful refresh” state when data is stale.

### 5.2 Client Profile: “Know the client before acting”

Reorganize the current sequential card stack into an overview with clear sections and a sticky section navigation on wide screens.

- Profile header with client identity, occupation, location, age, dependents, and risk profile.
- Cash-flow section with income, expenses, surplus, savings rate, and EMI burden.
- Balance-sheet section with assets, liabilities, net worth, and debt composition.
- Protection section with life and other insurance coverage against the relevant requirement.
- Goals section with priority, target, timeline, current corpus, SIP, and status.
- Portfolio allocation section with a donut chart plus an accessible allocation table.

Use tables for repeated financial records instead of nested cards where comparison matters. Preserve Indian number formatting and currency abbreviations, but provide exact values in tooltips or accessible labels.

### 5.3 Financial Audit: “Findings with proof”

Keep the current severity categories and evidence-rich model, but improve scanability and interaction.

- Summary hero with total findings, severity counts, audit timestamp, and “How this audit works”.
- Filter toolbar with segmented severity filters, a search field, and a sort control for severity or category.
- Finding list with a compact collapsed state. Critical findings may be expanded initially, but only the first critical item should be open by default to avoid excessive vertical expansion.
- Finding detail should use a two-column evidence layout on desktop: `Evidence` and `Why it matters` on the left; `Recommendation`, `Impact`, and `Next step` on the right.
- Replace `alert()` for “Why am I seeing this?” with an accessible drawer or dialog containing the rule category, data points used, threshold/range explanation, calculation timestamp, and disclaimer.
- Include keyboard-operable disclosure buttons, `aria-expanded`, and visible focus styles.
- Provide a no-results state that explains the active filter and offers a reset action.

### 5.4 Goals: “Make progress measurable”

The goal screen should prioritize one selected goal while keeping the goal list available.

- Use a horizontal goal selector or responsive list with status, funding percentage, timeline, and priority.
- Selected goal header should show funding percentage, status, target date, and the single most important planning action.
- Present `Current path` and `Required path` as a comparison with explicit legend labels and a plain-language takeaway above the chart.
- Keep the trajectory chart, but add an adjacent summary showing current corpus, projected corpus, inflation-adjusted target, gap, current SIP, and required SIP.
- Put projection assumptions in a collapsible “Assumptions and limitations” panel.
- Ensure chart data has a text/table alternative and no information depends only on line color or dash style.

### 5.5 Portfolio: “See concentration and alignment”

The current route is a placeholder and is the highest completeness gap.

The redesigned screen should include:

- Portfolio summary with total invested value, current allocation, risk profile, and concentration warning.
- Allocation chart paired with a table showing asset class, current percentage, target/risk range, value, and variance.
- “What stands out” panel for overconcentration, under-allocation, liquidity, and risk-alignment findings.
- Goal alignment section showing how each major asset class supports the client’s stated goals.
- A clear link to the simulator for testing a rebalance.
- Empty/error states that distinguish “no portfolio data” from “portfolio data could not be loaded”.

Use `api.getPortfolio()` through the service layer. Do not compute investment recommendations in the frontend.

### 5.6 What-If Simulator: “Compare choices, not controls”

The simulator should become a guided scenario workspace.

**Scenario setup:**

- Preset scenarios as selectable cards with outcome-oriented labels.
- Custom inputs grouped into `Invest`, `Protect`, `Reduce debt`, and `Rebalance` sections.
- Use currency inputs with localized formatting and numeric validation. Use sliders only where a continuous range is genuinely easier than direct entry.
- Show portfolio allocation total and inline validation. Prevent or clearly explain totals that do not equal 100%.
- Display a compact “Current baseline” panel so the user knows what the scenario changes.

**Results:**

- Pin a concise outcome header showing overall impact, health score change, goal readiness change, and critical findings change.
- Show before/after metrics in a comparison table with directional labels, not color alone.
- Show dimension-level changes and goal impact below the main outcome.
- Offer `Use this scenario in report` only when the report API boundary supports it; otherwise label it as a future capability rather than rendering a dead action.
- Preserve the selected scenario and inputs when navigating back from a detail view, if possible.

Use disabled, pending, success, and failed states for both preset and custom runs. Do not replace prior results with a blank screen while a new simulation is pending.

### 5.7 Recommendations: “Turn findings into a plan”

The recommendation page should connect directly to audit findings and present a prioritized action plan.

- Summary hero with total recommendations, critical/high counts, and a short prioritization explanation.
- Filters for priority, category, and linked finding.
- Recommendation cards should show `What`, expected impact, timeframe, confidence, and a clear next step in the collapsed state.
- Expanded content should use labeled sections for `Why`, `Evidence`, `Trade-offs`, `Action steps`, and `Advisor note`.
- Include a visual progress state for reviewed/accepted/deferred only if persistence exists. Otherwise use read-only labels and avoid implying saved workflow state.
- Add an explicit distinction between system suggestion and advisor decision.
- Replace emoji headings with icon-plus-text labels and semantic markup.

### 5.8 Advisor Report: “Deliver a credible review artifact”

Keep the report print-friendly, but make the on-screen report a polished preview.

- Add report metadata: client, report date, data freshness, methodology version, and prototype disclaimer.
- Add `Print` and a real `Download` action only when a supported file-generation path exists. Do not leave an inactive download icon.
- Use a report table of contents or section navigation on screen; omit it from print if not useful.
- Ensure sections do not split awkwardly across pages and that headings repeat appropriately when printed.
- Provide a screen-reader-friendly text hierarchy and a print stylesheet that hides application chrome.
- If report generation fails, keep the last report preview visible and show a retry action.

## 6. Visual design system

### 6.1 Design character

The target visual character is **calm institutional fintech**: neutral surfaces, restrained blue/teal accents, clear typography, generous spacing, and purposeful status color. Avoid excessive gradients, decorative effects, and saturated blocks that compete with financial evidence.

### 6.2 Tokens

Create semantic tokens instead of embedding raw Tailwind colors throughout page components.

| Token group | Direction |
|---|---|
| Surface | `canvas`, `surface`, `surface-subtle`, `surface-emphasis`, `inverse` |
| Text | `text-primary`, `text-secondary`, `text-muted`, `text-inverse` |
| Border | `border-default`, `border-subtle`, `border-strong`, `focus-ring` |
| Brand | Deep navy/blue primary with a restrained teal accent for positive progress. |
| Status | Critical, warning, opportunity, healthy, neutral; each must include background, foreground, border, and icon treatment. |
| Spacing | Use a small spacing scale consistently. Do not mix arbitrary padding values without a component reason. |
| Radius | Use one default card radius, one compact control radius, and one pill radius. |
| Shadow | Prefer subtle elevation for interactive surfaces; avoid shadows on every nested element. |

The existing Tailwind `primary`, `success`, `warning`, `danger`, and `info` colors are a starting point, not a final visual specification. Status colors must meet contrast requirements and remain understandable in grayscale.

### 6.3 Typography

Use one readable sans-serif family with a clear scale:

- Page title: large, compact, high contrast.
- Section title: medium, semibold.
- Metric value: large and tabular where possible.
- Body: comfortable line height for evidence text.
- Caption: reserved for metadata, units, and timestamps.

Do not use all-caps for long labels. Use sentence case for headings and buttons. Use tabular numerals for aligned financial values.

### 6.4 Components to standardize

The redesign should establish these reusable primitives before rebuilding pages:

- `AppShell`, `Sidebar`, `MobileNav`, `TopContextBar`, `Breadcrumbs`.
- `PageHeader`, `SectionHeader`, `ActionGroup`.
- `Card`, `CardHeader`, `MetricCard`, `MetricGrid`.
- `StatusBadge`, `SeverityIcon`, `ScoreBadge`, `ProgressBar`.
- `DataTable`, `KeyValueList`, `EmptyState`, `ErrorState`, `Skeleton`.
- `Disclosure`, `Drawer`, `Dialog`, `Tooltip`, `Toast`.
- `FilterBar`, `SegmentedControl`, `SearchField`, `CurrencyInput`, `PercentInput`.
- `ChartFrame`, `ChartLegend`, `ChartSummary`, `AccessibleChartTable`.
- `FindingCard`, `RecommendationCard`, `GoalCard`, `ComparisonCard`.

Components should receive semantic data and state props rather than raw Tailwind class strings. Page components should compose these primitives and own route-specific orchestration only.

## 7. Interaction and accessibility requirements

All interactive controls must be keyboard reachable, show a visible focus ring, and expose a meaningful accessible name. Disclosure controls must expose expanded state. Dialogs and drawers must trap focus, close predictably, and return focus to the invoking control.

Color is supplementary. Every severity, trend, and status must include text, icon shape, or a labeled value. Charts require a visible legend and a text alternative. Form fields require labels, units, validation messages, and examples where ambiguity is possible.

Target WCAG 2.2 AA contrast for text and controls. Respect reduced-motion preferences for score gauges, progress bars, and route transitions. Avoid automatic motion that communicates financial outcomes without a static equivalent.

Responsive breakpoints should be validated at approximately 320px, 768px, 1024px, and 1440px. The sidebar should become a drawer below the desktop breakpoint. Multi-column financial tables should stack or become horizontally scrollable inside an explicitly labeled region rather than causing the page itself to overflow.

## 8. Frontend data and API boundary specification

### 8.1 Preserve the service boundary

Continue routing all HTTP requests through `src/services/api.js` or a successor service module. Page components must not construct endpoint URLs directly. The service layer should expose domain-oriented methods such as `getDashboardData`, `getAudit`, `getGoals`, `getPortfolio`, and `runSimulation`.

The current endpoints are:

| Domain | Existing endpoint usage |
|---|---|
| Client | `GET /api/client`, `GET /api/client/financial-summary` |
| Audit | `GET /api/audit`, `GET /api/audit/finding/:id` |
| Goals | `GET /api/goals`, `GET /api/goals/:index` |
| Portfolio | `GET /api/portfolio` |
| Simulation | `POST /api/simulation/run`, `GET /api/simulation/presets`, `POST /api/simulation/preset/:name` |
| Recommendations | `GET /api/recommendations`, `GET /api/recommendations/:id`, `GET /api/recommendations/priority/:level` |
| Report | `GET /api/report`, `POST /api/report/with-simulation`, `GET /api/report/health-score` |

### 8.2 Normalize response handling

Add a consistent request lifecycle model with `idle`, `loading`, `success`, `stale`, and `error` states. Normalize errors into a small shape containing user-safe message, retryability, status, and optional request identifier. Avoid exposing raw Axios errors to rendered components.

Where dashboard data requires multiple endpoints, use a page-level orchestration hook that can render partial success. Consider a combined backend endpoint only as a future performance improvement; do not make it a prerequisite for the redesign.

### 8.3 Avoid frontend calculation drift

Formatting is appropriate in the frontend. Financial calculations, scoring, audit thresholds, recommendation ranking, and simulation outcomes remain backend responsibilities. The UI should render backend-provided assumptions and values. Any derived display-only value, such as a savings-rate label, must be clearly identified and covered by tests.

### 8.4 Caching and refresh

Use a lightweight server-state abstraction with request deduplication, stale timestamps, and retry controls. Cache read-heavy data for the current client during a session, but invalidate or refresh after a simulation when report content or dashboard summaries depend on the simulated result. Do not imply real-time data if the backend is deterministic and request-based.

## 9. Proposed frontend structure

The following structure is a target organization, not an instruction to apply immediately:

```text
frontend/src/
├── app/
│   ├── App.jsx
│   ├── routes.js
│   └── providers.jsx
├── components/
│   ├── layout/
│   ├── primitives/
│   ├── data-display/
│   ├── feedback/
│   └── domain/
├── features/
│   ├── dashboard/
│   ├── audit/
│   ├── goals/
│   ├── portfolio/
│   ├── simulator/
│   ├── recommendations/
│   └── report/
├── pages/
├── services/
│   ├── api.js
│   ├── clientService.js
│   └── errorHandling.js
├── charts/
├── hooks/
├── utils/
├── styles/
│   ├── tokens.css
│   ├── components.css
│   └── print.css
└── test/
```

The existing `pages`, `components`, `charts`, `services`, and `utils` directories can be migrated incrementally. Avoid a large-bang file move before the visual system and route behavior are validated.

## 10. Implementation phases

### Phase 0: Baseline and safety

Capture screenshots and route behavior for the current prototype. Record the current API response shapes used by each page. Add no design changes in this phase. Establish a visual regression baseline if the project’s test tooling permits it.

### Phase 1: Foundations

Implement semantic tokens, typography, focus states, shared buttons, cards, status badges, loading skeletons, error states, and the new application shell. Preserve all current routes. Add not-found and route-level error handling.

### Phase 2: Dashboard and shared data patterns

Rebuild the dashboard around triage, replace repeated metric markup with shared components, and add partial-failure behavior. Validate responsive layouts and accessibility before proceeding.

### Phase 3: Audit and recommendations

Extract reusable finding and recommendation cards, filters, disclosures, and explanation dialogs. Link audit findings to recommendations where identifiers exist in API responses.

### Phase 4: Goals, portfolio, and simulator

Rebuild the goal analytical view, implement the missing portfolio screen using the existing portfolio endpoint, and split simulator setup/results into composable sections with robust input validation.

### Phase 5: Report and delivery polish

Refine the report preview, print layout, metadata, and supported download behavior. Add cross-route navigation, stale-data indicators, and final responsive/accessibility fixes.

## 11. Acceptance criteria

The redesign is ready for review when all of the following are true:

1. Every existing route resolves, including `/portfolio`, which no longer displays a placeholder.
2. Navigation, page titles, active states, breadcrumbs, and client context are consistent across routes.
3. Every API-backed page has loading, partial-loading where applicable, empty, error, retry, and stale-data states.
4. No critical information relies on color or emoji alone.
5. Keyboard navigation and visible focus are usable across navigation, filters, disclosures, dialogs, forms, and report actions.
6. Dashboard, audit, goals, portfolio, simulator, recommendations, and report have responsive layouts at the target breakpoints.
7. Simulator inputs validate currency, percentage, and allocation totals before submission.
8. The audit explanation interaction no longer uses `alert()`.
9. The report’s print output hides application chrome and preserves section hierarchy across pages.
10. The frontend does not duplicate backend financial calculations or silently change API semantics.
11. Existing API endpoint usage remains behind the service layer.
12. A browser-based visual review has been completed against the current baseline and this specification.

## 12. Risks and decisions to resolve during implementation

| Risk or decision | Recommended treatment |
|---|---|
| No authenticated client-selection flow exists in the current frontend | Keep the demo client context explicit in the first redesign. Do not invent account or permission behavior. |
| Portfolio endpoint shape is not represented by a completed page | Inspect the backend response before finalizing chart/table mapping. Keep the UI adapter isolated. |
| Report download icon has no implementation | Keep print as the supported action until a real download path is agreed. |
| Dashboard makes four requests in parallel | Preserve current behavior initially, then evaluate a combined endpoint based on performance evidence. |
| Several page files are very large | Extract components by interaction/domain boundary, not by arbitrary line count. |
| Current source uses inline Tailwind classes heavily | Introduce shared primitives incrementally. Avoid a risky full rewrite of all class strings at once. |
| Financial values are prototype/demo data | Keep prototype and calculation disclaimers visible and make freshness explicit. |

## 13. Source baseline reviewed

The specification is based on the repository README, root and frontend package manifests, Vite and Tailwind configuration, application entry and routing, layout, pages, shared components, chart implementation, formatters, global styles, and API service module. No application source file was modified during the audit.

## References

[1]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/README.md "FinAuditX project README and documented product workflow"

[2]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/App.jsx "FinAuditX frontend route composition"

[3]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/layouts/Layout.jsx "FinAuditX application shell and navigation"

[4]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/services/api.js "FinAuditX frontend API service boundary"

[5]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/index.css "FinAuditX global Tailwind component styles and print rules"

[6]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/Dashboard.jsx "FinAuditX dashboard implementation"

[7]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/FinancialAudit.jsx "FinAuditX audit page implementation"

[8]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/Goals.jsx "FinAuditX goals page implementation"

[9]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/Simulator.jsx "FinAuditX simulator implementation"

[10]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/Recommendations.jsx "FinAuditX recommendations page implementation"

[11]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/Report.jsx "FinAuditX advisor report implementation"

[12]: file:///mnt/ab4cb20d-b143-4350-9c4e-d5289445cf5d/FinTechSIH/frontend/src/pages/Portfolio.jsx "FinAuditX portfolio route placeholder"
