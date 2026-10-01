import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequest } from './_middleware';

afterEach(() => vi.unstubAllGlobals());
const host = 'https://digital.example';

describe('Pages proxy boundary', () => {
  it.each(['/', '/assets/app.js', '/bureaucracy-as-code/', '/civic-ui', '/legislativul'])('passes %s to static serving', async (path) => {
    const response = new Response('static', { status: 404 });
    const next = vi.fn().mockResolvedValue(response);
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    expect(await onRequest({ request: new Request(host + path), next })).toBe(response);
    expect(next).toHaveBeenCalledOnce(); expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['POST', 'PUT', 'DELETE', 'OPTIONS'])('rejects %s without contacting upstream', async (method) => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const response = await onRequest({ request: new Request(host + '/legislativ/', { method }), next: vi.fn() });
    expect(response.status).toBe(405); expect(response.headers.get('allow')).toBe('GET, HEAD');
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(['GET', 'HEAD'])('forwards %s queries and allowed headers without credentials', async (method) => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 304, headers: { 'set-cookie': 'secret=yes', etag: 'v1' } }));
    vi.stubGlobal('fetch', fetch);
    const response = await onRequest({ request: new Request(host + '/legislativ/assets/a.js?q=1', {
      method, headers: { cookie: 'session=private', authorization: 'Bearer private', accept: 'text/plain', range: 'bytes=0-9', 'if-none-match': 'v1' },
    }), next: vi.fn() });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe('https://cristiannichifor.github.io/legislativ/assets/a.js?q=1');
    expect(init.method).toBe(method); expect(init.redirect).toBe('manual');
    expect(init.headers.get('cookie')).toBeNull(); expect(init.headers.get('authorization')).toBeNull();
    expect(init.headers.get('accept')).toBe('text/plain'); expect(init.headers.get('range')).toBe('bytes=0-9');
    expect(init.headers.get('if-none-match')).toBe('v1');
    expect(response.status).toBe(304); expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('etag')).toBe('v1');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });
  it.each([
    ['/legislativ/?q=1#top', host + '/legislativ/?q=1#top'],
    ['https://elsewhere.example/path', 'https://elsewhere.example/path'],
    ['/other-project/', '/other-project/'],
  ])('handles redirect %s without crossing a project boundary', async (location, expected) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 301, headers: { location } })));
    const response = await onRequest({ request: new Request(host + '/legislativ'), next: vi.fn() });
    expect(response.status).toBe(301); expect(response.headers.get('location')).toBe(expected);
  });
  it('preserves upstream failures instead of presenting a successful shell', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })));
    const response = await onRequest({ request: new Request(host + '/legislativ/missing'), next: vi.fn() });
    expect(response.status).toBe(404); expect(await response.text()).toBe('missing');
  });
});
