/**
 * Single source of truth for the civic fleet index and the proxy routing table.
 *
 * The public URL of a project is `/<slug>/`, and `slug` is always the GitHub
 * repository name. That is not cosmetic: every project already builds with a
 * `/<repo>/` base path because it is served as a GitHub Pages project site, so
 * a 1:1 path proxy resolves its assets with no rebuild anywhere.
 *
 * `upstream` is a full base URL, which is what lets an origin move without the
 * public URL changing:
 *   github.io today  -> https://cristiannichifor.github.io/legislativ + /assets/x
 *   pages.dev later  -> https://legislativ.pages.dev                  + /assets/x
 */

export type ProjectKind =
  /** Served from its own origin through the proxy in `functions/_middleware.ts`. */
  | "proxied"
  /** Built into this host's `dist/` at build time; served as a static asset. */
  | "mounted"
  /** Linked out to, not served under this host. */
  | "external";

export interface Project {
  slug: string;
  title: string;
  description: string;
  category: string;
  kind: ProjectKind;
  /** Base URL the proxy forwards to. Required for `proxied`. */
  upstream?: string;
  /** Link target for `external`. */
  href?: string;
}

const GH_PAGES = "https://cristiannichifor.github.io";

/**
 * `public-pay-simulator` and `administrative-reform-simulator` are deliberately
 * absent. Both repos now serve a meta-refresh stub pointing into
 * `romania-reforms/salarizare/` and `romania-reforms/administrativ/`, so
 * proxying them would bounce a visitor straight off this host. Their short
 * paths are 301s in `public/_redirects` instead.
 */

export const projects: Project[] = [
  {
    slug: "romania-reforms",
    title: "Romania Reforms",
    description:
      "Deterministic, explainable simulators for Romanian public-policy reforms — pay, administrative consolidation and more, each at its own path under /romania-reforms/. Instruments for public debate, not calculators of entitlement.",
    category: "Reform simulators",
    kind: "proxied",
    upstream: `${GH_PAGES}/romania-reforms`,
  },
  {
    slug: "achizitii-deschise",
    title: "Achiziții Deschise",
    description:
      "Romanian public procurement as open data: comparable unit prices in OCDS format, queried in the browser over Parquet.",
    category: "Transparency & data",
    kind: "proxied",
    upstream: `${GH_PAGES}/achizitii-deschise`,
  },
  {
    slug: "legislativ",
    title: "Legislativ",
    description:
      "A linter for draft Romanian legislation: unfulfilled statutory deadlines, terminology drift, and candidate contradictions — every finding carrying the article it came from.",
    category: "Transparency & data",
    kind: "proxied",
    upstream: `${GH_PAGES}/legislativ`,
  },
  {
    slug: "bureaucracy-as-code",
    title: "Bureaucracy as Code",
    description:
      "Law 544/2001 requests as signed, trackable, tamper-evident browser state transitions.",
    category: "Digital public administration",
    kind: "mounted",
  },
  {
    slug: "digital-romania-atlas",
    title: "Digital Romania Atlas",
    description:
      "The Romanian digital identity ecosystem (EUDI Wallet) mapped against a proposed digital-backbone design.",
    category: "Digital public administration",
    kind: "proxied",
    upstream: `${GH_PAGES}/digital-romania-atlas`,
  },
  {
    slug: "ro-intel-reform-dataflows",
    title: "Intelligence Reform Data Flows",
    description:
      "Current and target-state information flows between Romanian intelligence, oversight, judicial and civilian institutions.",
    category: "Digital public administration",
    kind: "proxied",
    upstream: `${GH_PAGES}/ro-intel-reform-dataflows`,
  },
  {
    slug: "ro-budget-dashboard",
    title: "Citizen Budget Dashboard",
    description:
      "Romania's consolidated budget for citizens, over the transparenta.eu data. No public deployment yet — source only.",
    category: "Transparency & data",
    kind: "external",
    href: "https://github.com/CristianNichifor/ro-budget-dashboard",
  },
  {
    slug: "civic-ui",
    title: "Civic UI",
    description:
      "The shared React component layer behind these projects. A library, not a civic surface, so it is linked rather than hosted here.",
    category: "Shared tooling",
    kind: "external",
    href: `${GH_PAGES}/civic-ui/`,
  },
];

export const categories: string[] = [
  "Reform simulators",
  "Transparency & data",
  "Digital public administration",
  "Shared tooling",
];

export interface ProxyMatch {
  project: Project;
  /** Absolute URL on the upstream origin, without query string. */
  upstreamUrl: string;
}

/**
 * Resolves a request path to its upstream, or `null` when this host should
 * serve the path itself (the index, its assets, and anything mounted at build
 * time such as `/bureaucracy-as-code/`).
 */
export function matchProxyRoute(pathname: string): ProxyMatch | null {
  for (const project of projects) {
    if (project.kind !== "proxied" || !project.upstream) {
      continue;
    }

    const prefix = `/${project.slug}`;

    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) {
      continue;
    }

    const rest = pathname.slice(prefix.length);

    return { project, upstreamUrl: `${project.upstream}${rest}` };
  }

  return null;
}

/**
 * Maps an upstream redirect target back onto this host, so a `/legislativ` ->
 * `/legislativ/` normalisation from GitHub Pages does not walk the visitor off
 * onto the upstream origin.
 *
 * Returns `null` when the target leaves the upstream base entirely, in which
 * case the caller should pass the original `Location` through untouched.
 */
export function rewriteLocation(location: string, match: ProxyMatch, requestUrl: URL): string | null {
  const upstreamBase = new URL(match.project.upstream ?? "");
  const resolved = new URL(location, match.upstreamUrl);

  if (resolved.origin !== upstreamBase.origin) {
    return null;
  }

  // "" for an origin-rooted upstream (`https://legislativ.pages.dev`),
  // "/legislativ" for a GitHub Pages project site.
  const base = upstreamBase.pathname.replace(/\/$/, "");

  if (base !== "" && resolved.pathname !== base && !resolved.pathname.startsWith(`${base}/`)) {
    return null;
  }

  const rest = resolved.pathname.slice(base.length);

  return `${requestUrl.origin}/${match.project.slug}${rest}${resolved.search}${resolved.hash}`;
}
