# Validation — 2026-10-01

- Lint and TypeScript: passed.
- Vitest: 36 tests passed across runtime/proxy, localized catalogue and opt-in migration contracts.
- Full build: 30 prerendered catalogue pages plus the pinned Bureaucracy as Code artifact.
- Pages Functions compilation: passed after adding guarded hostname redirects.
- Dist smoke: required mounted assets and legacy aliases present; 30 pages have valid canonical/language metadata and local assets.
- Chromium: homepage and Pack detail in both languages at 390, 768 and 1440 CSS pixels; no horizontal overflow or page errors. Desktop catalogue and mobile Romanian Pack page visually reviewed.
- Pack language links round-trip to the same page; unknown route returns 404 under the local static server; content renders with JavaScript disabled.
- Local preview: http://127.0.0.1:4323/ (temporary review server).
- Production proxy, DNS, TLS, source-app state migration and provider redirects are not validated by a local static server. They remain rollout gates in `domain-rollout.md`.

The hostname migration switch remains unset. No repositories were renamed and no production resources were changed.
