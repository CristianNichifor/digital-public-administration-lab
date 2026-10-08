# Cristian Nichifor — project catalogue

Bilingual project catalogue with Coda Packs, tools, civic projects and experiments, and the hub that serves the civic apps without an origin of their own.

Hostname (English at `/`, Romanian at `/ro/`):

```txt
https://projects.cristian-nichifor.com/
```

`digital.cristian-nichifor.com` and the Core account's
`digital-public-administration-lab.pages.dev` retire at the cut-over to the
CN Webify Customers account; neither gets an alias or a redirect.

## Routes

| Path | Served by |
| --- | --- |
| `/` | generated index of the fleet |
| `/bureaucracy-as-code/` | built into this host at build time |
| `/romania-reforms/` | proxied to its own origin |
| `/legislation-linter/` | proxied |
| `/legislation-linter/api/*` | Worker `legislation-linter-rewrite` (a Workers route, which runs before this project) |
| `/open-procurement/` | proxied |
| `/digital-romania-atlas/` | proxied |
| `/romania-intelligence-reform-dataflows/` | proxied |

Runtime paths are the English repository names, which are also the upstream
GitHub Pages build bases, so the proxy maps them 1:1. The budget dashboard has
its own origin, `https://budget.cristian-nichifor.com/`, and is linked, not
proxied; its catalogue entry carries the dashboard and API links that the
retired `tablou` page used to list.

`public-pay-simulator` and `administrative-reform-simulator` are not proxied.
Both repos serve a meta-refresh stub into `romania-reforms` (`/public-pay/`,
`/administrative-reform/`), so proxying them would bounce a visitor off this
host. The host serves no redirects or short-path aliases.

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
https://cristiannichifor.github.io/legislation-linter  ->  /legislation-linter/assets/x
https://legislation-linter.pages.dev                   ->  /legislation-linter/assets/x
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

Pages project: `digital-public-administration-lab`, on the **CN Webify
Customers** account. Create it once:

```bash
wrangler pages project create digital-public-administration-lab --production-branch main
```

Required repository secrets (a Customers account token with *Cloudflare Pages
Write*):

```txt
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID=5d5a0c8a05e5d8292065cd0c0cf60291
```

The plain `pages.dev` name stays with the old account until it is deleted, so
the project's `pages.dev` host carries a random suffix; nobody links to it.
Terraform in `cnw-infrastructure` binds `projects.cristian-nichifor.com` and
the Workers routes in front of it; this repo binds no hostname. Update
`homepage` in `package.json` once `projects.` answers, not before.

`data.cristian-nichifor.com` is its own host: an R2 custom domain serving
dataset readers, not a browser app, so it does not belong behind this proxy.

## Bilingual presentation pages

`src/catalogue-content.json` supplies editorial content keyed by the routing registry’s stable IDs. `src/catalogue.ts` resolves explicit English and Romanian paths and reciprocal language links. `src/prerender.tsx` renders 30 complete HTML pages plus canonical/alternate metadata and sitemap; browsing and contact links work without JavaScript.

| Collection | English | Romanian |
| --- | --- | --- |
| Coda Packs | `/coda-packs/` | `/ro/pachete-coda/` |
| Tools | `/tools/` | `/ro/instrumente/` |
| Civic projects | `/civic/` | `/ro/proiecte-civice/` |
| Experiments | `/experiments/` | `/ro/experimente/` |

Presentation routes do not translate application paths. Google Contacts is labelled beta and links to source until a public installation is verified. USR is explicitly unofficial and synthetic. Lifecycle labels do not certify production readiness.

See [domain rollout](docs/domain-rollout.md) for release order, repository names and rollback. The full personal website links to selected examples; this catalogue owns project setup and status.
