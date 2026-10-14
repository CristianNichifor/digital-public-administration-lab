import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
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
