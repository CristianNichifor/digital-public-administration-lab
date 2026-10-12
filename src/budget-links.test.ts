import { describe, expect, it } from "vitest";
import { budgetApi, budgetHref, budgetPages } from "./budget-links";
describe("budget dashboard links folded from tablou", () => {
  it("links each page to its English route and its Romanian twin under /ro/", () => {
    const share = budgetPages.find((link) => link.path.en === "/your-share/")!;
    expect(budgetHref(share, "en")).toBe(
      "https://budget.cristian-nichifor.com/your-share/",
    );
    expect(budgetHref(share, "ro")).toBe(
      "https://budget.cristian-nichifor.com/ro/felia-ta/",
    );
  });
  it("keeps every route on the budget host, trailing slash, Romanian prefixed", () => {
    expect(budgetPages).toHaveLength(9);
    for (const link of budgetPages) {
      expect(link.path.en).toMatch(/^\/(?!ro\/)([a-z-]+\/)?$/);
      expect(link.path.ro).toMatch(/^\/ro\/([a-z-]+\/)?$/);
    }
  });
  it("calls the API on the dashboard's own origin", () => {
    expect(budgetApi.href).toBe(
      "https://budget.cristian-nichifor.com/api/budget/comparison",
    );
  });
});
