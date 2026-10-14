# Design screens — projects.cristian-nichifor.com

Target-state mockups for the hub, so implementation sessions can build them.
Each file in `screens/` is self-contained static HTML: inline CSS that copies
the civic-ui 0.8 token values (colours, space, type scale, viz palette) plus
the hub's own display type and paper colour; no scripts, no requests. Each
page renders the same markup twice, in a 1440 px frame and a 390 px frame,
through a CSS container query, so both layouts are visible side by side.

Copy is Romanian with comma-below ș ț and restates the catalogue
(`src/catalogue-content.json`), `src/project-pages.ts` and PR #42. "—" marks
a value the repository does not hold (no entry has `dataAsOf`; no licence is
recorded; the app chart has no figures here). Agent-written Romanian: needs
human review.

Guideline sources: this repo's `docs/ux-guidelines.md` (hub) and civic-ui
`docs/ux-guidelines.md` (fleet); spec items DS-1…DS-4 in
`docs/specs/production-readiness.md`.

| Screen | User task | Guideline sections | What changes vs today | Acceptance criteria |
| --- | --- | --- | --- | --- |
| [01 Home](screens/01-home.html) | Find the right civic tool and open it; judge trust at a glance | hub §1, §2 card, §5 states, §6 mobile, §7 vocabulary; fleet §7 | Header gains "Despre și metodă"; chips and header links are 44 px targets; badges get a border and a colour stripe (border kept in forced colours); cards show "Date la" when present; theme headings carry a count; a designed empty-filter state; footer gains the method link (UXG-B7) | DS-1: theme count rendered; empty state markup when a collection has no entries; badge border rule in CSS; 390 px one-column grid with chips on one row (UX-6) |
| [02 Project page](screens/02-project-page.html) | Decide whether to trust the tool, then open it | hub §2 anatomy, §3 content; fleet §2 provenance line | Provenance line (Sursa · Date la · Licență · Metodologie) under the summary before the button; "Deschide instrumentul"; "Vezi codul sursă" as a secondary bordered button; related tools show status and summary | DS-2: provenance line present with "—" fallbacks; button labels; related items carry a badge |
| [03 About & method](screens/03-about-method.html) | Understand who builds the tools, the method, corrections, tracking | hub §2 footer, UX-9; fleet §3 tone | PR #42 content plus an anchored section list under the lead; header and footer link to the page | DS-3: four H2s in order, anchor list links resolve, header and footer links |
| [04 Family bar and footer in an app](screens/04-app-family-bar.html) | Recognise the family, get back to the hub, read provenance, survive loading/error/empty | fleet §2 anatomy, §4 viz, §5 states, §7 badge, §8 UX-1/3/9/10/17 | Every app gets the civic-ui `FamilyBar` (back link to the hub, registry name, badge, language switch), H1 + purpose + "Date:" line, staged loading, error with one retry, empty with a reason, demo badge with labelled bars and "Afișează ca tabel"; footer adds a link to the hub About page | DS-4: per app, civic-ui checklist UX-1, UX-3, UX-9, UX-10, UX-17 |

## Before screenshots and mockup PNGs

Not produced in this round: the fleet ran without browsers on 2026-10-14
(memory limit). Needs human: at 1440 and 390 px run

```
npx -y playwright screenshot --full-page --wait-for-timeout=4000 https://projects.cristian-nichifor.com/ro/ before-home.png
npx -y playwright screenshot --full-page --wait-for-timeout=4000 docs/design/screens/01-home.html 01-home.png
```

and commit the PNGs next to the mockups. Until then, open the HTML files in
a browser; the 390 px frame sits to the right of the 1440 px frame.

## Implementation notes

- Badge: keep `statusLabels` as the only text; add `data-tone` from the
  status key (`live-data` → `success`, `demo-data` → `warning`, others none).
- Provenance line needs new optional catalogue fields `source`, `licence`,
  `methodHref` per entry; render "—" when absent, never invent.
- The hub keeps its own header (brand, About, Work with me, language) and
  does not adopt `SiteShell` yet (UXG-B8); apps do.
- Touch targets: chips, header links and buttons are 44 px; footer links and
  the back link at least 24 px.
