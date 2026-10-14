# UX guidelines — projects.cristian-nichifor.com (hub)

This hub is the front door of the civic tool family. It follows the fleet
guideline in civic-ui `docs/ux-guidelines.md` and adds the rules below for how
the hub itself looks and how it presents each app. Where the two disagree, the
civic-ui guideline wins and this file is updated.

Rules marked **[test]** are enforced by a test named in the
[Conformance](#8-conformance) table.

## 1. Users and top tasks

| User | Top task |
| --- | --- |
| Citizen, journalist, NGO researcher | Find the right civic tool for a question about public money, law or the digital state, and open it |
| Civic-tech peer, public servant | Judge whether a tool is trustworthy: status, freshness, sources, what it is not |
| Recruiter, collaborator | See what the author builds and get in touch |

**The one job of the first screen:** say in one sentence what this site is
(independent, open-source tools about the Romanian state, built on public data,
not affiliated with any institution) and show the civic tools grouped by
theme. Everything else is below the fold or one click away.

## 2. Page anatomy

Every hub page, top to bottom:

1. Skip link, then site header: brand (home link) and language switch.
2. H1 and a one-line purpose (hero `lead`).
3. Provenance: on project pages, the status line (badge · updated · data as
   of). The hub holds no data of its own, so it has no "Date: sursă, an" line;
   each app carries its own.
4. Primary task: on home, the themed card grid; on a project page, the
   "Open the tool" button.
5. Secondary: filters, project page sections (what it answers → what it is
   not → how it works → sources → related tools).
6. Footer: copyright, GitHub, contact, privacy. A method page (UX-9) is
   pending owner content.

### How the hub presents an app

The hub is the single place that names, labels and dates every app. Apps
show the same name in their family bar (civic-ui `FamilyBar`, `toolName`),
and their family bar links back to the hub (`homeHref`
`https://projects.cristian-nichifor.com/` or `/ro/`).

**Card** (`Card` in `src/App.tsx`), in this order:

1. Status line: badge, "Updated <month year>", and "Data as of <month year>"
   when the entry has `dataAsOf`.
2. Title as the card's only link, to the hub project page (not the app). **[test]**
3. Summary (one sentence, what you can do).
4. Caveat (`body`: what it is not, how to read results). **[test]**
5. Languages ("Language: Romanian" / "Limba: română"). **[test]**

No ↗ on the card: the link stays on the site. ↗ marks only links that leave
the site. **[test]**

**Status badge** — exactly the shared vocabulary, from `statusLabels` in
`src/catalogue.ts`: **[test]**

| Key | EN | RO | Use when |
| --- | --- | --- | --- |
| `live-data` | Live data | Date reale | The app reads a real, refreshed public source |
| `demo-data` | Demo data | Date demonstrative | Real interface, illustrative or seeded data |
| `prototype` | Prototype | Prototip | Design or method exploration; results not to be relied on |
| `archived` | Archived | Arhivat | Kept for reference, no longer maintained |

A badge is text, never colour alone. Change a status only with evidence in the
app (a source citation for `live-data`); status changes need human review.

**Dates** — "Updated" is the month of the last commit on the app's production
branch, generated at build (DPAL-11), never typed by hand and never the build
date. "Data as of" is the month of the newest source data the app shows,
typed in `catalogue-content.json` only from the app's own provenance line.
Format: month and year, `ro-RO` / `en-GB` (`octombrie 2026`, `October 2026`). **[test]**

**Naming registry** — the names below are canonical. The hub, the app's
family bar, its `<title>` and its README use them verbatim per locale. The
source of truth is `src/catalogue-content.json`; this table mirrors it and a
test keeps the two in sync. **[test]** When civic-ui ships a shared registry,
this table moves there and the hub imports it.

<!-- names:start -->
| Slug | EN | RO |
| --- | --- | --- |
| `romania-reforms` | Romania Reforms | Simulatoare și monitoare |
| `open-procurement` | Open Procurement | Achiziții publice din România |
| `legislation-linter` | Legislation Linter | Linter legislativ |
| `bureaucracy-as-code` | Bureaucracy as Code | Birocrație ca program |
| `digital-romania-atlas` | Digital Romania Atlas | Atlasul României digitale |
| `romania-intelligence-reform-dataflows` | Intelligence Reform Data Flows | Fluxuri de date pentru reforma serviciilor de informații |
| `romania-budget-dashboard` | Citizen Budget Dashboard | Bugetul României |
| `civic-ui` | Civic UI | Civic UI |
| `google-contacts` | Google Contacts for Coda | Google Contacts pentru Coda |
| `usr-digital-platform-wireframe` | USR Platform Prototype | Prototip de platformă USR |
<!-- names:end -->

The EN/RO pairs that differ in meaning (Romania Reforms / Simulatoare și
monitoare, Open Procurement / Achiziții publice din România) are a known
drift: needs human decision on one name per app.

## 3. Content rules

- Romanian with comma-below **ș ț** (never ş ţ cedilla). **[test]**
- Dates: month and year as above; full dates `ro-RO` `14 octombrie 2026`.
- Numbers: `ro-RO` grouping (`26,6 mil.`), `en` (`26.6M`); money via the
  apps, the hub quotes no amounts it cannot source.
- Tone: plain, second person, no hype. Say what a tool is not.
- Banned in user-facing text: `proxied`, `mounted`, `upstream`, `slug`,
  `Pages build`, `BFF`, `P0/P2`, repo names in place of app names, `TODO`.
- Every factual claim on a project page restates the app's README, catalogue
  or source; no invented figures (DPAL-12).

## 4. Data visualisation

The hub draws no charts. If one is added, it follows civic-ui `ChartFrame`
rules: viz palette, labels on bars, no dual axes, table alternative, as-of and
source on the chart, demo/partial badge.

## 5. States

- Pages are prerendered static HTML: no loading state on the hub.
- Unknown path: a real 404 page, not the index.
- An app that is down is the app's state; the hub keeps linking to it. The
  uptime probe (DPAL-7) reports it to the maintainer.
- Empty filter: not possible today (every filter has entries); if it becomes
  possible, show "No projects here yet" with a link to all projects.

## 6. Mobile, accessibility, motion

- 390 px: one-column cards, filter chips on one scrollable row. **[test]**
- Touch targets ≥ 24 px, 44 px preferred (buttons, chips, card links).
- WCAG 2.1 AA; axe 0 serious; one H1 per page; landmarks: header, main,
  footer; skip link first.
- Keyboard: every card reachable by Tab through its single link; visible
  focus ring.
- `prefers-reduced-motion`: no transitions beyond colour.
- `forced-colors`: badges and buttons keep a border.

## 7. Status vocabulary

Live data / Demo data / Prototype / Archived (RO: Date reale / Date
demonstrative / Prototip / Arhivat). No other words ("beta", "alpha", "WIP",
"coming soon") on cards or pages.

## 8. Conformance

| Rule | Test |
| --- | --- |
| Hero says what the site is (EN, RO) | `src/ux.test.ts` UX-1 |
| No Coda CTA on civic pages | `src/ux.test.ts` UX-2 |
| Card: one link, caveat, languages, ↗ only off-site | `src/ux.test.ts` UX-3 |
| Filters | `src/ux.test.ts` UX-4 |
| Romanian app names | `src/ux.test.ts` UX-5 |
| Chips on one row on phones | `src/ux.test.ts` UX-6 |
| Status vocabulary, real months | `src/ux.test.ts` UX-7 |
| Themes | `src/ux.test.ts` UX-8 |
| Project page template | `src/ux.test.ts` DPAL-12 |
| Naming registry ↔ catalogue in sync | `src/ux.test.ts` UXG-1 |
| Comma-below ș ț, no banned terms | `src/ux.test.ts` UXG-2 |
| Security headers | `src/security-headers.test.ts` |
| Real 404 | `scripts/smoke-dist.mjs` |

Not yet automated: axe scan, touch-target sizes, 390 px screenshot check,
forced colours. See backlog.

## 9. Known deviations backlog

| ID | Deviation | Where | Owner |
| --- | --- | --- | --- |
| UXG-B1 | Apps do not link back to the hub (no family bar) | each app | each app's session; civic-ui `FamilyBar` |
| UXG-B2 | EN/RO names differ in meaning for two apps | catalogue, apps | needs human |
| UXG-B3 | No entry has `dataAsOf`; cards show only "Updated" | `catalogue-content.json` | fill from each app's provenance line |
| UXG-B4 | 9 of 10 entries are "Prototype"; review with evidence | catalogue | needs human |
| UXG-B5 | About and method page missing (UX-9) | hub | needs owner content |
| UXG-B6 | No automated axe / 390 px / touch-target check | hub | add Playwright smoke when CI allows |
| UXG-B7 | Footer has no method link | hub | after UX-9 |
| UXG-B8 | The hub does not use civic-ui `SiteShell`/`SiteFooter` | hub | later, after civic-ui guideline lands |
