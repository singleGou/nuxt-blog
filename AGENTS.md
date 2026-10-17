# AGENTS.md - Nuxt Blog

## Quick start

```bash
pnpm install        # install + postinstall runs `nuxt prepare`
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build
pnpm generate       # static site export
pnpm preview        # preview production build
```

No test, lint, or typecheck package scripts exist. Use the model/data check below and production build; do not start an automatic browser preview (user preference).

## Project structure

- `content/` — Markdown posts organized by category slug. Each `.md` file has frontmatter matching the schema in `content.config.ts:5-17`.
- `content.config.ts` — `posts` includes the four active categories (`frontend`, `web-3d`, `ai`, `backend`), sourced from `CATEGORY_SLUGS`. `archives` preserves `recipes/**` outside the active taxonomy and keeps its original URLs.
- `composables/useCategories.ts` — Hardcoded category definitions. Must stay in sync with `content.config.ts` category enum.
- `composables/useTopics.ts` — Curated topic definitions beneath each category. Menus use `getAvailableTopics` to expose only topics with published content; technical tags remain separate filters.
- `pages/` — File-based routing:
  - `index.vue` — Home page
  - `[category]/index.vue` — Category listing
  - `[category]/[...slug].vue` — Post detail (catch-all slug)
  - `[category]/tag/[tag].vue` — Tag-filtered posts
  - `[category]/topic/[topic].vue` — Topic listing, with optional `?tag=` filtering inside the topic
  - `search.vue` — Client-side full-text search
  - `about.vue` — Static about page
  - `web-3d/brain-atlas.vue` — Interactive brain experience, sharing the default blog layout
  - `recipes/index.vue` — Legacy archive landing page, excluded from primary navigation
- `components/brain/` — Scoped explorer UI and a dynamically imported Three.js scene. No global styles or standalone site shell.
- `data/brain.ts`, `utils/brainModel.ts` — Educational content and named-mesh grouping of the HRA anatomical GLB. No procedural brain geometry. Prefrontal highlights are related frontal gyri, not exact functional boundaries.
- `public/models/brain/` — Local HRA Brain, Male v1.3 GLB (CC BY 4.0), provenance and required attribution. Rebuild with `node scripts/prepare-brain-model.mjs [cached-source.glb]`; read `docs/brain-model.md` before changing mappings.
- `public/models/head/`, `utils/headModel.ts` — Optional transparent HRA Skin, Male v1.2 head/neck contour (CC BY 4.0), same source coordinate transform as the brain; never normalize it independently. Rebuild with `node scripts/prepare-head-model.mjs [cached-VH_M_Skin.glb]`. `tests/head-model.test.mjs` checks actual assets, alignment, camera framing, visibility and disposal.
- `tests/brain-model.test.mjs` — Model, appearance, taxonomy and curriculum checks with `node --test tests/brain-model.test.mjs`.
- `assets/css/main.css` — Tailwind v4 entry (`@import "tailwindcss"`), custom theme tokens, prose overrides.

## Config quirks

- **`nuxt.config.ts`**: `ui: { fonts: false }` — fonts are not auto-managed by Nuxt UI. `colorMode.classSuffix: ''` — dark mode uses bare `dark:` prefix (no suffix like `-dark`).
- **`app.config.ts`**: Primary = `emerald`, Neutral = `stone`. These drive all `UButton`/`UIcon` color variants.
- **`tsconfig.json`**: Extends auto-generated `.nuxt/tsconfig.json`. Do not edit directly.
- **`postinstall` script** (`nuxt prepare`): Generates `.nuxt/tsconfig.json` and type stubs. Required before type-aware tooling works.

## Content authoring

- Add `.md` files under `content/<category>/`. Active post frontmatter requires `title`, `date`, `category`, and `topic`; optional fields include `description`, `tags`, `cover`, `draft`, `featured`. Choose one topic belonging to the selected category. Legacy archive posts do not require topics.
- Read `docs/content-organization.md` for topic slugs and authoring examples. Run `node --test tests/topics.test.mjs` to validate metadata and topic visibility; route checks include topics and combined tag filtering.
- The SQLite content database lives in `.data/content/contents.sqlite` (gitignored). Run `pnpm dev` or `pnpm build` to rebuild it.
- Image paths in `cover` are resolved by `@nuxt/image` — use public paths or remote URLs.
- Set `experience: brain-atlas` on the Web 3D entry to expose the project in listings, tags, and search. `/web-3d/brain-atlas` uses its own page; other posts use the regular article renderer.
- Legacy `/fullstack/**` routes redirect to `/backend/**`; update internal content links when moving articles.

## Dependencies to know about

- **`better-sqlite3`** — native addon for Nuxt Content's SQLite backend. Prebuilt binaries are configured in `pnpm.onlyBuiltDependencies` in `package.json`.
- **`@nuxt/content` v3** — `queryCollection('posts')` is the data-fetching API (not the deprecated `queryContent` from v2).
- **`@nuxt/ui` v3** — Provides `UButton`, `UIcon`, `NuxtLink`-style navigation, `useColorMode`, and built-in component auto-imports.
- **`tailwindcss` v4** — Uses the new `@import` / `@plugin` / `@theme` directives (not `@tailwind` directives).

## Generated / ignored directories

`.nuxt/`, `.output/`, `.data/`, `.cache/`, `dist/`, `node_modules/` — all gitignored. These are safe to delete and regenerate.
