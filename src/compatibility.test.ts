import { describe, expect, it } from "vitest";
import { compatibilityRedirect } from "./compatibility";
const redirect = (path: string, host = "proiecte") =>
  compatibilityRedirect(
    new URL(`https://${host}.cristian-nichifor.com${path}`),
    true,
  );
describe("opt-in hostname migration", () => {
  it("stays disabled until the destination and data-recovery gates pass", () => {
    expect(
      compatibilityRedirect(
        new URL("https://digital.cristian-nichifor.com/"),
        false,
      ),
    ).toBeNull();
  });
  it("maps Romanian catalogue entries through explicit translated routes", () => {
    expect(redirect("/")).toBe("https://projects.cristian-nichifor.com/ro/");
    expect(redirect("/tools/?from=old")).toBe(
      "https://projects.cristian-nichifor.com/ro/instrumente/?from=old",
    );
    expect(redirect("/ro/pachete-coda/google-contacts/")).toBe(
      "https://projects.cristian-nichifor.com/ro/pachete-coda/google-contacts/",
    );
  });
  it("preserves runtime paths, query strings and simulator aliases", () => {
    expect(redirect("/legislativ/assets/app.js?q=1")).toBe(
      "https://projects.cristian-nichifor.com/legislativ/assets/app.js?q=1",
    );
    expect(redirect("/salarizare/?year=2026", "digital")).toBe(
      "https://projects.cristian-nichifor.com/romania-reforms/salarizare/?year=2026",
    );
  });
  it("does not redirect canonical hosts, unknown paths or external tools", () => {
    expect(redirect("/", "projects")).toBeNull();
    expect(redirect("/unknown/")).toBeNull();
    expect(redirect("/civic-ui/")).toBeNull();
  });
});
