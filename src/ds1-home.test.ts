import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App, EmptyCollection } from "./App";
import { countLabel } from "./count-label";
import { catalogue, collections, entryPath, themes } from "./catalogue";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const cards = (html: string) =>
  [...html.matchAll(/<article class="project[^"]*"[^>]*>.*?<\/article>/gs)].map((m) => m[0]);
const css = readFileSync("src/styles.css", "utf8");

describe("DS-1 home screen", () => {
  it("counts the tools under every theme heading and the projects under Other", () => {
    const civic = catalogue.filter((e) => e.collection === "civic");
    for (const locale of ["en", "ro"] as const) {
      const html = render(locale === "ro" ? "/ro/" : "/");
      for (const theme of themes) {
        const n = civic.filter((e) => e.theme === theme.id).length;
        expect(html, theme.id).toContain(
          `<h2>${theme[locale].replaceAll("&", "&amp;")} <small>${countLabel(n, locale, "tool")}</small></h2>`,
        );
      }
      const other = collections.find((c) => c.id === "other")![locale].title;
      expect(html).toContain(
        `<h2>${other} <small>${countLabel(catalogue.length - civic.length, locale, "project")}</small></h2>`,
      );
    }
    expect(countLabel(1, "en", "tool")).toBe("1 tool");
    expect(countLabel(1, "ro", "project")).toBe("1 proiect");
  });
  it("gives live and demo badges a tone, with a border rule in the stylesheet", () => {
    const home = render("/");
    for (const entry of catalogue) {
      const card = cards(home).find((c) => c.includes(`href="${entryPath(entry, "en")}"`))!;
      const tone = entry.status === "live-data" ? "success" : entry.status === "demo-data" ? "warning" : undefined;
      if (tone) expect(card, entry.id).toContain(`<span class="tag" data-tone="${tone}">`);
      else expect(card, entry.id).toContain('<span class="tag">');
    }
    expect(css).toMatch(/\.tag\[data-tone\]\s*\{[^}]*border:/);
    expect(css).toMatch(/\.tag\[data-tone="success"\]\s*\{[^}]*border-color/);
    expect(css).toMatch(/\.tag\[data-tone="warning"\]\s*\{[^}]*border-color/);
  });
  it("shows a designed empty state only when a collection has no entries", () => {
    const ro = renderToString(createElement(EmptyCollection, { locale: "ro" }));
    expect(ro).toContain("Nu există proiecte aici încă.");
    expect(ro).toContain('href="/ro/"');
    const en = renderToString(createElement(EmptyCollection, { locale: "en" }));
    expect(en).toContain("No projects here yet.");
    expect(en).toContain('href="/"');
    for (const c of collections)
      for (const locale of ["en", "ro"] as const)
        expect(render(`${locale === "ro" ? "/ro/" : "/"}${c[locale].slug}/`)).not.toContain('class="empty"');
  });
  it("gives chips and header links 44 px touch targets", () => {
    expect(css).toMatch(/\.collections a\s*\{[^}]*min-height:\s*44px/);
    expect(css).toMatch(/\.site-header nav a\s*\{[^}]*min-height:\s*44px/);
  });
});
