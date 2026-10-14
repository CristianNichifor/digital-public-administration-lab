import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { catalogue, entryPath, statusLabels } from "./catalogue";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replaceAll("&amp;", "&").replace(/\s+/g, " ");
const byId = (id: string) => catalogue.find((e) => e.id === id)!;
const provenance = (html: string) =>
  html.match(/<p class="provenance">.*?<\/p>/s)?.[0] ?? "";

describe("DS-2 provenance line and buttons", () => {
  it("shows source, data date, licence and method between summary and button", () => {
    const html = render(entryPath(byId("open-procurement"), "ro"));
    const line = provenance(html);
    expect(text(line)).toContain("Sursa: SEAP / e-licitatie.ro api-pub");
    expect(text(line)).toContain("Date la: —");
    expect(text(line)).toContain("Licență: Open Government Licence v1.0");
    expect(line).toContain(
      'href="https://github.com/CristianNichifor/open-procurement/blob/main/METHODOLOGY.md"',
    );
    const at = (s: string) => html.indexOf(s);
    expect(at('class="lead"')).toBeLessThan(at('class="provenance"'));
    expect(at('class="provenance"')).toBeLessThan(at('class="actions"'));
  });
  it("falls back to — for every value the catalogue lacks", () => {
    const line = text(provenance(render(entryPath(byId("bureaucracy-as-code"), "en"))));
    expect(line).toContain("Source: —");
    expect(line).toContain("Data as of: —");
    expect(line).toContain("Licence: —");
    expect(line).toContain("Method: —");
  });
  it("labels the primary button as opening the tool", () => {
    expect(text(render(entryPath(byId("legislation-linter"), "ro")))).toContain(
      "Deschide instrumentul",
    );
    expect(text(render(entryPath(byId("legislation-linter"), "en")))).toContain(
      "Open the tool",
    );
  });
  it("gives related tools their status and summary", () => {
    const html = render(entryPath(byId("open-procurement"), "en"));
    const related = html.split('class="related"')[1].split("</ul>")[0];
    const other = byId("romania-budget-dashboard");
    expect(text(related)).toContain(statusLabels[other.status].en);
    expect(text(related)).toContain(other.en.summary);
  });
});
