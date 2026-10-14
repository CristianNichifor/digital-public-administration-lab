import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./App";
import {
  alternatePath,
  catalogue,
  collections,
  collectionPath,
  entryPath,
  origin,
  pages,
  privacyPath,
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
      "https://legislation-linter.pages.dev/legislation-linter/assets/app.js",
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
describe("site identity", () => {
  it("publishes the catalogue origin as the package homepage", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.homepage).toBe(`${origin}/`);
  });
});
describe("privacy page", () => {
  it("has a page per language that are each other's alternates", () => {
    expect(privacyPath("en")).toBe("/privacy/");
    expect(privacyPath("ro")).toBe("/ro/confidentialitate/");
    expect(resolvePage("/privacy/")?.locale).toBe("en");
    expect(resolvePage("/ro/confidentialitate/")?.locale).toBe("ro");
    expect(alternatePath("/privacy/")).toBe("/ro/confidentialitate/");
    expect(matchProxyRoute("/privacy/")).toBeNull();
  });
  it("names the operator, the contact and the processors actually used", () => {
    for (const locale of ["en", "ro"] as const) {
      const html = renderToString(
        createElement(App, { pathname: privacyPath(locale) }),
      );
      expect(html).toContain("Cristian Nichifor");
      expect(html).toContain(
        "https://github.com/CristianNichifor/digital-public-administration-lab/issues",
      );
      expect(html).toContain("Cloudflare");
      expect(html).toMatch(/Network Error Logging/);
      expect(html).toMatch(/email-decode|obfusc/i);
      expect(html).not.toMatch(/[şţŞŢ]/);
    }
  });
  it("is linked from the footer of every page in that page's language", () => {
    for (const page of pages) {
      const html = renderToString(createElement(App, { pathname: page.path }));
      const footer = html.slice(html.lastIndexOf("<footer"));
      expect(footer, page.path).toContain(`href="${privacyPath(page.locale)}"`);
    }
  });
});
