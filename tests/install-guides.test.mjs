import assert from 'node:assert/strict';
import test from 'node:test';
import { checkInstallGuides } from '../scripts/check-install-guides.mjs';

const read = async () => Buffer.from('# Reviewed guide\n');

test('release check validates both clients on CDN and both product hosts in each realm', async () => {
  for (const realm of ['prod', 'staging']) {
    const requests = [];
    const results = await checkInstallGuides(realm, { read, fetchImpl: async (url, options) => {
      requests.push(url);
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers.Accept, 'text/markdown');
      return new Response(await read());
    } });
    assert.equal(requests.length, 6);
    assert.ok(results.every((result) => result.ok));
    for (const url of requests) assert.equal(url.includes('stg-'), realm === 'staging');
    assert.ok(requests.some((url) => url.includes('model-hub.')));
    assert.ok(requests.some((url) => url.includes('product-videos.')));
  }
});

test('stale bytes, HTML/login responses, HTTP failures and network errors fail independently', async () => {
  let request = 0;
  const results = await checkInstallGuides('prod', { read, fetchImpl: async () => {
    switch (request++) {
      case 0: return new Response('# Old guide\n');
      case 1: return new Response('<html>Sign in</html>');
      case 2: return new Response('', { status: 503 });
      case 3: throw new Error('network unavailable');
      default: return new Response(await read());
    }
  } });
  assert.deepEqual(results.map((result) => result.ok), [false, false, false, false, true, true]);
  assert.equal(results[2].error, 'HTTP 503');
  assert.equal(results[3].error, 'network unavailable');
  await assert.rejects(checkInstallGuides('unknown'), /Use --realm/);
});
