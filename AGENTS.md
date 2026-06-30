# AGENTS.md - Nuxt Blog

## Quick start

```bash
pnpm install        # install + postinstall runs `nuxt prepare`
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build
pnpm generate       # static site export
pnpm preview        # preview production build
```

No test, lint, or typecheck scripts exist. Validation is manual.

## Project structure

- `content/` — Markdown posts organized by category slug. Each `.md` file has frontmatter matching the schema in `content.config.ts:5-17`.
- `content.config.ts` — Single `posts` collection (type `page`, source `**/*.md`). The `category` field is a zod enum: `frontend`, `ai`, `fullstack`, `recipes`.
- `composables/useCategories.ts` — Hardcoded category definitions. Must stay in sync with `content.config.ts` category enum.
- `pages/` — File-based routing:
  - `index.vue` — Home page
  - `[category]/index.vue` — Category listing
  - `[category]/[...slug].vue` — Post detail (catch-all slug)
  - `[category]/tag/[tag].vue` — Tag-filtered posts
  - `search.vue` — Client-side full-text search
  - `about.vue` — Static about page
- `assets/css/main.css` — Tailwind v4 entry (`@import "tailwindcss"`), custom theme tokens, prose overrides.

## Config quirks

- **`nuxt.config.ts`**: `ui: { fonts: false }` — fonts are not auto-managed by Nuxt UI. `colorMode.classSuffix: ''` — dark mode uses bare `dark:` prefix (no suffix like `-dark`).
- **`app.config.ts`**: Primary = `emerald`, Neutral = `stone`. These drive all `UButton`/`UIcon` color variants.
- **`tsconfig.json`**: Extends auto-generated `.nuxt/tsconfig.json`. Do not edit directly.
- **`postinstall` script** (`nuxt prepare`): Generates `.nuxt/tsconfig.json` and type stubs. Required before type-aware tooling works.

## Content authoring

- Add `.md` files under `content/<category>/`. Frontmatter schema: `title` (required), `description`, `date` (required), `category` (required, must match enum), `tags` (array), `cover`, `draft`, `featured`.
- The SQLite content database lives in `.data/content/contents.sqlite` (gitignored). Run `pnpm dev` or `pnpm build` to rebuild it.
- Image paths in `cover` are resolved by `@nuxt/image` — use public paths or remote URLs.

## Dependencies to know about

- **`better-sqlite3`** — native addon for Nuxt Content's SQLite backend. Prebuilt binaries are configured in `pnpm.onlyBuiltDependencies` in `package.json`.
- **`@nuxt/content` v3** — `queryCollection('posts')` is the data-fetching API (not the deprecated `queryContent` from v2).
- **`@nuxt/ui` v3** — Provides `UButton`, `UIcon`, `NuxtLink`-style navigation, `useColorMode`, and built-in component auto-imports.
- **`tailwindcss` v4** — Uses the new `@import` / `@plugin` / `@theme` directives (not `@tailwind` directives).

## Generated / ignored directories

`.nuxt/`, `.output/`, `.data/`, `.cache/`, `dist/`, `node_modules/` — all gitignored. These are safe to delete and regenerate.
