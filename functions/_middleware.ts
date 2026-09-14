import { matchProxyRoute, rewriteLocation } from "../src/projects";

/**
 * Minimal shape of the Cloudflare Pages Functions context. Declared locally so
 * this repo does not take a dependency on `@cloudflare/workers-types` for one
 * file; `next()` hands the request back to static asset serving.
 */
interface PagesContext {
  request: Request;
  next: () => Promise<Response>;
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
  const url = new URL(context.request.url);
  const match = matchProxyRoute(url.pathname);

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

  const upstreamResponse = await fetch(upstreamUrl, {
    method: context.request.method,
    headers,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);

  responseHeaders.delete("set-cookie");

  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    responseHeaders.set(name, value);
  }

  // GitHub Pages 301s `/legislativ` to `/legislativ/`. Left alone, that would
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

