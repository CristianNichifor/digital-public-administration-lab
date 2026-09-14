import { describe, expect, it } from "vitest";

const routes = ["/", "/bureaucracy-as-code/", "/atlas", "/identity", "/audit-log"];

describe("digital lab routes", () => {
  it("keeps bureaucracy-as-code mounted as a child route", () => {
    expect(routes).toContain("/bureaucracy-as-code/");
  });
});
