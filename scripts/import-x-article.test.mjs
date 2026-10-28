import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assertNoExternalLinks,
  isBlossomImageUrl,
  lookupRegistro,
  nostrUrlFromNaddr,
  stripTrailingXCredit,
} from './import-x-article.mjs';

const xUrl = 'https://x.com/LaZuricata/status/2113989470013866345';
const blossom = 'https://npub12ehepccx7dudmcdlegw9k6acjdyj4xyz5wrxsy3snac4fjlsrldq2tq6hm.blossom.band/e2431c1c.png';

test('drops only the trailing X credit and keeps the prefix bytes', () => {
  const source = Buffer.from(
    `Hola.\n\n---\n\nnot a credit\n\n![](${blossom})\n\n---\n\nPublicado originalmente en X: ${xUrl}\n`,
    'utf8',
  );
  const body = stripTrailingXCredit(source, xUrl);
  const expected = `Hola.\n\n---\n\nnot a credit\n\n![](${blossom})\n\n`;
  assert.equal(body.toString('utf8'), expected);
  assert.equal(source.subarray(0, body.length).equals(body), true);
  assertNoExternalLinks(body, 'sample');
});

test('refuses a trailing X URL that does not match tags r', () => {
  const source = Buffer.from(`Hola.\n\n---\n\nPublicado originalmente en X: ${xUrl}\n`, 'utf8');
  assert.throws(
    () => stripTrailingXCredit(source, 'https://x.com/LaZuricata/status/1'),
    /does not match tags r/,
  );
});

test('fails loudly when a non-Blossom link remains', () => {
  const body = Buffer.from('Fuente: https://example.com/report\n', 'utf8');
  assert.throws(() => assertNoExternalLinks(body, 'sample'), /non-Blossom links/);
});

test('allows Blossom image URLs only', () => {
  assert.equal(isBlossomImageUrl(blossom), true);
  assert.equal(isBlossomImageUrl('https://blossom.primal.net/abc.jpg'), true);
  assert.equal(isBlossomImageUrl('https://example.com/blossom.band/a.png'), false);
  assert.equal(isBlossomImageUrl('https://npub.blossom.band/notes'), false);
  assertNoExternalLinks(Buffer.from(`![](${blossom})\n`, 'utf8'), 'sample');
});

test('reads naddr from a registro table by d slug', () => {
  const registro = [
    '# Registro',
    '',
    '| fecha | N | título | d | event id | naddr | estado |',
    '|---|---|---|---|---|---|---|',
    '| 2026-10-28 | 01 | CVE | `cve-codigo-humano-ia` | `abc` | `naddr1qqqq` | OK |',
    '|  | 02 | IDE | `tu-ide-te-impide-orquestar` |  |  | pendiente |',
    '',
  ].join('\n');
  assert.equal(lookupRegistro(registro, 'cve-codigo-humano-ia'), 'naddr1qqqq');
  assert.equal(lookupRegistro(registro, 'tu-ide-te-impide-orquestar'), null);
  assert.equal(lookupRegistro(registro, 'missing'), null);
  assert.equal(nostrUrlFromNaddr('naddr1qqqq'), 'https://njump.me/naddr1qqqq');
});
