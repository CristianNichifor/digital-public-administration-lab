# Digital Public Administration Lab

Parent static host for Romanian civic browser demos under:

```txt
https://digital.cristian-nichifor.com/
```

Temporary Pages URL:

```txt
https://digital-public-administration-lab.pages.dev/
```

## Routes

- `/` - lab index and module overview
- `/bureaucracy-as-code/` - mounted `CristianNichifor/bureaucracy-as-code` v0.1.0 browser demo
- `/atlas` - future Digital Romania Atlas intake
- `/identity` - future DID / credential playground
- `/audit-log` - future signed event-chain explorer

## Build Model

This host mounts `bureaucracy-as-code`; it does not rebuild or copy its source.

The build script:

1. builds the parent lab shell
2. builds the sibling `../bureaucracy-as-code` repo with its mounted base
3. copies that app's `dist/*` into `dist/bureaucracy-as-code/`
4. keeps the parent `_redirects` rule for `/bureaucracy-as-code/*`

Override the source path with:

```bash
BAC_SOURCE_DIR=/path/to/bureaucracy-as-code pnpm build
```

## Local Setup

```bash
pnpm install
pnpm verify
pnpm smoke
pnpm dev
```

## Cloudflare

The Pages project name is `digital-public-administration-lab`.

Required repository secrets:

```txt
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID=432316a05c0d6000c6e196fe32e47dd7
```

Only this parent project should attach `digital.cristian-nichifor.com`.
Do not attach that hostname to `bureaucracy-as-code`; that repo remains the
standalone module source and keeps `https://bureaucracy-as-code.pages.dev/`.

Current state:

- Pages project created
- production deploy works at `https://digital-public-administration-lab.pages.dev/`
- `digital.cristian-nichifor.com` is attached to this Pages project
- DNS still needs an explicit CNAME approval before the custom hostname resolves

## Release Source

The mounted app release is:

- https://github.com/CristianNichifor/bureaucracy-as-code/releases/tag/v0.1.0
