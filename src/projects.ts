/** Runtime routing registry. Slugs are the public paths and match the English repository names, so each GitHub Pages build base proxies 1:1. */

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
 * `romania-reforms/public-pay/` and `romania-reforms/administrative-reform/`,
 * so proxying them would bounce a visitor straight off this host. Visitors
 * reach both simulators through `/romania-reforms/`.
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
    slug: "open-procurement",
    title: "Open Procurement",
    description:
      "Romanian public procurement as open data: comparable unit prices in OCDS format, queried in the browser over Parquet.",
    category: "Transparency & data",
    kind: "proxied",
    upstream: `${GH_PAGES}/open-procurement`,
  },
  {
    slug: "legislation-linter",
    title: "Legislation Linter",
    description:
      "A linter for draft Romanian legislation: unfulfilled statutory deadlines, terminology drift, and candidate contradictions — every finding carrying the article it came from.",
    category: "Transparency & data",
    kind: "proxied",
    upstream: `${GH_PAGES}/legislation-linter`,
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
    slug: "romania-intelligence-reform-dataflows",
    title: "Intelligence Reform Data Flows",
    description:
      "Current and target-state information flows between Romanian intelligence, oversight, judicial and civilian institutions.",
    category: "Digital public administration",
    kind: "proxied",
    upstream: `${GH_PAGES}/romania-intelligence-reform-dataflows`,
  },
  {
    slug: "romania-budget-dashboard",
    title: "Citizen Budget Dashboard",
    description:
      "Romania's consolidated budget for citizens, over the transparenta.eu data. Explore public spending with source and year context.",
    category: "Transparency & data",
    kind: "external",
    href: "https://budget.cristian-nichifor.com/",
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
  {
    slug: "google-contacts",
    title: "Google Contacts for Coda",
    description: "A beta integration for managing contacts in Coda.",
    category: "Coda Packs",
    kind: "external",
    href: "https://github.com/CristianNichifor/Google-Contacts-Coda-Pack",
  },
  {
    slug: "usr-digital-platform-wireframe",
    title: "USR platform prototype",
    description: "An unofficial, synthetic membership-platform exploration.",
    category: "Experiments",
    kind: "external",
    href: `${GH_PAGES}/usr-digital-platform-wireframe/`,
  },
];

export const categories: string[] = [
  "Coda Packs",
  "Experiments",
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
 * Maps an upstream redirect target back onto this host, so a `/legislation-linter` ->
 * `/legislation-linter/` normalisation from GitHub Pages does not walk the visitor off
 * onto the upstream origin.
 *
 * Returns `null` when the target leaves the upstream base entirely, in which
 * case the caller should pass the original `Location` through untouched.
 */
export function rewriteLocation(
  location: string,
  match: ProxyMatch,
  requestUrl: URL,
): string | null {
  const upstreamBase = new URL(match.project.upstream ?? "");
  const resolved = new URL(location, match.upstreamUrl);

  if (resolved.origin !== upstreamBase.origin) {
    return null;
  }

  // "" for an origin-rooted upstream (`https://legislation-linter.pages.dev`),
  // "/legislation-linter" for a GitHub Pages project site.
  const base = upstreamBase.pathname.replace(/\/$/, "");

  if (
    base !== "" &&
    resolved.pathname !== base &&
    !resolved.pathname.startsWith(`${base}/`)
  ) {
    return null;
  }

  const rest = resolved.pathname.slice(base.length);

  return `${requestUrl.origin}/${match.project.slug}${rest}${resolved.search}${resolved.hash}`;
}
