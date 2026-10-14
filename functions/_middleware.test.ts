import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequest } from './_middleware';

afterEach(() => vi.unstubAllGlobals());
const host = 'https://projects.example';

describe('Pages proxy boundary', () => {
  it.each(['/', '/assets/app.js', '/bureaucracy-as-code/', '/civic-ui', '/legislation-linters'])('passes %s to static serving', async (path) => {
    const response = new Response('static', { status: 404 });
    const next = vi.fn().mockResolvedValue(response);
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect(await onRequest({ request: new Request(host + path), next })).toBe(response);
    expect(next).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['POST', 'PUT', 'DELETE', 'OPTIONS'])('rejects %s without contacting upstream', async (method) => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const response = await onRequest({ request: new Request(host + '/legislation-linter/', { method }), next: vi.fn() });
    expect(response.status).toBe(405); expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['GET', 'HEAD'])('forwards %s queries and allowed headers without credentials', async (method) => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 304, headers: { 'set-cookie': 'secret=yes', etag: 'v1' } }));
    vi.stubGlobal('fetch', fetch);
    const response = await onRequest({ request: new Request(host + '/legislation-linter/assets/a.js?q=1', {
      method, headers: { cookie: 'session=private', authorization: 'Bearer private', accept: 'text/plain', range: 'bytes=0-9', 'if-none-match': 'v1' },
    }), next: vi.fn() });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe('https://cristiannichifor.github.io/legislation-linter/assets/a.js?q=1');
    expect(init.method).toBe(method); expect(init.redirect).toBe('manual');
    expect(init.headers.get('cookie')).toBeNull(); expect(init.headers.get('authorization')).toBeNull();
    expect(init.headers.get('accept')).toBe('text/plain'); expect(init.headers.get('range')).toBe('bytes=0-9');
    expect(init.headers.get('if-none-match')).toBe('v1');
    expect(response.status).toBe(304); expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('etag')).toBe('v1');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });
  it.each([
    ['/legislation-linter/?q=1#top', host + '/legislation-linter/?q=1#top'],
    ['https://elsewhere.example/path', 'https://elsewhere.example/path'],
    ['/other-project/', '/other-project/'],
  ])('handles redirect %s without crossing a project boundary', async (location, expected) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 301, headers: { location } })));
    const response = await onRequest({ request: new Request(host + '/legislation-linter'), next: vi.fn() });
    expect(response.status).toBe(301); expect(response.headers.get('location')).toBe(expected);
  });
  it('preserves upstream failures instead of presenting a successful shell', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })));
    const response = await onRequest({ request: new Request(host + '/legislation-linter/missing'), next: vi.fn() });
    expect(response.status).toBe(404); expect(await response.text()).toBe('missing');
  });
});

describe('Preview gate on the dev branch', () => {
  const env = { PREVIEW_GATE_SECRET: 'g'.repeat(64) };
  it.each([undefined, 'wrong', 'g'.repeat(63)])('refuses a request whose gate header is %s', async (value) => {
    const next = vi.fn(); const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const headers = new Headers();
    if (value !== undefined) headers.set('x-cnw-preview-gate', value);
    const response = await onRequest({ request: new Request(host + '/', { headers }), next, env });
    expect(response.status).toBe(403); expect(next).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it('serves the gate', async () => {
    const response = new Response('static');
    const next = vi.fn().mockResolvedValue(response);
    const request = new Request(host + '/', { headers: { 'x-cnw-preview-gate': 'g'.repeat(64) } });
    expect(await onRequest({ request, next, env })).toBe(response);
  });
  it.each(['https://dev.hub-41z.pages.dev', 'https://8bd308ff.hub-41z.pages.dev'])('closes preview host %s while the secret is not set', async (origin) => {
    const next = vi.fn();
    const response = await onRequest({ request: new Request(origin + '/', { headers: { 'x-cnw-preview-gate': 'anything' } }), next, env: {} });
    expect(response.status).toBe(403); expect(next).not.toHaveBeenCalled();
  });
  it('serves the production pages.dev host without the secret', async () => {
    const response = new Response('static');
    const next = vi.fn().mockResolvedValue(response);
    expect(await onRequest({ request: new Request('https://hub-41z.pages.dev/'), next, env: {} })).toBe(response);
  });
  it('checks nothing where the secret is not set (production)', async () => {
    const response = new Response('static');
    const next = vi.fn().mockResolvedValue(response);
    expect(await onRequest({ request: new Request(host + '/'), next, env: {} })).toBe(response);
  });
});

describe('Dev preview proxying', () => {
  const env = { PREVIEW_GATE_SECRET: 'g'.repeat(64) };
  it('forwards to the gated dev build with the gate header, never the visitor\'s cookies', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('ok')); vi.stubGlobal('fetch', fetch);
    const request = new Request('https://projects-dev.example/open-procurement/', {
      headers: { 'x-cnw-preview-gate': 'g'.repeat(64), cookie: '__Host-cnw-preview=s' },
    });
    await onRequest({ request, next: vi.fn(), env });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe('https://dev.open-procurement.pages.dev/open-procurement/');
    expect(init.headers.get('x-cnw-preview-gate')).toBe('g'.repeat(64));
    expect(init.headers.get('cookie')).toBeNull();
  });
  it('sends no gate header to production upstreams', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('ok')); vi.stubGlobal('fetch', fetch);
    await onRequest({ request: new Request(host + '/open-procurement/'), next: vi.fn(), env: {} });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe('https://cristiannichifor.github.io/open-procurement/');
    expect(init.headers.get('x-cnw-preview-gate')).toBeNull();
  });
});
