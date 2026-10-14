import { describe, expect, it } from "vitest";
import { livePaths } from "./live-paths";
import { projects } from "./projects";

describe("live path check list", () => {
  it("covers both homes, the privacy pages and every hosted project root", () => {
    const paths = livePaths();
    for (const path of ["/", "/ro/", "/privacy/", "/ro/confidentialitate/"])
      expect(paths).toContain(path);
    for (const project of projects.filter((p) => p.kind !== "external"))
      expect(paths).toContain(`/${project.slug}/`);
    expect(paths.some((path) => path.startsWith("/civic-ui"))).toBe(false);
  });
  it("covers the simulator paths under /romania-reforms/", () => {
    for (const slug of ["salarizare", "administrativ", "public-pay", "administrative-reform"])
      expect(livePaths()).toContain(`/romania-reforms/${slug}/`);
  });
  it("lists every path once", () => {
    expect(new Set(livePaths()).size).toBe(livePaths().length);
  });
});
