import { describe, expect, it } from "vitest";
import { catalogue } from "./catalogue";

// UXG-B3: a "Data as of" date is shown only when the app itself publishes one. Each value here
// names the place in the app's repository it is copied from.
const published = {
  // digital-romania-atlas src/data/meta.ts › META.dataAsOf
  "digital-romania-atlas": "2026-09-11",
};

describe("UXG-B3 data as of", () => {
  it("copies the date each app publishes, and invents none", () => {
    for (const entry of catalogue)
      expect(entry.dataAsOf, entry.id).toBe(
        published[entry.id as keyof typeof published],
      );
  });
});
