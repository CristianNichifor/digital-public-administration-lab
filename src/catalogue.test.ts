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
      "/ro/proiecte-civice/achizitii-deschise/",
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
  it("keeps presentation identity independent from runtime and repository names", () => {
    const project = catalogue.find((p) => p.id === "legislativ")!;
    expect(entryPath(project, "en")).toBe("/civic/legislative-linter/");
    expect(matchProxyRoute("/legislativ/assets/app.js")?.upstreamUrl).toContain(
      "/legislativ/assets/app.js",
    );
    expect(project.source).toContain("/legislativ");
  });
  it("does not invent translated app paths or turn unknown pages into catalogue pages", () => {
    expect(resolvePage("/ro/legislativ/")).toBeUndefined();
    expect(resolvePage("/missing/")).toBeUndefined();
    expect(alternatePath("/missing/")).toBeNull();
    expect(matchProxyRoute("/ro/legislativ/")).toBeNull();
  });
});
