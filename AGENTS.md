# digital-public-administration-lab

Digital Public Administration Lab host for Romanian civic browser demos

## Commands

| Task | Command |
|---|---|
| install | `pnpm install --frozen-lockfile` |
| lint | `pnpm run lint` |
| typecheck | `pnpm run typecheck` |
| build | `pnpm run build` |
| test | `pnpm run test` |

## How this repo is gated

- `dev` is the default branch. Correctness CI exposes `verify`; remote required-check settings are managed separately.
- `main` is production. Agents must never merge any PR or deploy, regardless of credential permissions.
- This repo ships Cloudflare (Workers or Pages) via wrangler. That fires on a merge to `main`, which is the restricted branch — so an agent's work reaching `dev` deploys nothing.

## Working rules

- Branch from `dev` with an approved prefix: `feat/`, `fix/`, `chore/`, `docs/`,
  `sec/`, `adr/`. Land back into `dev` through a pull request.
- Conventional Commits. Imperative subject, lower case, no trailing full stop,
  72 characters hard limit. The body explains *why*; the diff already shows what.
- Never modify vendored third-party sources. Fix the environment instead.
- Local setup and correctness tests are credential-free. Publishing credentials are maintainer-only.
- Verify before claiming completion. A merged pull request is not a deployment,
  and a git tag is not a publication.

See CONTRIBUTING.md for self-contained setup and acceptance evidence.

## Contribution workflow

Use Node 22 (Node 24 for the host) and the package manager in package.json.
Local verification needs no credentials, private handbook, or 1Password.
Credentials are only for maintainer-operated publishing; never store them in source.
Agents must never merge pull requests (including into dev) or deploy.
Open scoped Conventional Commit PRs against dev. State acceptance criteria in the
issue/PR, explain the source or fixture behind the change, and include exact
verification commands/results and remaining limitations.

Maintainers: fetch origin, then `wt new chore/my-change origin/dev`; worktrees
belong at `<repo>/.worktrees/<name>`. Contributors without wt can use a separate
clone and `git switch -c chore/my-change origin/dev`. Preserve existing user work.
Generated dist/, node_modules/, browser reports and build metadata are not source.
Keep the project license and attribution when adapting source material.

## Host invariants

Run `pnpm setup:sibling` before `pnpm verify && pnpm smoke`. The sibling must
match bureaucracy-as-code.sha and be clean. Keep source edits in this host;
never patch the cached sibling. Read CONTRIBUTING.md for routing boundaries.
Test middleware request/response behavior as well as projects.ts URL helpers.
