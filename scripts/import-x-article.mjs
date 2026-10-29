#!/usr/bin/env node
/**
 * Import one X Article export into src/articles/<slug>.md.
 *
 * Inputs (same folder, same basename):
 *   <name>.md         published Markdown. Copied byte for byte, except the
 *                     trailing "Publicado originalmente en X" credit, which the
 *                     page footer already links.
 *   <name>.tags.json  NIP-23 tags: d, title, summary, image, t, r, published_at.
 *
 * published_at in the tags file is ignored when it is the placeholder AL_PUBLICAR.
 * The Unix time then comes from inventario-articles.md (match on the d slug) or
 * from --published-at.
 *
 * nostrUrl comes from registro-nostr.md (column d, column naddr) as
 * https://njump.me/<naddr>. --nostr-url overrides that. If the registro file is
 * absent, a njump.me link on the inventory line for the same slug is used.
 *
 * Usage:
 *   node scripts/import-x-article.mjs content/x-articles-src/01-cve.md
 *   node scripts/import-x-article.mjs path/to/article.md --published-at 1792849340 --nostr-url https://njump.me/naddr1...
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PLACEHOLDER_DATE = 'AL_PUBLICAR';
const CREDIT_LABEL = 'Publicado originalmente en X: ';

function usage() {
  console.log(`Usage: node scripts/import-x-article.mjs <article.md> [options]

Options:
  --tags <file>           Tags JSON. Default: <article>.tags.json
  --inventory <file>      Inventory markdown. Default: inventario-articles.md next to the article
  --registro <file>       Nostr table. Default: registro-nostr.md next to the article
  --out <dir>             Output directory. Default: src/articles
  --published-at <unix>   Unix seconds. Wins over the tags file and the inventory
  --nostr-url <url>       Optional Nostr URL. Wins over the registro
  --help                  Show this help
`);
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for --${key}`);
      }
      args[key] = value;
      i++;
      continue;
    }
    args._.push(token);
  }
  return args;
}

function yamlQuote(value) {
  return JSON.stringify(String(value));
}

function readTags(tagsPath) {
  const raw = JSON.parse(fs.readFileSync(tagsPath, 'utf8'));
  if (!Array.isArray(raw)) {
    throw new Error(`Expected a NIP-23 tag array in ${tagsPath}`);
  }
  const fields = { t: [] };
  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length < 2) continue;
    const [key, value] = entry;
    if (key === 't') fields.t.push(String(value));
    else fields[key] = String(value);
  }
  return fields;
}

function lookupInventory(inventoryText, slug) {
  const lines = inventoryText.split(/\r?\n/);
  let publishedAt = null;
  let nostrUrl = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(`nostr:${slug}`)) {
      const urlMatch = line.match(/https:\/\/njump\.me\/[^\s)]+/);
      if (urlMatch) nostrUrl = urlMatch[0];
    }

    if (line.includes(`- d: ${slug}`)) {
      for (let j = i; j < lines.length; j++) {
        if (j > i && /^#{2,3} /.test(lines[j])) break;
        const match = lines[j].match(/published_at:\s*(\d+)/);
        if (match) {
          publishedAt = match[1];
          break;
        }
      }
    }
  }

  return { publishedAt, nostrUrl };
}

function unescapeCell(value) {
  const trimmed = value.trim();
  const quoted = trimmed.match(/^`([^`]*)`$/);
  return (quoted ? quoted[1] : trimmed).trim();
}

function splitRow(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;
  const cells = trimmed.split('|');
  if (cells[0] === '') cells.shift();
  if (cells.at(-1)?.trim() === '') cells.pop();
  return cells.map(unescapeCell);
}

function isSeparator(cells) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

/**
 * Read an naddr from a registro-nostr.md table. Column `d` is the slug.
 * An empty naddr cell means the note is not published yet.
 */
export function lookupRegistro(registroText, slug) {
  const lines = registroText.split(/\r?\n/);
  let dIndex = -1;
  let naddrIndex = -1;
  let seen = null;

  for (const line of lines) {
    const cells = splitRow(line);
    if (!cells) continue;
    if (dIndex === -1) {
      if (cells.includes('d') && cells.includes('naddr')) {
        dIndex = cells.indexOf('d');
        naddrIndex = cells.indexOf('naddr');
      }
      continue;
    }
    if (isSeparator(cells)) continue;
    if (cells[dIndex] !== slug) continue;
    const naddr = cells[naddrIndex] ?? '';
    if (!naddr || naddr === '-') continue;
    if (seen && seen !== naddr) {
      throw new Error(`Registro lists more than one naddr for ${slug}`);
    }
    seen = naddr;
  }

  return seen;
}

export function nostrUrlFromNaddr(naddr) {
  if (!/^naddr1[a-z0-9]+$/.test(naddr)) {
    throw new Error(`Registro naddr is not a bech32 naddr1 value: ${naddr}`);
  }
  return `https://njump.me/${naddr}`;
}

function toIso(value) {
  const text = String(value).trim();
  if (/^\d+$/.test(text)) {
    const date = new Date(Number(text) * 1000);
    if (Number.isNaN(date.valueOf())) {
      throw new Error(`Invalid unix time: ${text}`);
    }
    return date.toISOString();
  }
  const date = new Date(text);
  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid date: ${text}`);
  }
  return date.toISOString();
}

function buildFrontmatter({ slug, title, summary, cover, tags, xUrl, publishedAt, nostrUrl }) {
  const lines = [
    '---',
    `slug: ${yamlQuote(slug)}`,
    `title: ${yamlQuote(title)}`,
    `summary: ${yamlQuote(summary)}`,
    `cover: ${yamlQuote(cover)}`,
    'tags:',
    ...tags.map((tag) => `  - ${yamlQuote(tag)}`),
    `xUrl: ${yamlQuote(xUrl)}`,
    `publishedAt: ${yamlQuote(publishedAt)}`,
  ];
  if (nostrUrl) lines.push(`nostrUrl: ${yamlQuote(nostrUrl)}`);
  lines.push('---', '');
  return lines.join('\n');
}

/**
 * Drop only the trailing block
 *   ---\n\nPublicado originalmente en X: <xUrl>\n
 * The kept prefix must be a byte prefix of the source.
 */
export function stripTrailingXCredit(body, xUrl) {
  const text = body.toString('utf8');
  const mismatched = text.match(
    /\n---\n\nPublicado originalmente en X: (https:\/\/x\.com\/LaZuricata\/status\/\d+)\n$/,
  );
  if (mismatched && mismatched[1] !== xUrl) {
    throw new Error(`Trailing X URL ${mismatched[1]} does not match tags r ${xUrl}`);
  }

  const block = `---\n\n${CREDIT_LABEL}${xUrl}\n`;
  if (!text.endsWith(block)) return body;
  const start = text.length - block.length;
  if (start > 0 && text[start - 1] !== '\n') {
    throw new Error('X credit is not its own trailing block');
  }

  const kept = Buffer.from(text.slice(0, start), 'utf8');
  if (!body.subarray(0, kept.length).equals(kept)) {
    throw new Error('Stripping the X credit would change bytes before that block');
  }
  if (!body.subarray(kept.length).equals(Buffer.from(block, 'utf8'))) {
    throw new Error('Trailing block bytes do not match the X credit');
  }
  return kept;
}

export function isBlossomImageUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  const host = url.hostname.toLowerCase();
  const blossom =
    host === 'blossom.band' ||
    host.endsWith('.blossom.band') ||
    host === 'blossom.primal.net' ||
    host.endsWith('.blossom.primal.net');
  if (!blossom) return false;
  return /\.(png|jpe?g|gif|webp|avif)$/i.test(url.pathname);
}

/** Fail if the body still has an http(s) URL that is not a Blossom image. */
export function assertNoExternalLinks(body, slug) {
  const text = body.toString('utf8');
  const found = text.match(/https?:\/\/[^\s)<>\]]+/g) ?? [];
  const bad = found.filter((url) => !isBlossomImageUrl(url));
  if (bad.length > 0) {
    throw new Error(
      `Article ${slug} still has non-Blossom links after import:\n${bad.map((url) => `  ${url}`).join('\n')}`,
    );
  }
}

function assertBodyPreserved(written, body) {
  const closing = Buffer.from('\n---\n');
  const at = written.indexOf(closing);
  if (at === -1) {
    throw new Error('Wrote a file without a closing frontmatter marker');
  }
  const extracted = written.subarray(at + closing.length);
  if (!extracted.equals(body)) {
    throw new Error('Body bytes do not match the imported Markdown');
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args._.length === 0) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  if (args._.length !== 1) {
    throw new Error('Pass exactly one Markdown file');
  }

  const mdPath = path.resolve(args._[0]);
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Markdown file not found: ${mdPath}`);
  }

  const tagsPath = path.resolve(args.tags ?? mdPath.replace(/\.md$/i, '.tags.json'));
  if (!fs.existsSync(tagsPath)) {
    throw new Error(`Tags file not found: ${tagsPath}`);
  }

  const fields = readTags(tagsPath);
  const slug = fields.d;
  const title = fields.title;
  const summary = fields.summary;
  const cover = fields.image;
  const xUrl = fields.r;
  const tags = fields.t;

  for (const [key, value] of Object.entries({ slug, title, summary, cover, xUrl })) {
    if (!value) throw new Error(`Tags file is missing ${key}`);
  }

  const inventoryPath = path.resolve(
    args.inventory ?? path.join(path.dirname(mdPath), 'inventario-articles.md'),
  );
  const inventory = fs.existsSync(inventoryPath)
    ? lookupInventory(fs.readFileSync(inventoryPath, 'utf8'), slug)
    : { publishedAt: null, nostrUrl: null };

  const registroPath = path.resolve(
    args.registro ?? path.join(path.dirname(mdPath), 'registro-nostr.md'),
  );
  let nostrFromRegistro = null;
  if (fs.existsSync(registroPath)) {
    const naddr = lookupRegistro(fs.readFileSync(registroPath, 'utf8'), slug);
    if (naddr) nostrFromRegistro = nostrUrlFromNaddr(naddr);
  }

  const tagsDate =
    fields.published_at && fields.published_at !== PLACEHOLDER_DATE ? fields.published_at : null;
  const publishedRaw = args['published-at'] ?? tagsDate ?? inventory.publishedAt;
  if (!publishedRaw) {
    throw new Error(
      `No published_at for ${slug}. Pass --published-at or add the slug to the inventory.`,
    );
  }

  const nostrUrl = args['nostr-url'] ?? nostrFromRegistro ?? (fs.existsSync(registroPath) ? null : inventory.nostrUrl);
  const publishedAt = toIso(publishedRaw);
  const outDir = path.resolve(args.out ?? path.join(process.cwd(), 'src/articles'));
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${slug}.md`);
  const source = fs.readFileSync(mdPath);
  const body = stripTrailingXCredit(source, xUrl);
  assertNoExternalLinks(body, slug);
  const header = Buffer.from(
    buildFrontmatter({ slug, title, summary, cover, tags, xUrl, publishedAt, nostrUrl }),
    'utf8',
  );
  const written = Buffer.concat([header, body]);
  assertBodyPreserved(written, body);
  fs.writeFileSync(outPath, written);

  console.log(
    `${path.relative(process.cwd(), outPath)}  publishedAt=${publishedAt}  nostr=${nostrUrl ? 'yes' : 'no'}  tags=${tags.length}  stripped=${body.length !== source.length ? 'credit' : 'none'}`,
  );
}

const isDirect = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isDirect) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
