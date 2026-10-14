import { describe, expect, it, vi } from "vitest";
import { catalogue } from "./catalogue";
import content from "./catalogue-content.json";
import cache from "./freshness.json";
import { refreshFreshness } from "./freshness";

const ok = (date: string) =>
  new Response(JSON.stringify([{ commit: { committer: { date } } }]));

describe("DPAL-11 freshness", () => {
  it("takes each repository's last commit on main", async () => {
    const fetch = vi.fn(async () => ok("2026-10-13T08:00:00Z"));
    const result = await refreshFreshness({ a: "2026-01-01" }, { fetch });
    expect(result).toEqual({ a: "2026-10-13" });
    expect(fetch).toHaveBeenCalledWith(
      "https://api.github.com/repos/CristianNichifor/a/commits?sha=main&per_page=1",
      expect.objectContaining({ headers: expect.any(Object) }),
    );
  });
  it("sends the token when one is set", async () => {
    const fetch = vi.fn(async (_url: string, init: RequestInit) => {
      expect((init.headers as Record<string, string>).Authorization).toBe(
        "Bearer t",
      );
      return ok("2026-10-13T08:00:00Z");
    });
    await refreshFreshness({ a: "2026-01-01" }, { fetch, token: "t" });
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("keeps the cached date on HTTP or network errors", async () => {
    const fetch = vi.fn(async (url: string) => {
      if (url.includes("/a/")) return new Response("{}", { status: 403 });
      if (url.includes("/b/")) throw new TypeError("offline");
      return new Response("[]");
    });
    expect(
      await refreshFreshness(
        { a: "2026-01-01", b: "2026-02-02", c: "2026-03-03" },
        { fetch },
      ),
    ).toEqual({ a: "2026-01-01", b: "2026-02-02", c: "2026-03-03" });
  });
  it("covers every repository from the committed cache", () => {
    for (const entry of catalogue) {
      expect(cache, entry.id).toHaveProperty(entry.repository);
      expect(entry.updated).toBe(
        cache[entry.repository as keyof typeof cache].slice(0, 7),
      );
    }
    for (const entry of Object.values(content))
      expect(entry).not.toHaveProperty("updated");
  });
});
