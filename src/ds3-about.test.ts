import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { aboutSections } from "./about-sections";
import { App } from "./App";
import { aboutPath, pages } from "./catalogue";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const labels = { en: "About &amp; method", ro: "Despre și metodă" };

describe("DS-3 about page anchors and header link", () => {
  it("lists the four sections under the lead and every anchor resolves in order", () => {
    for (const locale of ["en", "ro"] as const) {
      const html = render(aboutPath(locale));
      const nav = html.split(`aria-label="${locale === "ro" ? "Pe această pagină" : "On this page"}"`)[1]?.split("</nav>")[0];
      expect(nav, locale).toBeDefined();
      let last = html.indexOf("</nav>", html.indexOf('class="toc"'));
      for (const section of aboutSections) {
        const id = section.id[locale];
        expect(nav).toContain(`<a href="#${id}">${section[locale]}</a>`);
        const at = html.indexOf(`<h2 id="${id}">${section[locale]}</h2>`);
        expect(at, `${locale} ${id}`).toBeGreaterThan(last);
        last = at;
      }
    }
  });
  it("links the about page from the header of every page, current on the about page only", () => {
    for (const page of pages) {
      const html = render(page.path);
      const header = html.slice(html.indexOf("<header"), html.indexOf("</header>"));
      const current = "about" in page ? ' aria-current="page"' : "";
      expect(header, page.path).toContain(
        `<a href="${aboutPath(page.locale)}"${current}>${labels[page.locale]}</a>`,
      );
    }
  });
  it("gives the anchor links 44 px targets", () => {
    const css = readFileSync("src/screens.css", "utf8");
    expect(css).toMatch(/\.toc a\s*\{[^}]*min-height:\s*44px/);
  });
});
