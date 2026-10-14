import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App, EmptyListing } from "./App";
import { countLabel } from "./counts";
import { catalogue, entryPath, themes } from "./catalogue";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const text = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replaceAll("&amp;", "&").replace(/\s+/g, " ");

describe("DS-1 home", () => {
  it("counts the tools under each theme heading", () => {
    const html = render("/ro/");
    for (const theme of themes) {
      const n = catalogue.filter((e) => e.collection === "civic" && e.theme === theme.id).length;
      if (n) expect(text(html)).toContain(`${theme.ro} ${countLabel(n, "ro", "tool")}`);
    }
    const others = catalogue.filter((e) => e.collection !== "civic").length;
    expect(text(render("/"))).toContain(`Other ${countLabel(others, "en", "project")}`);
  });
  it("uses singular and plural forms", () => {
    expect(countLabel(1, "ro", "tool")).toBe("1 instrument");
    expect(countLabel(3, "ro", "tool")).toBe("3 instrumente");
    expect(countLabel(1, "en", "project")).toBe("1 project");
    expect(countLabel(2, "ro", "project")).toBe("2 proiecte");
  });
  it("marks live and demo badges with a tone, never by colour alone", () => {
    const html = render("/");
    for (const entry of catalogue) {
      const card = html.split("</article>").find((c) => c.includes(entryPath(entry, "en")))!;
      const tone = { "live-data": "success", "demo-data": "warning" }[entry.status as string];
      if (tone) expect(card, entry.id).toContain(`data-tone="${tone}"`);
      else expect(card, entry.id).not.toContain("data-tone");
    }
  });
  it("has a designed empty state that links back to all projects", () => {
    const html = renderToString(createElement(EmptyListing, { locale: "ro" }));
    expect(html).toContain('class="empty"');
    expect(text(html)).toContain("Nu există proiecte aici încă.");
    expect(html).toContain('href="/ro/"');
  });
});
