# Canonical project host rollout

The URL design, the move of `cristian-nichifor.com` to the CN Webify
Customers account and its stages live in `cnw-infrastructure`
(`docs/architecture/civic-urls.md`). This page records what it means for this
repository. Nothing in the build changes DNS.

## Decisions (owner, 2026-10-08)

- One hub: `https://projects.cristian-nichifor.com/`, English at `/`,
  Romanian at `/ro/`. `proiecte.` is not created and `digital.` retires.
- No aliases and no redirects: the civic apps are not public, so old
  hostnames, the `/salarizare` and `/administrativ` short paths and the old
  GitHub Pages URLs simply stop.
- English names everywhere. Runtime paths are the renamed repositories and
  their GitHub Pages build bases.
- `tablou` is folded into the budget dashboard's catalogue entry and its
  repository archived.

## Repository names

| Before | Now | Runtime path |
| --- | --- | --- |
| `legislativ` | `legislation-linter` | `/legislation-linter/` |
| `achizitii-deschise` | `open-procurement` | `/open-procurement/` |
| `ro-intel-reform-dataflows` | `romania-intelligence-reform-dataflows` | `/romania-intelligence-reform-dataflows/` |
| `ro-budget-dashboard` | `romania-budget-dashboard` | linked: `https://budget.cristian-nichifor.com/` |
| `tablou` | archived | folded into the budget entry |

GitHub redirects a renamed repository but not its Pages site, so each renamed
project serves under its new base only after it rebuilds there. Check every
proxied path on the new host, not just the index: a homepage 200 is not
acceptance for proxied apps.

## Release order

1. Merge into `dev`, promote to `main`; agents merge neither.
2. Create the Pages project in Customers and set the repository secrets (see
   the README); the `main` deploy publishes to its suffixed `pages.dev` host.
3. The infrastructure move binds `projects.` and the Workers routes, then
   switches the nameservers.
4. After `projects.` answers: set `homepage` in `package.json`.

## Rollback

Until the old account's resources are deleted, its project still serves on its
own `pages.dev` host. Before then, a failed new host is fixed forward or the
nameserver change is reverted; no dataset, API or budget hostname depends on
this repository.
