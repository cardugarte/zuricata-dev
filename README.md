# Astro Starter Kit: Minimal

```sh
bun create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Articles

Longform articles live in `src/articles/<slug>.md`. The `articles` collection in `src/content.config.ts` reads that folder. To publish one, drop a Markdown file with frontmatter there. `/articles` lists it (newest first) and `/articles/<slug>` renders it. No other registration step.

Frontmatter: `slug`, `title`, `summary`, `cover`, `tags`, `xUrl`, `publishedAt`. Optional: `nostrUrl`, `draft`.

X exports in this repo are a `<name>.md` body plus a sibling `<name>.tags.json`. Import one with:

```sh
node scripts/import-x-article.mjs content/x-articles-src/01-cve.md
```

The script copies the Markdown body byte for byte. Frontmatter comes from the tags file: `slug` from `d`, `title`, `summary`, `cover` from `image`, `tags` from every `t`, `xUrl` from `r`. If `published_at` is the placeholder `AL_PUBLICAR`, the Unix time is taken from `inventario-articles.md` by matching the `d` slug. `nostrUrl` is set only when that inventory mentions the same slug with an `https://njump.me/...` link.

Overrides, when the inventory is absent or you need to correct a value:

```sh
node scripts/import-x-article.mjs path/to/article.md \
  --published-at 1792849340 \
  --nostr-url https://njump.me/naddr1...
```

Running the script again overwrites `src/articles/<slug>.md`. A cleaned source `.md` can be re-imported the same way: the body is replaced and the page still adds "Leer en X" and, when `nostrUrl` is present, "Ver en Nostr" after the body.
