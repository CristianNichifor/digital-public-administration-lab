import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { pages } from "./catalogue";
import {
  catalogueCsp,
  catalogueHeaderRules,
  securityHeaders,
} from "./security-headers";

describe("catalogue Content-Security-Policy", () => {
  const directives = new Map(
    catalogueCsp.split("; ").map((d) => {
      const [name, ...values] = d.split(" ");
      return [name, values.join(" ")];
    }),
  );
  it("allows only this origin to run scripts, which covers Cloudflare's email-decode script", () => {
    expect(directives.get("default-src")).toBe("'self'");
    expect(directives.get("script-src")).toBe("'self'");
    expect(catalogueCsp).not.toMatch(/unsafe-(inline|eval)/);
  });
  it("refuses framing, plugins, base rewrites and foreign form targets", () => {
    expect(directives.get("frame-ancestors")).toBe("'none'");
    expect(directives.get("object-src")).toBe("'none'");
    expect(directives.get("base-uri")).toBe("'self'");
    expect(directives.get("form-action")).toBe("'self'");
  });
});

describe("_headers rules", () => {
  it("gives every catalogue page exactly the catalogue CSP", () => {
    const rules = catalogueHeaderRules(pages.map((p) => p.path));
    for (const page of pages)
      expect(rules).toContain(
        `\n${page.path}\n  Content-Security-Policy: ${catalogueCsp}\n`,
      );
    expect(rules).not.toContain("/*");
  });
  it("stays under Cloudflare's 100-rule limit together with the static rules", () => {
    const staticRules = readFileSync("public/_headers", "utf8").match(/^\S/gm)!;
    expect(pages.length + staticRules.length).toBeLessThanOrEqual(100);
  });
  it("applies the shared security headers to every static file", () => {
    const all = readFileSync("public/_headers", "utf8").split(/\n(?=\S)/)[0];
    expect(all.startsWith("/*\n")).toBe(true);
    for (const [name, value] of Object.entries(securityHeaders))
      expect(all).toContain(`  ${name}: ${value}`);
  });
});
