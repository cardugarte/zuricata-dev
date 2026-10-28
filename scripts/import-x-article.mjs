#!/usr/bin/env node
/**
 * Import one X Article export into src/articles/<slug>.md.
 *
 * Inputs (same folder, same basename):
 *   <name>.md         published Markdown. Copied byte for byte after the frontmatter.
 *   <name>.tags.json  NIP-23 tags: d, title, summary, image, t, r, published_at.
 *
 * published_at in the tags file is ignored when it is the placeholder AL_PUBLICAR.
 * The Unix time then comes from inventario-articles.md (match on the d slug) or
 * from --published-at. nostrUrl is set only from a njump.me link on the inventory
 * line for that slug, or from --nostr-url.
 *
 * Usage:
 *   node scripts/import-x-article.mjs content/x-articles-src/01-cve.md
 *   node scripts/import-x-article.mjs path/to/article.md --published-at 1792849340 --nostr-url https://njump.me/naddr1...
 */

import fs from 'node:fs';
import path from 'node:path';

const PLACEHOLDER_DATE = 'AL_PUBLICAR';

function usage() {
  console.log(`Usage: node scripts/import-x-article.mjs <article.md> [options]

Options:
  --tags <file>           Tags JSON. Default: <article>.tags.json
  --inventory <file>      Inventory markdown. Default: inventario-articles.md next to the article
  --out <dir>             Output directory. Default: src/articles
  --published-at <unix>   Unix seconds. Wins over the tags file and the inventory
  --nostr-url <url>       Optional Nostr URL. Wins over the inventory
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

function assertBodyPreserved(written, body) {
  const closing = Buffer.from('\n---\n');
  const at = written.indexOf(closing);
  if (at === -1) {
    throw new Error('Wrote a file without a closing frontmatter marker');
  }
  const extracted = written.subarray(at + closing.length);
  if (!extracted.equals(body)) {
    throw new Error('Body bytes do not match the source Markdown');
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

  const tagsDate =
    fields.published_at && fields.published_at !== PLACEHOLDER_DATE ? fields.published_at : null;
  const publishedRaw = args['published-at'] ?? tagsDate ?? inventory.publishedAt;
  if (!publishedRaw) {
    throw new Error(
      `No published_at for ${slug}. Pass --published-at or add the slug to the inventory.`,
    );
  }

  const nostrUrl = args['nostr-url'] ?? inventory.nostrUrl ?? null;
  const publishedAt = toIso(publishedRaw);
  const outDir = path.resolve(args.out ?? path.join(process.cwd(), 'src/articles'));
  fs.mkdirSync(outDir, { recursive: true });

  const outPath = path.join(outDir, `${slug}.md`);
  const body = fs.readFileSync(mdPath);
  const header = Buffer.from(
    buildFrontmatter({ slug, title, summary, cover, tags, xUrl, publishedAt, nostrUrl }),
    'utf8',
  );
  const written = Buffer.concat([header, body]);
  assertBodyPreserved(written, body);
  fs.writeFileSync(outPath, written);

  console.log(
    `${path.relative(process.cwd(), outPath)}  publishedAt=${publishedAt}  nostr=${nostrUrl ? 'yes' : 'no'}  tags=${tags.length}`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
