import { describe, expect, it } from "vitest";
import { catalogue } from "./catalogue";
import { projectPages } from "./project-pages";

/** DS-2: the provenance line's method link, data half; rendering follows in App.tsx. */
describe("DS-2 method links", () => {
  it("points each method link at a document in the project's own repository", () => {
    const withMethod = Object.entries(projectPages).filter(([, page]) => page.methodHref);
    expect(withMethod.length).toBeGreaterThan(0);
    for (const [id, page] of withMethod) {
      const entry = catalogue.find((item) => item.id === id);
      expect(entry, id).toBeDefined();
      expect(page.methodHref, id).toMatch(new RegExp(`^${entry!.source}/(blob|tree)/main/`));
    }
  });
  it("gives the three projects whose method the about page cites a method link", () => {
    for (const id of ["open-procurement", "digital-romania-atlas", "romania-reforms"])
      expect(projectPages[id].methodHref, id).toBeDefined();
  });
});
