import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const realms = {
  prod: { labs: 'labs.opus.pro', cdn: 'opus-lab-public.cdn.opus.pro' },
  staging: { labs: 'stg-labs.opus.pro', cdn: 'stg-opus-lab-public.cdn.opus.pro' },
};
const documents = { codex: 'codex-install-protocol.md', claude: 'claude-code-install-protocol.md' };
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');

// Read-only release check: compare public bytes with the reviewed source,
// including each product reader, without authentication or media generation.
export async function checkInstallGuides(realm, { fetchImpl = fetch, read = readFile } = {}) {
  const target = realms[realm];
  if (!target) throw new Error('Use --realm prod or --realm staging');
  const results = [];
  for (const [client, file] of Object.entries(documents)) {
    const expected = digest(await read(new URL(`../docs/${file}`, import.meta.url)));
    const urls = [
      `https://${target.cdn}/opus-video-tools/guides/${client}.md`,
      `https://model-hub.${target.labs}/${client}?format=markdown`,
      `https://product-videos.${target.labs}/${client}?format=markdown`,
    ];
    for (const url of urls) {
      try {
        const response = await fetchImpl(url, {
          headers: { Accept: 'text/markdown' }, redirect: 'manual',
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        const actual = digest(bytes);
        results.push({ url, ok: actual === expected, expected, actual });
      } catch (error) {
        results.push({ url, ok: false, error: error.message });
      }
    }
  }
  return results;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const realm = process.argv[2] === '--realm' ? process.argv[3] : undefined;
  try {
    const results = await checkInstallGuides(realm);
    for (const result of results) console.log(JSON.stringify(result));
    if (results.some((result) => !result.ok)) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
