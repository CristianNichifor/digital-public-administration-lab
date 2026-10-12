import { describe, expect, it } from "vitest";
import {
  alternatePath,
  catalogue,
  collections,
  collectionPath,
  entryPath,
  pages,
  resolvePage,
} from "./catalogue";
import { matchProxyRoute } from "./projects";
describe("localized catalogue contract", () => {
  it("uses translated routes rather than mechanically prefixed English URLs", () => {
    expect(collectionPath("tools", "ro")).toBe("/ro/instrumente/");
    expect(alternatePath("/coda-packs/google-contacts/")).toBe(
      "/ro/pachete-coda/google-contacts/",
    );
    expect(alternatePath("/civic/open-procurement/")).toBe(
      "/ro/proiecte-civice/open-procurement/",
    );
    expect(resolvePage("/ro/tools/")).toBeUndefined();
  });
  it("has unique pages and reciprocal language links", () => {
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length);
    for (const page of pages) {
      expect(alternatePath(alternatePath(page.path)!)).toBe(page.path);
      expect(matchProxyRoute(page.path)).toBeNull();
    }
  });
  it("keeps every collection reachable in both languages", () => {
    for (const c of collections)
      for (const locale of ["en", "ro"] as const) {
        expect(resolvePage(collectionPath(c.id, locale))).toBeDefined();
        expect(catalogue.some((p) => p.collection === c.id)).toBe(true);
      }
  });
  it("names a project in English in both languages, runtime path and repository alike", () => {
    const project = catalogue.find((p) => p.id === "legislation-linter")!;
    expect(entryPath(project, "en")).toBe("/civic/legislation-linter/");
    expect(entryPath(project, "ro")).toBe(
      "/ro/proiecte-civice/legislation-linter/",
    );
    expect(project.ro.title).toBe("Legislation Linter");
    expect(
      matchProxyRoute("/legislation-linter/assets/app.js")?.upstreamUrl,
    ).toBe(
      "https://cristiannichifor.github.io/legislation-linter/assets/app.js",
    );
    expect(project.source).toBe(
      "https://github.com/CristianNichifor/legislation-linter",
    );
  });
  it("does not invent translated app paths or turn unknown pages into catalogue pages", () => {
    expect(resolvePage("/ro/legislation-linter/")).toBeUndefined();
    expect(resolvePage("/missing/")).toBeUndefined();
    expect(alternatePath("/missing/")).toBeNull();
    expect(matchProxyRoute("/ro/legislation-linter/")).toBeNull();
  });
});
