# Production readiness: projects.cristian-nichifor.com

Every app on the fleet is served through this host, so changes to
`functions/_middleware.ts` stay conservative: strict policies apply to the
catalogue pages this repo renders, and proxied apps only receive headers that
cannot break their own runtime needs.

Status values: `todo`, `done`, `blocked`, `needs-human`.

## Theme A: legal and identity

### DPAL-1 Privacy page and imprint (`done`)

- Given a built `dist/`, when `/privacy/` and `/ro/confidentialitate/` are
  requested, then each is a prerendered page in its language with an imprint
  (operator Cristian Nichifor, contact through this repository's GitHub issues),
  the processors the host actually uses (Cloudflare Pages hosting, Cloudflare
  Network Error Logging, Cloudflare email address obfuscation) and the
  statement that the catalogue sets no cookies and runs no analytics.
- Given any prerendered page, when it renders, then its footer links to the
  privacy page of its own language; the static `404.html` links to both.
- Given the two privacy pages, then they are reciprocal language alternates,
  are listed in the sitemap and never match a proxy route.
- Tests: `src/catalogue.test.ts` (routes, reciprocity, footer link in rendered
  markup), `scripts/smoke-dist.mjs` (every sitemap page links to its privacy
  page; 404 links to both), `scripts/verify-catalogue.mjs` (route count).
- The Romanian text is written by the agent: needs human review.

### DPAL-3 Favicon, Open Graph image and Twitter tags (`done`)

- Given any prerendered page, then it links `/favicon.svg` as its icon, carries
  `og:image` (absolute URL to a 1200x630 PNG in `dist/`), `og:site_name`,
  `og:locale`, and `twitter:card=summary_large_image`, `twitter:title`,
  `twitter:description`, `twitter:image`.
- Tests: `scripts/smoke-dist.mjs` asserts each tag once per sitemap page and
  that the referenced files exist in `dist/`.

### DPAL-6 Package homepage (`done`)

- Given `package.json`, then `homepage` is `https://projects.cristian-nichifor.com/`,
  the catalogue origin plus a trailing slash.
- Test: `src/catalogue.test.ts`. The homepage was already correct on dev; the test pins it.

## Theme B: hub correctness

### DPAL-2 Stale routing comment and live path check (`done`)

- Given `src/projects.ts`, then the comment on the absent simulator repos
  describes what those repos publish today (a redirect stub into
  `/romania-reforms/public-pay/` and `/romania-reforms/administrative-reform/`)
  and the module header no longer says upstreams are GitHub Pages builds.
- Given `node scripts/check-live-paths.mjs`, when run against production, then
  it requests `/`, `/ro/`, every proxied and mounted project root and the
  `/romania-reforms/{salarizare,administrativ,public-pay,administrative-reform}/`
  paths, prints the status of each, and exits 0 unless `--strict` is passed.
  It is not a PR gate and is not run in CI.
- Test: `src/live-paths.test.ts` covers the path list. Run with `pnpm check:live`.
  On 2026-10-14 the salarizare and administrativ paths answered 404 (romania-reforms
  redirect stubs pending) and the privacy pages 404 until this work is promoted.

### DPAL-4 Canonical Link header on proxied HTML (`done`)

- Given a proxied request whose upstream answers 200 with `text/html`, then the
  response carries `Link: <https://projects.cristian-nichifor.com{path}>; rel="canonical"`,
  appended to any upstream `Link` value; non-HTML and non-200 responses are untouched.
- Test: `functions/_middleware.test.ts`.

### DPAL-5 Security headers (`done`)

- Given a catalogue page (every sitemap path), then `dist/_headers` gives it a
  strict `Content-Security-Policy` (`default-src 'self'`, scripts from `'self'`
  only, which covers Cloudflare's same-origin email-decode script,
  `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`).
- Given any static or proxied response, then it carries `X-Frame-Options:
  SAMEORIGIN`, `X-Content-Type-Options: nosniff` and `Referrer-Policy`, and
  proxied responses receive no `Content-Security-Policy` from the host, because
  the apps have their own needs (DuckDB-Wasm from jsdelivr, Pyodide's
  `'unsafe-eval'`).
- Tests: `src/security-headers.test.ts` (policy and rules), `functions/_middleware.test.ts`
  (proxied responses), `scripts/smoke-dist.mjs` (every sitemap path has a CSP rule).

## Theme C: dependencies

### DPAL-8 Dependency majors (`done`)

- Given the open Dependabot bumps (eslint 10, lucide-react 1.x, typescript-eslint,
  eslint-plugin-react-refresh, wrangler), when applied together, then
  `pnpm verify && pnpm smoke` is green.
- Test: the full verify gate.

## Theme D: UX review quick wins

### UX-1 Hero passes the five-second test (`done`)

- Given `/` or `/ro/`, then the hero says, in its language, that these are
  independent, open-source civic tools about the Romanian state that explain
  public data, and that they are not affiliated with any public institution;
  the home `<title>` and description say the same.
- Test: `src/ux.test.ts` (rendered hero text).
- Romanian copy: needs human review.

### UX-2 No Coda CTA on civic pages (`done`)

- Given a civic project page, then it has no "discuss a Coda workflow"
  invitation; non-civic pages keep it.
- Test: `src/ux.test.ts`.

### UX-3 Cards: one link, caveat, languages, honest arrows (`done`)

- Given any card, then it contains exactly one link, the whole card is its hit
  area, it shows the catalogue `body` caveat and the app's languages, and
  internal links use → while only off-site links use ↗ (catalogue-wide).
- Test: `src/ux.test.ts` (rendered markup), `scripts/smoke-dist.mjs` (no ↗ on
  same-origin links).

### UX-4 "Other" replaces one-item filters (`done`)

- Given the filter nav, then it offers All, Civic projects and Other; Other
  (`/other/`, `/ro/altele/`) lists the Coda Pack, tool and experiment, and
  their back links point to it. The old collection URLs keep working.
- Test: `src/catalogue.test.ts`, `src/ux.test.ts`; route count 34.

### UX-5 Romanian app names on /ro/ (`done`)

- Given a Romanian page, then apps carry the names they use in Romanian
  (Achiziții publice din România, Linter legislativ, Simulatoare și monitoare,
  Bugetul României).
- Test: `src/ux.test.ts`.

### UX-6 Filter chips on one row on phones (`done`)

- Given a 390px viewport, then the filter chips stay on one row (three chips,
  no wrapping; horizontal scroll as a fallback).
- Test: `src/ux.test.ts` asserts the nav has three links and the stylesheet
  keeps it unwrapped on small screens; checked by screenshot.

### UX-7 Status badges, last updated, data as of (`done`)

- Given the catalogue, then every entry has `status` in Live data / Demo data /
  Prototype / Archived, `updated` (YYYY-MM, the month of the repository's last
  commit on main) and optional `dataAsOf`; cards and project pages show them.
- Test: `src/ux.test.ts` (vocabulary, formats, rendering).
- The status assignments and the missing `dataAsOf` values: needs human review.

### UX-8 Civic tools grouped by theme (`done`)

- Given the home and civic pages, then civic tools are grouped under Money,
  Law & reform, and State & digital.
- Test: `src/ux.test.ts`.

### UX-9 About & method page (`Draft: needs owner review`)

- Given `/about/` and `/ro/despre/`, then each is a prerendered page in its
  language, the other's alternate, linked from the footer of every page, in the
  sitemap and in the live-path check list.
- Given the page, then it covers independence (built by Cristian Nichifor, not
  affiliated with the state, MIT, source public), sources shown (the project
  methodologies: observation not accusation, facts and proposals kept apart,
  deterministic simulators), the corrections process (Open Procurement
  `CORRECTIONS.md`, Digital Romania Atlas `ERRATA.md`, GitHub issues for the
  rest) and no tracking (no cookies or analytics, no personal data published),
  and every statement links the repository document it is taken from.
- Given the page, then it adds no fact that is not in those documents and passes
  the UXG-2 content rules.
- Test: `src/about.test.ts`.
- Draft: needs owner review. The method statement is assembled by an agent from
  `METHODOLOGY.md`, `CORRECTIONS.md`, `ERRATA.md` and `docs/privacy-model.md`
  in the projects; the owner decides what to keep and the Romanian wording.
  The project template part of the old UX-9 is DPAL-12.

## Theme E: generated freshness and project pages

### DPAL-11 Freshness from the GitHub API (`done`)

- Given a build with network access, when `pnpm build` runs, then each
  catalogue entry's `updated` is the month of the last commit on its
  repository's production branch (`main`), read from the GitHub API
  (`GITHUB_TOKEN` used when set), and the committed cache
  `src/freshness.json` is rewritten with those dates.
- Given a build without network access, or a failed or non-OK response for a
  repository, then that repository keeps its cached date and the build still
  succeeds; `updated` is never the build date.
- Given the catalogue, then every repository has a cached date and
  `catalogue-content.json` holds no hand-written `updated`.
- Tests: `src/freshness.test.ts` (mocked `fetch`: success, HTTP error,
  network error, token header, branch), `src/ux.test.ts` (UX-7 formats).

### DPAL-12 Project page template (`done`)

- Given a project page, then it shows, in this order when present: "What it
  answers" (up to three bullets), "What it is not" (the existing catalogue
  caveat, set apart as a callout), "How it works", "Sources" (with licence
  where known) and "Related tools" (other catalogue entries in the same theme
  or collection).
- Given an entry with no curated bullets or sources, then that section is
  left out rather than filled with invented text; every bullet and source
  restates an existing catalogue, README or project-description fact.
- Tests: `src/ux.test.ts` (rendered sections, order, empty-section omission,
  related links resolve to catalogue pages).
- Content lives in `src/project-pages.ts`. The Google Contacts Coda Pack keeps
  its own sections and gets no bullets; civic-ui and the USR wireframe get
  "How it works" only.
- Agent-written Romanian and the chosen bullets: needs human review. The
  Open Procurement figure (26.6M records) is civic-tech-hub's and may be stale.

### DPAL-13 "How it works" from civic-tech-hub (`done`)

- Given a project that civic-tech-hub described (its `index.html` before the
  redirect, commit `f0184cd`), then its project page carries that concrete
  description in both languages under "How it works".
- Tests: `src/ux.test.ts` (the carried-over text renders on the EN and RO
  pages of each described project).

## Theme F: UX guideline

### UXG-1 Hub UX guideline and naming registry (`done`)

- Given `docs/ux-guidelines.md`, then it covers users and first-screen job,
  page anatomy, how the hub presents an app (card, status badge, updated and
  data-as-of dates, naming registry), content, data-viz, states, mobile and
  accessibility, status vocabulary, a conformance table and a deviations
  backlog, and defers to civic-ui `docs/ux-guidelines.md`.
- Given the naming registry table, then it equals the catalogue's slug, EN and
  RO titles in order.
- Test: `src/ux.test.ts` UXG-1.
- The registry and the two EN/RO name pairs that differ in meaning: needs
  human review.

### UXG-2 Content rules on every page (`done`)

- Given any prerendered page, then its visible text has no cedilla ş ţ and
  none of the banned internal or off-vocabulary terms (proxied, upstream,
  slug, BFF, TODO, beta, alpha, WIP, coming soon).
- The Google Contacts copy said "beta"; it now says Prototype, matching its
  badge. Agent-written Romanian: needs human review.
- Test: `src/ux.test.ts` UXG-2.

### UXG-3 Reduced motion and forced colours (`done`)

- Given `prefers-reduced-motion: reduce`, then no transition, animation or
  smooth scroll runs.
- Given `forced-colors: active`, then buttons and status badges keep a
  visible border.
- Test: `src/ux.test.ts` UXG-3 (stylesheet rules).

### UXG-4 Page structure on every page (`done`)

- Given any prerendered page, then the first link is the skip link, there is
  exactly one H1, a header, a `main#main` and a footer, and every image has
  an `alt`.
- Test: `src/ux.test.ts` UXG-4 (a regression guard; it passed on arrival).

### UXG-B3 Data as of, from each app's own provenance (`partial`)

- Given a catalogue entry whose app documents a data-as-of date in its
  repository, then the entry carries it as `dataAsOf` and the card and project
  page show "Data as of" / "Date la" with that month.
- Found on 2026-10-14: Digital Romania Atlas publishes `META.dataAsOf`
  (`src/data/meta.ts`, "2026-10-14"); it is the one entry filled. Open
  Procurement states only a coverage range (2016–2026), the budget dashboard
  reads `updatedAt` live from its API, Legislation Linter shows freshness per
  law, and the simulators, Bureaucracy as Code, the data-flows demo and the
  USR prototype document no data date. Those stay empty rather than guessed:
  needs human (each app adds a provenance line first, see civic-ui
  `docs/ux-guidelines.md` section 2).
- Test: `src/data-as-of.test.ts`.

### DS-3 About page: anchors and header link (`done`)

Implements `docs/design/screens/03-about-method.html` (PR #47) on the UX-9
page from #42.

- Given `/about/` or `/ro/despre/`, then an "On this page" / "Pe această
  pagină" navigation under the lead lists the four sections, each link
  resolves to an `h2` with that id, and the four H2s keep their order.
- Given any page, then the header navigation links the About page in the page
  language, with `aria-current="page"` on the About page only; the footer link
  from UX-9 stays.
- Given `src/screens.css` (layered over `styles.css`, which #49/#46 own this
  round), then the anchor links are 44 px targets.
- Test: `src/ds3-about.test.ts`.

## Maintainer-only

- DPAL-7 uptime probe workflow: `needs-human` (workflow changes; diff in the PR body).
- DPAL-10 decoupling from the CN Webify preview broker: `needs-human`, user
  decision pending; nothing done.

## Theme G: target-state screen designs

Static mockups in `docs/design/screens/`, indexed by `docs/design/README.md`.
They are the target state for the hub screens; implementation sessions turn
the acceptance criteria below into tests.

### DS-1 Home: theme groups, status badges, empty filter (`done`)

- Given the home mockup, then it shows the hero, the three filter chips at
  44 px height, every civic tool under its theme with a count, a status badge
  with a border and a colour stripe (never colour alone), "Actualizat în" and,
  when the catalogue has it, "Date la", and a designed empty-filter state
  ("Nu există proiecte aici încă" with a link to all projects).
- Test (implementation): `src/ux.test.ts` asserts the theme count, the empty
  state markup when a collection has no entries, and the badge border rule in
  the stylesheet; screenshot at 390 px checks the one-column grid.
- Mockup: `docs/design/screens/01-home.html`. Romanian: needs human review.

### DS-2 Project page template with provenance line (`done`)

- Given a project page, then under the summary and before the primary button
  it shows a provenance line with source, "Date la", licence and a method
  link, each "—" when the catalogue lacks the value; the primary button reads
  "Deschide instrumentul" / "Open the tool"; "View source" is a secondary
  bordered button; related tools show their status and summary.
- Test (implementation): `src/ux.test.ts` DPAL-12 extended with the
  provenance line and the button labels.
- Mockup: `docs/design/screens/02-project-page.html`.

### DS-3 About and method page with section index (`done`)

- Given `/ro/despre/`, then it has the four sections from UX-9 (PR #42) and
  an anchored "on this page" list under the lead; header and footer link to it.
- Test (implementation): `src/about.test.ts` (PR #42) plus the anchor list and
  the header link.
- Mockup: `docs/design/screens/03-about-method.html`.

### DS-4 Family bar and footer inside an app (`done`)

- Given any app page, then the first screen shows the civic-ui family bar
  (hub back link to `https://projects.cristian-nichifor.com/ro/`, registry
  name, status badge, language switch), one H1, one purpose line, the
  provenance line, and the four designed states (staged loading, error with
  retry, empty, demo data with labelled bars and a table alternative); the
  footer carries method, privacy, source, contact and a link to the hub's
  About page.
- Test (implementation, per app): civic-ui UX-1, UX-3, UX-9, UX-10, UX-17.
- Mockup: `docs/design/screens/04-app-family-bar.html`.

- Screenshots of the mockups and of the live site were not produced: the
  fleet ran without browsers on 2026-10-14 (memory limit). Needs human: run
  `npx -y playwright screenshot --full-page --wait-for-timeout=4000 <file> out.png`
  at 1440 and 390 and commit the PNGs next to the mockups.
