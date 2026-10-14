# Production readiness: projects.cristian-nichifor.com

Every app on the fleet is served through this host, so changes to
`functions/_middleware.ts` stay conservative: strict policies apply to the
catalogue pages this repo renders, and proxied apps only receive headers that
cannot break their own runtime needs.

Status values: `todo`, `done`, `blocked`, `needs-human`.

## Theme A: legal and identity

### DPAL-1 Privacy page and imprint (`todo`)

- Given a built `dist/`, when `/privacy/` and `/ro/confidentialitate/` are
  requested, then each is a prerendered page in its language with an imprint
  (operator Cristian Nichifor, contact through this repository's GitHub issues),
  the processors the host actually uses (Cloudflare Pages hosting, Cloudflare
  Network Error Logging, Cloudflare email address obfuscation) and the
  statement that the catalogue sets no cookies and runs no analytics.
- Given any prerendered page, when it renders, then its footer links to the
  privacy page of its own language; the static `404.html` links to both.
- Given the two privacy pages, then they are reciprocal language alternates,
  are listed in the sitemap and never match a proxy route.
- Tests: `src/catalogue.test.ts` (routes, reciprocity, footer link in rendered
  markup), `scripts/smoke-dist.mjs` (every sitemap page links to its privacy
  page; 404 links to both), `scripts/verify-catalogue.mjs` (route count).
- The Romanian text is written by the agent: needs human review.

### DPAL-3 Favicon, Open Graph image and Twitter tags (`todo`)

- Given any prerendered page, then it links `/favicon.svg` as its icon, carries
  `og:image` (absolute URL to a 1200x630 PNG in `dist/`), `og:site_name`,
  `og:locale`, and `twitter:card=summary_large_image`, `twitter:title`,
  `twitter:description`, `twitter:image`.
- Tests: `scripts/smoke-dist.mjs` asserts each tag once per sitemap page and
  that the referenced files exist in `dist/`.

### DPAL-6 Package homepage (`todo`)

- Given `package.json`, then `homepage` is `https://projects.cristian-nichifor.com/`,
  the catalogue origin plus a trailing slash.
- Test: `src/catalogue.test.ts`.

## Theme B: hub correctness

### DPAL-2 Stale routing comment and live path check (`todo`)

- Given `src/projects.ts`, then the comment on the absent simulator repos
  describes what those repos publish today (a redirect stub into
  `/romania-reforms/public-pay/` and `/romania-reforms/administrative-reform/`)
  and the module header no longer says upstreams are GitHub Pages builds.
- Given `node scripts/check-live-paths.mjs`, when run against production, then
  it requests `/`, `/ro/`, every proxied and mounted project root and the
  `/romania-reforms/{salarizare,administrativ,public-pay,administrative-reform}/`
  paths, prints the status of each, and exits 0 unless `--strict` is passed.
  It is not a PR gate and is not run in CI.
- Test: `src/live-paths.test.ts` covers the path list.

### DPAL-4 Canonical Link header on proxied HTML (`todo`)

- Given a proxied request whose upstream answers 200 with `text/html`, then the
  response carries `Link: <https://projects.cristian-nichifor.com{path}>; rel="canonical"`,
  appended to any upstream `Link` value; non-HTML and non-200 responses are untouched.
- Test: `functions/_middleware.test.ts`.

### DPAL-5 Security headers (`todo`)

- Given a catalogue page (every sitemap path), then `dist/_headers` gives it a
  strict `Content-Security-Policy` (`default-src 'self'`, scripts from `'self'`
  only, which covers Cloudflare's same-origin email-decode script,
  `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`).
- Given any static or proxied response, then it carries `X-Frame-Options:
  SAMEORIGIN`, `X-Content-Type-Options: nosniff` and `Referrer-Policy`, and
  proxied responses receive no `Content-Security-Policy` from the host, because
  the apps have their own needs (DuckDB-Wasm from jsdelivr, Pyodide's
  `'unsafe-eval'`).
- Tests: `src/security-headers.test.ts` (policy and rules), `functions/_middleware.test.ts`
  (proxied responses), `scripts/smoke-dist.mjs` (every sitemap path has a CSP rule).

## Theme C: dependencies

### DPAL-8 Dependency majors (`todo`)

- Given the open Dependabot bumps (eslint 10, lucide-react 1.x, typescript-eslint,
  eslint-plugin-react-refresh, wrangler), when applied together, then
  `pnpm verify && pnpm smoke` is green.
- Test: the full verify gate.

## Maintainer-only

- DPAL-7 uptime probe workflow: `needs-human` (workflow changes; diff in the PR body).
- DPAL-10 decoupling from the CN Webify preview broker: `needs-human`, user
  decision pending; nothing done.
