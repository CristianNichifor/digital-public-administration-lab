# Cristian Nichifor — project catalogue

Bilingual project catalogue with Coda Packs, tools, civic projects and experiments. Existing civic application paths remain stable.

Target hostname:

```txt
https://projects.cristian-nichifor.com/
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

Runtime path segments retain their existing values independently of repository names. They currently match the upstream build bases; a rename must explicitly preserve or migrate those asset paths.

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
pnpm install --frozen-lockfile
pnpm setup:sibling
pnpm verify   # lint, typecheck, test, build, functions build
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

## Bilingual presentation pages

`src/catalogue-content.json` supplies editorial content keyed by the routing registry’s stable IDs. `src/catalogue.ts` resolves explicit English and Romanian paths and reciprocal language links. `src/prerender.tsx` renders 30 complete HTML pages plus canonical/alternate metadata and sitemap; browsing and contact links work without JavaScript.

| Collection | English | Romanian |
| --- | --- | --- |
| Coda Packs | `/coda-packs/` | `/ro/pachete-coda/` |
| Tools | `/tools/` | `/ro/instrumente/` |
| Civic projects | `/civic/` | `/ro/proiecte-civice/` |
| Experiments | `/experiments/` | `/ro/experimente/` |

Presentation routes do not translate application paths. Google Contacts is labelled beta and links to source until a public installation is verified. USR is explicitly unofficial and synthetic. Lifecycle labels do not certify production readiness.

See [domain rollout](docs/domain-rollout.md) for release order, repository naming, compatibility gates and rollback. The full personal website links to selected examples; this catalogue owns project setup and status.
