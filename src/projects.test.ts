import { describe, expect, it } from "vitest";
import {
  categories,
  matchProxyRoute,
  projects,
  rewriteLocation,
  type ProxyMatch,
} from "./projects";

const HOST = new URL("https://projects.cristian-nichifor.com/legislation-linter");

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
    expect(matchProxyRoute("/legislation-linter")?.upstreamUrl).toBe(
      "https://cristiannichifor.github.io/legislation-linter",
    );
    expect(matchProxyRoute("/legislation-linter/")?.upstreamUrl).toBe(
      "https://cristiannichifor.github.io/legislation-linter/",
    );
    expect(matchProxyRoute("/legislation-linter/assets/app.js")?.upstreamUrl).toBe(
      "https://cristiannichifor.github.io/legislation-linter/assets/app.js",
    );
  });

  it("matches on a whole path segment, not a string prefix", () => {
    expect(matchProxyRoute("/legislation-linter-archive")).toBeNull();
  });

  it("does not proxy the simulator repos that now serve redirect stubs", () => {
    // Both meta-refresh to romania-reforms on github.io; proxying them would
    // walk the visitor off this host. Both are reached through /romania-reforms/.
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
    const match = matchProxyRoute("/legislation-linter");

    expect(match).not.toBeNull();
    expect(rewriteLocation("/legislation-linter/", match as ProxyMatch, HOST)).toBe(
      "https://projects.cristian-nichifor.com/legislation-linter/",
    );
  });

  it("re-prefixes the slug when the upstream is origin-rooted", () => {
    // The shape an upstream takes once a project moves to its own Pages
    // project: the public path stays /legislation-linter/, the origin serves it at /.
    const match: ProxyMatch = {
      project: {
        slug: "legislation-linter",
        title: "Legislation Linter",
        description: "",
        category: "Transparency & data",
        kind: "proxied",
        upstream: "https://legislation-linter.pages.dev",
      },
      upstreamUrl: "https://legislation-linter.pages.dev/acte",
      upstreamBase: "https://legislation-linter.pages.dev",
      gated: false,
    };

    expect(rewriteLocation("/acte/", match, HOST)).toBe(
      "https://projects.cristian-nichifor.com/legislation-linter/acte/",
    );
  });

  it("passes through a redirect that leaves the upstream origin", () => {
    const match = matchProxyRoute("/legislation-linter");

    expect(rewriteLocation("https://example.org/x", match as ProxyMatch, HOST)).toBeNull();
  });

  it("preserves query and fragment", () => {
    const match = matchProxyRoute("/legislation-linter");

    expect(rewriteLocation("/legislation-linter/?q=1#top", match as ProxyMatch, HOST)).toBe(
      "https://projects.cristian-nichifor.com/legislation-linter/?q=1#top",
    );
  });
});

describe("dev preview upstreams", () => {
  it("proxies production to GitHub Pages, ungated", () => {
    const match = matchProxyRoute("/open-procurement/data/x.json");
    expect(match?.upstreamUrl).toBe("https://cristiannichifor.github.io/open-procurement/data/x.json");
    expect(match?.gated).toBe(false);
  });

  it("proxies the dev preview to the project's gated Cloudflare Pages dev build", () => {
    const match = matchProxyRoute("/open-procurement/data/x.json", true);
    expect(match?.upstreamUrl).toBe("https://dev.open-procurement.pages.dev/open-procurement/data/x.json");
    expect(match?.gated).toBe(true);
  });

  it("keeps redirects from the dev build on this host", () => {
    const match = matchProxyRoute("/romania-reforms", true) as ProxyMatch;
    expect(rewriteLocation("https://dev.romania-reforms.pages.dev/romania-reforms/", match, HOST)).toBe(
      "https://projects.cristian-nichifor.com/romania-reforms/",
    );
  });

  it("gives every proxied project a dev build", () => {
    for (const project of projects.filter((p) => p.kind === "proxied")) {
      expect(project.previewUpstream).toBe(`https://dev.${project.slug}.pages.dev/${project.slug}`);
    }
  });
});
