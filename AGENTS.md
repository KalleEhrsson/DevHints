# DevHints project guidance

## Stack and content

- Static Astro 7 / Starlight 0.42, npm and Node 24. No React, backend, CMS, SSR adapter or extra search service.
- `src/content/docs/` is the sole reference content authority. Use native Starlight Markdown/MDX, fenced code, components, Pagefind and theme controls.
- `astro.config.mjs` owns the sidebar and site configuration; `src/styles/custom.css` contains the approved design adjustments. Public assets belong in `public/`.
- Preserve heading anchors, existing entries and meaningful notes. Supply explanation, copyable syntax, requirements and primary sources. Confirm technical claims against primary documentation; seek approval for substantive rewrites/removals.
- Approved baselines: Unity 6.0, Burst 1.8, Microsoft API docs and Blender 4.5 LTS default keymap. These are review baselines, not minimum-version claims.
- Use native code examples instead of original DevHints screenshots. Keep the new hero illustration and blue wordmark. No analytics or Tag Manager; preserve the Google verification file.
- Resource visits open a new tab with `target="_blank"` and `rel="noopener noreferrer"`. Normal-click tab focus follows the browser's settings.

## Verification and delivery

- Run `npm run check` and `npm run build`. The latter includes `scripts/check-site.mjs` and checks actual generated links/assets, recorded migration destinations and code-copy controls.
- For relevant UI/content changes, inspect built output with `npm run preview`: desktop/mobile, light/dark, navigation, heading search, keyboard focus and code copying. Dev-server search is not production search evidence.
- Keep documentation verification distinct from running examples in Unity/Blender. Update `docs/migration-checklist.md` when migration destinations change and record material verification boundaries in `docs/verification.md`.
- Work on `preview`, which deploys to `https://preview--devhints.netlify.app`. `production` is GitHub’s default and Netlify’s production branch.
- Keep the published production deploy locked during review. No production merge, promotion, unlock or production deployment without separate explicit approval.
- Create a focused descriptive commit for completed changes, exact-stage only relevant files, and preserve unrelated work. Push only when authorized; the initial migration’s preview push is authorized.

## Useful tools

Use installed Playwright/browser tooling for rendered checks and Netlify tooling for branch deployment verification. Definition of Done, frontend design, security and SecondBrain skills are relevant when their scope applies. No additional plugin installation is required. Serena tools were unavailable in the migration session; repository files remain authoritative.
