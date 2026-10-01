# Canonical project host rollout

This branch implements the catalogue. Domain changes, redirects and repository renames remain ordered release operations; nothing in the build changes DNS.

## Baseline — 2026-10-01

- Existing Pages project: `digital-public-administration-lab`, production branch `main`.
- Existing domains: `digital-public-administration-lab.pages.dev`, `digital.cristian-nichifor.com`.
- Current production deployment: `27076b2c-040b-4c87-b1d2-53846454acba`, recorded source `6ac4510354c99e3723abe749a8a41594aea6b351`, dirty flag set. This is not reproducible release evidence; preserve the deployment as the operational rollback target.
- `projects` and `proiecte` have no DNS records or Pages bindings in the observed account.
- The personal domain is explicitly excluded from CN Webify’s Terraform DNS workspace. Do not add its records there or change mail records as part of this rollout.
- Remote development is ahead of `main`. This PR builds on `dev`; do not retire it or bypass its unmerged work during this release.

## Release order

1. Review and merge the catalogue PR into `dev`, then prepare the normal promotion to `main`. Agents do not merge either PR. Record a clean release SHA and passing checks.
2. Deploy a preview built from that SHA; validate the 30 prerendered pages, existing runtime paths, mounted app, direct deep links, query/hash scenarios and exports. Preview pages must be noindex.
3. Attach `projects.cristian-nichifor.com` to the existing Pages project, then create its proxied CNAME to `digital-public-administration-lab.pages.dev` through the personal zone’s reviewed configuration. Recheck availability and TLS before either operation. Verify on the new hostname before adding redirects.
4. Audit browser storage and service workers in the existing applications. Offer scenario export/import or retain a recovery entry before moving users between origins. Do not blanket-redirect `digital` before this gate.
5. Attach `proiecte` only with explicit root → `/ro/` and translated catalogue mappings. Runtime paths retain their existing names. The middleware implements both aliases behind `CANONICAL_REDIRECTS_ENABLED=true`; leave it unset until the recovery gate passes. Enabling it redirects only known catalogue and runtime routes, not arbitrary unknown paths. Preserve queries and browser fragments; verify fragment behavior in a browser.
6. Update package homepage, source documentation and sibling directories after the canonical host works. Do not publish a canonical-host success claim from a local build.
7. Run the repository rename migration only after these checks. Keep custom-host runtime paths stable and capture old GitHub Pages link disposition. GitHub does not automatically redirect project-site URLs after repository renames.

## Repository naming migration

| Current | Planned | Stable runtime path |
| --- | --- | --- |
| `legislativ` | `legislative-linter` | `/legislativ/` |
| `achizitii-deschise` | `open-procurement` | `/achizitii-deschise/` |
| `tablou` | `dashboard-directory` | Existing hostname until directory consolidation |
| `Google-Contacts-Coda-Pack` | `google-contacts-coda-pack` | No Pack runtime hosted here |

Before each rename inspect target-name availability, Pages build base, upstream assets, reusable actions, provider bindings and local worktrees. Update the `repository` field in `src/catalogue-content.json` only once the rename succeeds; public `slug` values in `src/projects.ts` are independent. Changing an upstream path alone does not rewrite absolute asset URLs in its HTML. Preserve Pack IDs and package names. Do not reuse old repository names.

## Rollback

Before cutover export the affected DNS/bindings and record their IDs. Keep the current deployment available. For catalogue regressions restore the prior Pages deployment; for new-domain failure keep `digital` serving without redirects. Cached permanent redirects mean the new destination must remain available even after rollback. Do not delete it as the first recovery action. No dataset, API or budget hostname changes are required.

## Acceptance record

Record release SHA, preview URL, production deployment ID, final domain bindings, route/asset/API/data/browser checks, storage recovery disposition, and the retained rollback deployment. A homepage 200 is not acceptance for proxied apps.
