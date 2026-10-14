/**
 * DPAL-11: an entry's "updated" month is the last commit on its repository's production branch,
 * read from the GitHub API at build time. `freshness.json` is the committed cache: a repository
 * the API does not answer for keeps its cached date, so offline builds still work and the build
 * date never stands in for a commit date.
 */
export type Freshness = Record<string, string>;

type Fetch = (url: string, init: RequestInit) => Promise<Response>;

export async function refreshFreshness(
  cache: Freshness,
  { fetch, token, branch = "main" }: { fetch: Fetch; token?: string; branch?: string },
): Promise<Freshness> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "digital-public-administration-lab",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const entries = await Promise.all(
    Object.entries(cache).map(async ([repository, cached]) => {
      try {
        const response = await fetch(
          `https://api.github.com/repos/CristianNichifor/${repository}/commits?sha=${branch}&per_page=1`,
          { headers, signal: AbortSignal.timeout(10_000) },
        );
        if (!response.ok) return [repository, cached];
        const [latest] = (await response.json()) as {
          commit: { committer: { date: string } };
        }[];
        const date = latest?.commit.committer.date.slice(0, 10);
        return [repository, date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : cached];
      } catch {
        return [repository, cached];
      }
    }),
  );
  return Object.fromEntries(entries);
}
