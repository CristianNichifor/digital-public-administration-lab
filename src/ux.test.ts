import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { projectPages } from "./project-pages";
import {
  catalogue,
  collectionPath,
  entryPath,
  pages,
  resolvePage,
  statusLabels,
  themes,
} from "./catalogue";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const cards = (html: string) =>
  [...html.matchAll(/<article class="project[^"]*"[^>]*>.*?<\/article>/gs)].map(
    (m) => m[0],
  );
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ");

describe("UX-1 hero", () => {
  it("says what the site is in English", () => {
    const hero = text(render("/").split("</section>")[0]);
    expect(hero).toMatch(/independent/i);
    expect(hero).toMatch(/open-source/i);
    expect(hero).toMatch(/Romanian state/);
    expect(hero).toMatch(/public data/i);
    expect(hero).toMatch(/not affiliated/i);
  });
  it("says what the site is in Romanian", () => {
    const hero = text(render("/ro/").split("</section>")[0]);
    expect(hero).toMatch(/independente/);
    expect(hero).toMatch(/open source/);
    expect(hero).toMatch(/statul român/i);
    expect(hero).toMatch(/date publice/);
    expect(hero).toMatch(/nu sunt afiliate/i);
  });
});

describe("UX-2 calls to action", () => {
  it("drops the Coda invitation from civic project pages only", () => {
    for (const entry of catalogue)
      for (const locale of ["en", "ro"] as const) {
        const html = render(entryPath(entry, locale));
        expect(html.includes('class="invitation"'), entry.id).toBe(
          entry.collection !== "civic",
        );
      }
  });
});

describe("UX-3 cards", () => {
  it("have one link, the caveat, the languages and no off-site arrow", () => {
    for (const locale of ["en", "ro"] as const) {
      const found = cards(render(locale === "en" ? "/" : "/ro/"));
      expect(found).toHaveLength(catalogue.length);
      for (const [i, card] of found.entries()) {
        const entry = catalogue.find((e) =>
          card.includes(`href="${entryPath(e, locale)}"`),
        )!;
        expect(entry, `card ${i}`).toBeDefined();
        expect((card.match(/<a /g) ?? []).length).toBe(1);
        expect(text(card)).toContain(entry[locale].body);
        expect(text(card)).toMatch(
          locale === "en" ? /Language: (Romanian|English)/ : /Limba: (română|engleză)/,
        );
        expect(card).not.toContain("↗");
      }
    }
  });
  it("uses ↗ only for links that leave the site", () => {
    for (const page of pages)
      for (const [, href, body] of render(page.path).matchAll(
        /<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gs,
      ))
        if (href.startsWith("/"))
          expect(body, `${page.path} ${href}`).not.toContain("↗");
  });
});

describe("UX-4 filters", () => {
  it("offers All, Civic projects and Other", () => {
    const nav = render("/").match(/<nav class="collections".*?<\/nav>/s)![0];
    expect(text(nav).trim()).toBe("All projects Civic projects Other");
    expect(text(render("/ro/").match(/<nav class="collections".*?<\/nav>/s)![0]).trim()).toBe(
      "Toate proiectele Proiecte civice Altele",
    );
  });
  it("lists every non-civic entry under Other and points back there", () => {
    expect(collectionPath("other", "en")).toBe("/other/");
    expect(collectionPath("other", "ro")).toBe("/ro/altele/");
    const other = catalogue.filter((e) => e.collection !== "civic");
    expect(cards(render("/other/"))).toHaveLength(other.length);
    for (const entry of other)
      expect(render(entryPath(entry, "en"))).toContain(
        'class="back" href="/other/"',
      );
    expect(resolvePage("/coda-packs/")).toBeDefined();
  });
});

describe("UX-5 Romanian names", () => {
  it("uses the names the apps carry in Romanian", () => {
    const html = text(render("/ro/"));
    for (const name of [
      "Achiziții publice din România",
      "Linter legislativ",
      "Simulatoare și monitoare",
      "Bugetul României",
    ])
      expect(html).toContain(name);
  });
});

describe("UX-6 filter chips on phones", () => {
  it("keeps the chips on one row on small screens", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const small = css.slice(css.indexOf("@media (max-width: 520px)"));
    expect(small).toMatch(/\.collections\s*\{[^}]*flex-wrap:\s*nowrap/);
    expect(small).toMatch(/\.collections\s*\{[^}]*overflow-x:\s*auto/);
  });
});

describe("UX-7 status", () => {
  const now = new Date().toISOString().slice(0, 7);
  it("uses the shared vocabulary and real months", () => {
    expect(Object.values(statusLabels).map((l) => l.en)).toEqual([
      "Live data",
      "Demo data",
      "Prototype",
      "Archived",
    ]);
    for (const entry of catalogue) {
      expect(Object.keys(statusLabels), entry.id).toContain(entry.status);
      expect(entry.updated, entry.id).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
      expect(entry.updated <= now, entry.id).toBe(true);
      if ("dataAsOf" in entry && entry.dataAsOf)
        expect(entry.dataAsOf).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
    }
  });
  it("shows status and last update on cards and project pages", () => {
    const entry = catalogue.find((e) => e.id === "open-procurement")!;
    const label = statusLabels[entry.status as keyof typeof statusLabels];
    const card = cards(render("/")).find((c) => c.includes(entryPath(entry, "en")))!;
    expect(text(card)).toContain(label.en);
    expect(text(card)).toMatch(/Updated \w+ \d{4}/);
    expect(text(render(entryPath(entry, "ro")))).toMatch(
      new RegExp(`${label.ro}.*Actualizat (în )?\\S+ \\d{4}`),
    );
  });
});

describe("UX-8 themes", () => {
  it("groups every civic tool under a theme on the home and civic pages", () => {
    expect(themes.map((t) => t.en)).toEqual(["Money", "Law & reform", "State & digital"]);
    for (const entry of catalogue.filter((e) => e.collection === "civic"))
      expect(themes.map((t) => t.id), entry.id).toContain(entry.theme);
    for (const path of ["/", "/civic/"]) {
      const html = text(render(path));
      for (const theme of themes) expect(html).toContain(theme.en);
    }
    const ro = text(render("/ro/proiecte-civice/"));
    for (const theme of themes) expect(ro).toContain(theme.ro);
  });
});

describe("DPAL-12 project page template", () => {
  const headings = {
    en: ["What it answers", "What it is not", "How it works", "Sources", "Related tools"],
    ro: ["Ce răspunde", "Ce nu este", "Cum funcționează", "Surse", "Instrumente înrudite"],
  };
  it("renders the sections in order and the caveat as a callout", () => {
    for (const locale of ["en", "ro"] as const) {
      const html = render(entryPath(catalogue.find((e) => e.id === "open-procurement")!, locale));
      const at = headings[locale].map((h) => html.indexOf(`>${h}</h2>`));
      expect(at.every((i) => i > 0), at.join()).toBe(true);
      expect([...at].sort((a, b) => a - b)).toEqual(at);
      expect(html).toMatch(/<aside class="callout"[^>]*>.*?<\/aside>/s);
      const callout = html.match(/<aside class="callout"[^>]*>.*?<\/aside>/s)![0];
      expect(text(callout)).toContain(catalogue.find((e) => e.id === "open-procurement")![locale].body);
      expect(text(html.split('class="answers"')[1].split("</ul>")[0]).length).toBeGreaterThan(0);
      expect(text(html)).toContain("Open Government Licence v1.0");
    }
  });
  it("has at most three answers per entry and both languages", () => {
    for (const [id, page] of Object.entries(projectPages)) {
      expect(page.answers?.en.length ?? 0, id).toBeLessThanOrEqual(3);
      expect(page.answers?.en.length, id).toBe(page.answers?.ro.length);
      expect(catalogue.map((e) => e.id), id).toContain(id);
    }
  });
  it("omits sections it has no content for", () => {
    const html = render(entryPath(catalogue.find((e) => e.id === "google-contacts")!, "en"));
    for (const h of ["What it answers", "How it works", "Sources"]) expect(html).not.toContain(`>${h}</h2>`);
  });
  it("links related tools to their catalogue pages", () => {
    for (const entry of catalogue)
      for (const locale of ["en", "ro"] as const) {
        const html = render(entryPath(entry, locale));
        const section = html.split(`>${headings[locale][4]}</h2>`)[1]?.split("</section>")[0] ?? "";
        for (const [, href] of section.matchAll(/href="([^"]+)"/g)) {
          expect(resolvePage(href)?.entry, href).toBeDefined();
          expect(href).not.toBe(entryPath(entry, locale));
        }
      }
  });
});

describe("DPAL-13 how it works from civic-tech-hub", () => {
  const carried = {
    "romania-reforms": ["deterministic, explainable, browser-only", "deterministe, explicabile"],
    "legislation-linter": ["every finding carries its source article", "fiecare rezultat indică articolul sursă"],
    "open-procurement": ["DuckDB-Wasm", "DuckDB-Wasm"],
    "digital-romania-atlas": ["digital backbone", "backbone digital"],
    "romania-intelligence-reform-dataflows": ["current vs. target-state", "starea-țintă"],
    "usr-digital-platform-wireframe": ["not an approved or connected service", "nu este un serviciu aprobat"],
    "civic-ui": ["opt-in themes", "teme opționale"],
  };
  it("renders the carried-over description in both languages", () => {
    for (const [id, [en, ro]] of Object.entries(carried)) {
      const entry = catalogue.find((e) => e.id === id)!;
      expect(text(render(entryPath(entry, "en"))), id).toContain(en);
      expect(text(render(entryPath(entry, "ro"))), id).toContain(ro);
    }
  });
});

describe("UXG-1 naming registry", () => {
  it("mirrors the catalogue names in docs/ux-guidelines.md", () => {
    const doc = readFileSync("docs/ux-guidelines.md", "utf8");
    const table = doc.split("<!-- names:start -->")[1].split("<!-- names:end -->")[0];
    const rows = [...table.matchAll(/^\| `([^`]+)` \| (.+?) \| (.+?) \|$/gm)].map(
      ([, slug, en, ro]) => [slug, en, ro],
    );
    expect(rows).toEqual(catalogue.map((e) => [e.id, e.en.title, e.ro.title]));
  });
});

describe("UXG-2 content rules", () => {
  const banned =
    /\b(proxied|mounted|upstream|slug|Pages build|BFF|P0|P2|TODO|beta|alpha|WIP|coming soon)\b/i;
  it("uses comma-below ș ț and no internal or off-vocabulary terms", () => {
    for (const page of pages) {
      const visible = text(render(page.path));
      expect(visible, page.path).not.toMatch(/[şţŞŢ]/);
      expect(visible, page.path).not.toMatch(banned);
    }
  });
});

describe("UXG-3 motion and forced colours", () => {
  const css = readFileSync("src/styles.css", "utf8");
  it("turns motion off when the visitor asks for less", () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*transition: none/);
  });
  it("keeps buttons and badges outlined in forced colours", () => {
    const block = css.slice(css.indexOf("@media (forced-colors: active)"));
    expect(block).toMatch(/\.button[^{]*\{[^}]*border: 1px solid ButtonText/);
    expect(block).toMatch(/\.tag[^{]*\{[^}]*border: 1px solid/);
  });
});

describe("UXG-4 page structure", () => {
  it("has a skip link first, one H1 and header, main and footer landmarks", () => {
    for (const page of pages) {
      const html = render(page.path);
      expect(html.match(/<a [^>]*>/)![0], page.path).toContain('class="skip"');
      expect(html.match(/<h1[ >]/g) ?? [], page.path).toHaveLength(1);
      for (const tag of ["<header", '<main id="main"', "<footer"])
        expect(html, `${page.path} ${tag}`).toContain(tag);
      expect(html.match(/<img (?![^>]*alt=)/g) ?? [], page.path).toHaveLength(0);
    }
  });
});

describe("DS-5 touch targets", () => {
  const css = readFileSync("src/styles.css", "utf8");
  const rule = (selector: string) =>
    css.slice(css.indexOf(`\n${selector} {`)).split("}")[0];
  it("gives chips, header links and buttons a 44 px minimum height", () => {
    for (const selector of [".collections a", ".site-header nav a", ".button"])
      expect(rule(selector), selector).toMatch(/min-height:\s*44px/);
  });
  it("keeps the current chip visible in forced colours", () => {
    const block = css.slice(css.indexOf("@media (forced-colors: active)"));
    expect(block).toMatch(/\.collections a\[aria-current\][^{]*\{[^}]*border: [^;]*Highlight/);
  });
  it("gives footer links and the back link a 24 px minimum height", () => {
    for (const selector of ["footer a", ".back"])
      expect(rule(selector), selector).toMatch(/min-height:\s*24px/);
  });
});
