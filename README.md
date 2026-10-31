# DevHints

A personal reference library for Unity, C#, Blender and development tools. Built with static [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/), using native Pagefind search, code highlighting/copy controls and system/light/dark themes.

- [Production](https://devhints.kftech.se): the existing published site stays locked during review.
- [Migration preview](https://preview--devhints.netlify.app): branch deployment from `preview`.
- [Migration checklist](docs/migration-checklist.md): all 49 references, three articles and 26 resources, with primary sources and approved corrections.
- [Verification](docs/verification.md): scope and results of local/browser/deployment checks.

## Local development

Use Node 24.22.1 or a newer Node 24 release. `.nvmrc` and Netlify select Node 24; `package-lock.json` pins the installed dependency tree.

```sh
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

`dev` normally serves port 4321. `preview` serves the built `dist` output, including the Pagefind index. Production search is generated during the build; use `preview` to verify it. `build` also checks expected routes, all recorded migration destinations, local HTML/CSS asset and link targets, native code-copy controls, tracking removal and the Google verification file.

## Authoring

Edit Markdown/MDX under `src/content/docs/`. There is no JSON renderer or second content source. `astro.config.mjs` owns the explicit sidebar; add a sidebar entry when adding a page. Keep reference heading names stable because they become searchable deep links.

Each reference entry has a short explanation, a fenced code block (`csharp` or `text`), concrete namespace/package/declaration requirements and primary documentation. Code blocks automatically receive Starlight highlighting and copy controls. Label fragments and alternatives; do not present package-specific APIs as Unity core. Record a documentation baseline rather than guessing historical minimum versions. Request approval for substantive technical rewrites or removal of existing entries.

Resources live on `/resources/`, grouped by subject. Resource visits open a new tab with `target="_blank"` and `rel="noopener noreferrer"`. Preserve useful descriptions and verify changed external links. This migration retained their original URLs; it does not certify third-party availability, pricing or asset licenses.

Accepted design: DevHints wordmark, blue accent, bounded documentation column, native sidebar/TOC and responsive controls. The homepage uses a new original AI-generated developer illustration. Original DevHints screenshots are retired at the user’s request; use native code examples. No analytics or Tag Manager. `public/googlec132ae438df8900d.html` must remain accessible and unchanged.

## Preview and production

GitHub’s default branch is `production`; local `production` tracks `origin/production`. Netlify production builds target that branch. Only `preview` is enabled for branch deployments. The migration is developed and reviewed there.

1. Make a scoped change on `preview`; run `npm run check` and `npm run build`, then check relevant browser behavior.
2. Commit the completed change and push `preview` to update [the review deployment](https://preview--devhints.netlify.app).
3. Verify the deployed branch/commit and direct page loads. Confirm the existing published production deploy remains locked.
4. Promote only after separate explicit user approval. Do not merge into `production`, unlock publishing or run a production deploy as part of preview review.

`netlify.toml` sets `npm run build`, `dist` and Node 24. Static topic URLs have their own generated HTML; no SPA fallback or server adapter is required.

The layout takes structural inspiration from [HCSTech Docs](https://docs.hcstech.se/); branding, artwork and content are DevHints’ own. Favorites, tag filters, PWA/offline support, localization, restored screenshots and new tutorials are outside this migration.
