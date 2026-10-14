import { matchProxyRoute, rewriteLocation } from "../src/projects";

/**
 * Minimal shape of the Cloudflare Pages Functions context. Declared locally so
 * this repo does not take a dependency on `@cloudflare/workers-types` for one
 * file; `next()` hands the request back to static asset serving.
 */
interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
  env?: { PREVIEW_GATE_SECRET?: string };
}

/**
 * The dev branch is a protected preview: only the CN Webify preview gate, which
 * signs people in first, may fetch it, and it proves that with this header.
 * PREVIEW_GATE_SECRET is set on the Pages preview environment only, so the
 * production build never checks it and the branch alias answers 403 to anyone else.
 * A preview host (`<branch or hash>.<project>.pages.dev`) without the secret also
 * answers 403: previews fail closed until the gate's deploy script has set it.
 */
const isPreviewHost = (hostname: string) => hostname.endsWith(".pages.dev") && hostname.split(".").length > 3;
const PREVIEW_GATE_HEADER = "x-cnw-preview-gate";

async function sameSecret(given: string | null, expected: string): Promise<boolean> {
  if (given === null) return false;
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([given, expected].map((value) => crypto.subtle.digest("SHA-256", encoder.encode(value))));
  const left = new Uint8Array(a);
  const right = new Uint8Array(b);
  let difference = 0;
  for (let i = 0; i < left.length; i += 1) difference |= left[i] ^ right[i];
  return difference === 0;
}

/**
 * Request headers forwarded upstream. An allowlist rather than a blocklist:
 * every project on this host shares one origin, so forwarding `Cookie` would
 * hand this host's cookies to a third-party origin.
 */
const FORWARDED_REQUEST_HEADERS = [
  "accept",
  "accept-language",
  "if-modified-since",
  "if-none-match",
  "range",
  "user-agent",
];

/**
 * `public/_headers` only applies to static assets, so proxied responses would
 * otherwise be the one part of the host without these.
 */
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export async function onRequest(context: PagesContext): Promise<Response> {
  const gate = context.env?.PREVIEW_GATE_SECRET;
  const hostname = new URL(context.request.url).hostname;

  if ((gate || isPreviewHost(hostname)) && !(gate && (await sameSecret(context.request.headers.get(PREVIEW_GATE_HEADER), gate)))) {
    return new Response("Not found", {
      status: 403,
      headers: { "X-Robots-Tag": "noindex, nofollow", ...SECURITY_HEADERS },
    });
  }

  const url = new URL(context.request.url);
  // On the dev preview (the gate secret is set), proxied projects come from their own gated dev builds.
  const match = matchProxyRoute(url.pathname, Boolean(gate));

  if (!match) {
    return context.next();
  }

  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD", ...SECURITY_HEADERS },
    });
  }

  const upstreamUrl = new URL(match.upstreamUrl);
  upstreamUrl.search = url.search;

  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = context.request.headers.get(name);

    if (value !== null) {
      headers.set(name, value);
    }
  }

  if (match.gated && gate) {
    headers.set(PREVIEW_GATE_HEADER, gate);
  }

  const upstreamResponse = await fetch(upstreamUrl, {
    method: context.request.method,
    headers,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);

  responseHeaders.delete("set-cookie");
  if (url.hostname.endsWith(".pages.dev"))
    responseHeaders.set("X-Robots-Tag", "noindex, nofollow");

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    responseHeaders.set(name, value);
  }

  // GitHub Pages 301s `/legislation-linter` to `/legislation-linter/`. Left alone, that would
  // send the visitor off this host and onto the upstream origin.
  const location = responseHeaders.get("location");

  if (location !== null) {
    const rewritten = rewriteLocation(location, match, url);

    if (rewritten !== null) {
      responseHeaders.set("location", rewritten);
    }
  }

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}
