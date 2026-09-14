# Civic projects host

Single public host for the Romanian civic fleet. Every project is a path on one
origin rather than a subdomain of its own.

Target hostname:

```txt
https://proiecte.cristian-nichifor.com/
```

Currently serving at:

```txt
https://digital.cristian-nichifor.com/
https://digital-public-administration-lab.pages.dev/
```

## Routes

| Path | Served by |
| --- | --- |
| `/` | generated index of the fleet |
| `/bureaucracy-as-code/` | built into this host at build time |
| `/romania-reforms/` | proxied to its own origin |
| `/legislativ/` | proxied |
| `/achizitii-deschise/` | proxied |
| `/digital-romania-atlas/` | proxied |
| `/ro-intel-reform-dataflows/` | proxied |
| `/salarizare`, `/administrativ` | 301 into `/romania-reforms/` |

The path segment is always the GitHub repository name. That is load-bearing:
each project already builds with a `/<repo>/` base because it is served as a
GitHub Pages project site, so a 1:1 proxy resolves its assets with no rebuild in
any of those repos.

`public-pay-simulator` and `administrative-reform-simulator` are not proxied.
Both repos now serve a meta-refresh stub into `romania-reforms`, so proxying
them would bounce a visitor off this host; their short paths are redirects.

## Host model

This host owns the public URL and nothing else. Each project stays authoritative
in its own repository and deploys on its own cadence.

- **Routing table:** `src/projects.ts`, shared by the index page and the proxy.
- **Proxy:** `functions/_middleware.ts`. Non-matching paths fall through to
  static assets via `next()`.
- **Mounting:** `scripts/mount-bureaucracy-as-code.mjs` copies a sibling repo's
  `dist/` into `dist/bureaucracy-as-code/` at build time.

Moving a project to a different origin — GitHub Pages today, its own Pages
project later — changes one `upstream` value and no public URL. `upstream` is a
full base URL, so both shapes work:

```txt
https://cristiannichifor.github.io/legislativ   ->  /legislativ/assets/x
https://legislativ.pages.dev                    ->  /legislativ/assets/x
```

Two consequences worth stating plainly:

- **Shared origin.** Everything here shares one browser origin, so the storage
  isolation separate subdomains gave `/bureaucracy-as-code/` no longer applies.
  Its keys are demo keys.
- **Shared failure.** The proxy is one hop in front of every project. If it is
  down, all of them are.

## Build model

```bash
pnpm install
BAC_SOURCE_DIR=../bureaucracy-as-code pnpm verify   # lint, typecheck, test, build, functions build
pnpm smoke
pnpm dev
```

`pnpm verify` ends with `wrangler pages functions build`, which is what catches a
broken `functions/` bundle in CI rather than at deploy time.

To exercise the proxy locally, the Vite dev server is not enough — it does not
run Pages Functions:

```bash
pnpm build && pnpm exec wrangler pages dev dist
```

## Cloudflare

Pages project: `digital-public-administration-lab`, on the CN Webify account.

Required repository secrets:

```txt
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID=432316a05c0d6000c6e196fe32e47dd7
```

### Not applied by this repo

The hostname cutover is deliberately left as an operator step:

1. Attach `proiecte.cristian-nichifor.com` to this Pages project.
2. Add a zone redirect `digital.cristian-nichifor.com/*` ->
   `proiecte.cristian-nichifor.com/:splat` (301).
3. Update `homepage` in `package.json` once the hostname resolves — not before,
   or it becomes a published 404.

`date.cristian-nichifor.com` stays a subdomain. It is an R2 custom domain
serving dataset readers, not a browser app, and does not belong behind this
proxy.
