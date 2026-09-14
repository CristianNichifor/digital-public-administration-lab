import { describe, expect, it } from "vitest";
import {
  categories,
  matchProxyRoute,
  projects,
  rewriteLocation,
  type ProxyMatch,
} from "./projects";

const HOST = new URL("https://proiecte.cristian-nichifor.com/legislativ");

describe("matchProxyRoute", () => {
  it("leaves the index and its own assets to static serving", () => {
    expect(matchProxyRoute("/")).toBeNull();
    expect(matchProxyRoute("/assets/index-abc123.js")).toBeNull();
  });

  it("does not proxy a build-time mounted project", () => {
    // bureaucracy-as-code is copied into dist/ by the build. Proxying it would
    // fetch an origin that does not serve it at this path.
    expect(matchProxyRoute("/bureaucracy-as-code/")).toBeNull();
    expect(matchProxyRoute("/bureaucracy-as-code/assets/index.js")).toBeNull();
  });

  it("does not proxy a project that is only linked out to", () => {
    expect(matchProxyRoute("/civic-ui")).toBeNull();
  });

  it("maps a proxied project 1:1 onto its upstream base", () => {
    expect(matchProxyRoute("/legislativ")?.upstreamUrl).toBe(
      "https://cristiannichifor.github.io/legislativ",
    );
    expect(matchProxyRoute("/legislativ/")?.upstreamUrl).toBe(
      "https://cristiannichifor.github.io/legislativ/",
    );
    expect(matchProxyRoute("/legislativ/assets/app.js")?.upstreamUrl).toBe(
      "https://cristiannichifor.github.io/legislativ/assets/app.js",
    );
  });

  it("matches on a whole path segment, not a string prefix", () => {
    expect(matchProxyRoute("/legislativul-romaniei")).toBeNull();
  });

  it("does not proxy the simulator repos that now serve redirect stubs", () => {
    // Both meta-refresh to romania-reforms on github.io; proxying them would
    // walk the visitor off this host. `_redirects` handles their short paths.
    expect(matchProxyRoute("/public-pay-simulator")).toBeNull();
    expect(matchProxyRoute("/administrative-reform-simulator")).toBeNull();
  });

  it("gives every project a category the index renders", () => {
    for (const project of projects) {
      expect(categories).toContain(project.category);
    }
  });

  it("gives every proxied project an upstream", () => {
    for (const project of projects) {
      if (project.kind === "proxied") {
        expect(project.upstream).toMatch(/^https:\/\//);
      }
    }
  });
});

describe("rewriteLocation", () => {
  it("keeps a GitHub Pages trailing-slash redirect on this host", () => {
    const match = matchProxyRoute("/legislativ");

    expect(match).not.toBeNull();
    expect(rewriteLocation("/legislativ/", match as ProxyMatch, HOST)).toBe(
      "https://proiecte.cristian-nichifor.com/legislativ/",
    );
  });

  it("re-prefixes the slug when the upstream is origin-rooted", () => {
    // The shape an upstream takes once a project moves to its own Pages
    // project: the public path stays /legislativ/, the origin serves it at /.
    const match: ProxyMatch = {
      project: {
        slug: "legislativ",
        title: "Legislativ",
        description: "",
        category: "Transparency & data",
        kind: "proxied",
        upstream: "https://legislativ.pages.dev",
      },
      upstreamUrl: "https://legislativ.pages.dev/acte",
    };

    expect(rewriteLocation("/acte/", match, HOST)).toBe(
      "https://proiecte.cristian-nichifor.com/legislativ/acte/",
    );
  });

  it("passes through a redirect that leaves the upstream origin", () => {
    const match = matchProxyRoute("/legislativ");

    expect(rewriteLocation("https://example.org/x", match as ProxyMatch, HOST)).toBeNull();
  });

  it("preserves query and fragment", () => {
    const match = matchProxyRoute("/legislativ");

    expect(rewriteLocation("/legislativ/?q=1#top", match as ProxyMatch, HOST)).toBe(
      "https://proiecte.cristian-nichifor.com/legislativ/?q=1#top",
    );
  });
});
