import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import { catalogue, entryPath } from "./catalogue";

const render = (pathname: string) =>
  renderToString(createElement(App, { pathname }));
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

describe("UXG-B3 data as of", () => {
  it("carries the atlas's documented data date and shows it in both languages", () => {
    const atlas = catalogue.find((e) => e.id === "digital-romania-atlas")!;
    expect(atlas.dataAsOf).toBe("2026-10-14");
    const card = render("/").split("</article>").find((c) => c.includes(entryPath(atlas, "en")))!;
    expect(text(card)).toContain("Data as of October 2026");
    expect(text(render(entryPath(atlas, "ro")))).toContain("Date la octombrie 2026");
  });
  it("leaves undocumented dates empty rather than guessed", () => {
    for (const entry of catalogue)
      if (entry.id !== "digital-romania-atlas") expect(entry.dataAsOf, entry.id).toBeUndefined();
  });
});
