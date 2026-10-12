# Contributing to the civic host

Use Node 24 and pnpm 10.15.1. No credentials or private handbook are required:

```sh
pnpm install --frozen-lockfile
pnpm setup:sibling
pnpm verify
pnpm smoke
```

`bureaucracy-as-code.sha` pins the public sibling used by both CI and deployment.
Setup fetches that commit into ignored `.cache/bureaucracy-as-code`; it never resets
an existing checkout. To change the pin, review the sibling diff, move the cache
aside, rerun setup and verify the mounted build. `BAC_SOURCE_DIR` may point at a
separate clean checkout at exactly that SHA. Do not edit generated dist/ files.

`src/projects.ts` owns the index and proxy routing table. Paths match whole
segments; mounted/external projects must not proxy. `functions/_middleware.ts`
allows GET/HEAD only, strips cookies and credentials, preserves queries and
upstream status, rewrites in-base redirects and applies security headers.
`public/_redirects` owns legacy 301s; unknown paths must retain genuine 404s.
Tests mock fetch: local verification never contacts live civic upstreams.

The Vite server serves the shell only. `pnpm build:functions` checks the worker
bundle; `pnpm exec wrangler pages dev dist` runs Pages Functions locally.

Target dev with scoped Conventional Commits. Agents never merge PRs or deploy.
Use `wt new chore/my-change origin/dev` in `<repo>/.worktrees/`; without wt, use a
separate clone and topic branch from origin/dev. Describe acceptance criteria,
routing cases, pin provenance and actual test evidence in the issue/PR.
Publishing credentials are maintainer-only; production runs separately on main.
