/**
 * Headers every response on this host carries: static files through `public/_headers`, proxied
 * and function responses through `functions/_middleware.ts`. None of them can break an app.
 */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-Frame-Options": "SAMEORIGIN",
};

/**
 * CSP for the catalogue pages this repo renders, and only those: proxied and mounted apps have
 * their own needs (DuckDB-Wasm from jsdelivr, Pyodide's `'unsafe-eval'`). `script-src 'self'`
 * covers Cloudflare's email-decode script, which it serves from this origin under `/cdn-cgi/`.
 */
export const catalogueCsp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** `_headers` rules giving each catalogue page path the catalogue CSP. Paths match exactly. */
export function catalogueHeaderRules(paths: string[]): string {
  return paths
    .map((path) => `\n${path}\n  Content-Security-Policy: ${catalogueCsp}\n`)
    .join("");
}
