import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { aboutPath, alternatePath, pages, privacyPath, resolvePage } from "./catalogue";
import { livePaths } from "./live-paths";
import { matchProxyRoute } from "./projects";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ");
const gh = "https://github.com/CristianNichifor";
/** The repository documents every statement on the page is taken from. */
const sources = [
  `${gh}/open-procurement/blob/main/METHODOLOGY.md`,
  `${gh}/open-procurement/blob/main/CORRECTIONS.md`,
  `${gh}/digital-romania-atlas/blob/main/docs/METHODOLOGY.md`,
  `${gh}/digital-romania-atlas/blob/main/ERRATA.md`,
  `${gh}/romania-reforms/tree/main/simulators`,
  `${gh}/bureaucracy-as-code/blob/main/docs/privacy-model.md`,
  `${gh}/digital-public-administration-lab/blob/main/LICENSE`,
  `${gh}/digital-public-administration-lab/issues`,
];

describe("UX-9 about & method page", () => {
  it("has a page per language that are each other's alternates", () => {
    expect(aboutPath("en")).toBe("/about/");
    expect(aboutPath("ro")).toBe("/ro/despre/");
    expect(resolvePage("/about/")?.locale).toBe("en");
    expect(resolvePage("/ro/despre/")?.locale).toBe("ro");
    expect(alternatePath("/about/")).toBe("/ro/despre/");
    expect(alternatePath("/ro/despre/")).toBe("/about/");
    expect(matchProxyRoute("/about/")).toBeNull();
    for (const path of ["/about/", "/ro/despre/"]) expect(livePaths()).toContain(path);
  });
  it("covers independence, sources, corrections and no tracking with its source links", () => {
    const headings = {
      en: ["About & method", "Independence", "Sources shown", "Corrections", "No tracking"],
      ro: ["Despre și metodă", "Independență", "Surse la vedere", "Corectări", "Fără urmărire"],
    };
    for (const locale of ["en", "ro"] as const) {
      const html = render(aboutPath(locale));
      const [h1, ...h2s] = headings[locale];
      expect(html).toContain(`<h1>${h1.replaceAll("&", "&amp;")}</h1>`);
      let last = 0;
      for (const heading of h2s) {
        const at = html.indexOf(`<h2>${heading}</h2>`);
        expect(at, `${locale} ${heading}`).toBeGreaterThan(last);
        last = at;
      }
      expect(html).toContain("Cristian Nichifor");
      expect(html).toContain("MIT");
      for (const source of sources) expect(html, source).toContain(`href="${source}"`);
      expect(html).toContain(`href="${privacyPath(locale)}"`);
      const visible = text(html);
      expect(visible).not.toMatch(/[şţŞŢ]/);
      expect(visible).toMatch(locale === "ro" ? /cookie-uri/ : /no cookies/);
      expect(visible).toMatch(locale === "ro" ? /drept la replică/ : /right of reply/);
      expect(visible).not.toMatch(/\b(draft|TODO|lorem)\b/i);
    }
  });
  it("renders different copy per language and the Coda invitation on neither", () => {
    const en = render("/about/");
    const ro = render("/ro/despre/");
    expect(en).not.toBe(ro);
    expect(en).not.toContain("Instrumente");
    expect(ro).not.toContain("Independent, open-source");
    for (const html of [en, ro]) expect(html).not.toContain('class="invitation"');
  });
  it("is linked from the footer of every page in that page's language", () => {
    const labels = { en: "About & method", ro: "Despre și metodă" };
    for (const page of pages) {
      const footer = render(page.path).slice(render(page.path).lastIndexOf("<footer"));
      expect(footer, page.path).toContain(
        `href="${aboutPath(page.locale)}">${labels[page.locale].replaceAll("&", "&amp;")}</a>`,
      );
    }
  });
});

describe("DS-3 about page section index", () => {
  it.each(["/about/", "/ro/despre/"])("links every section from an anchored list on %s", (path) => {
    const html = render(path);
    const ids = [...html.matchAll(/<h2 id="([^"]+)">/g)].map((m) => m[1]);
    expect(ids).toHaveLength(4);
    const nav = html.match(/<nav class="collections"[^>]*aria-label="[^"]+"[^>]*>(.*?)<\/nav>/s);
    expect(nav).not.toBeNull();
    const hrefs = [...nav![1].matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(ids);
  });
});
