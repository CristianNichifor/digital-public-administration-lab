import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { catalogue, entryPath, statusLabels } from "./catalogue";
import { projectPages } from "./project-pages";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replaceAll("&amp;", "&").replace(/\s+/g, " ");
const by = (id: string) => catalogue.find((e) => e.id === id)!;

describe("DS-2 project page provenance line", () => {
  it("shows source, date, licence and method under the summary, with dashes for missing values", () => {
    for (const locale of ["en", "ro"] as const) {
      const ro = locale === "ro";
      const op = render(entryPath(by("open-procurement"), locale));
      const line = op.match(/<p class="provenance">.*?<\/p>/s)![0];
      expect(op.indexOf('class="provenance"')).toBeLessThan(op.indexOf('class="actions"'));
      expect(op.indexOf('class="provenance"')).toBeGreaterThan(op.indexOf('class="lead"'));
      const page = projectPages["open-procurement"];
      expect(text(line)).toContain(`${ro ? "Sursa" : "Source"}: ${page.sources!.map((s) => s.name).join(", ")}`);
      expect(text(line)).toContain(`${ro ? "Licență" : "Licence"}: Open Government Licence v1.0`);
      expect(text(line)).toContain(`${ro ? "Date la" : "Data as of"}: —`);
      expect(line).toContain(`<a href="${page.methodHref}">${ro ? "Metodologie" : "Method"} ↗</a>`);
      const gc = render(entryPath(by("google-contacts"), locale)).match(/<p class="provenance">.*?<\/p>/s)![0];
      expect(text(gc)).toContain(`${ro ? "Sursa" : "Source"}: —`);
      expect(text(gc)).toContain(`${ro ? "Licență" : "Licence"}: —`);
      expect(text(gc)).toContain(`${ro ? "Metodologie" : "Method"}: —`);
    }
  });
  it("only links methodology documents the apps actually publish", () => {
    for (const [id, page] of Object.entries(projectPages))
      if (page.methodHref)
        expect(page.methodHref, id).toMatch(
          new RegExp(`^https://github.com/CristianNichifor/${by(id).repository}/blob/main/.*METHODOLOGY\\.md$`),
        );
  });
  it("labels the primary button 'Open the tool' and makes 'View source' a secondary button", () => {
    const en = render(entryPath(by("open-procurement"), "en"));
    expect(en).toMatch(/class="button" href="\/open-procurement\/">Open the tool/);
    expect(en).toMatch(/class="button button--secondary" href="https:\/\/github.com\/CristianNichifor\/open-procurement">View source(<!-- -->)? ↗/);
    const ro = render(entryPath(by("open-procurement"), "ro"));
    expect(ro).toContain("Deschide instrumentul");
    expect(ro).toMatch(/Vezi codul sursă(<!-- -->)? ↗/);
    expect(render(entryPath(by("civic-ui"), "en"))).toContain("Explore components");
    const css = readFileSync("src/styles.css", "utf8");
    expect(css).toMatch(/\.button--secondary\s*\{[^}]*border: 1px solid/);
  });
  it("shows a badge and the summary on every related tool", () => {
    for (const entry of catalogue)
      for (const locale of ["en", "ro"] as const) {
        const html = render(entryPath(entry, locale));
        const section = html.split('<ul class="related">')[1]?.split("</ul>")[0];
        if (!section) continue;
        for (const item of section.matchAll(/<li>(.*?)<\/li>/gs)) {
          const related = catalogue.find((e) => item[1].includes(`href="${entryPath(e, locale)}"`))!;
          expect(related, entry.id).toBeDefined();
          expect(item[1]).toContain(`<span class="tag">${statusLabels[related.status][locale]}</span>`);
          expect(text(item[1])).toContain(related[locale].summary);
        }
      }
  });
});
