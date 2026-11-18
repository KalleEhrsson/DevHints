# Migration verification

The migration retains 49 references, three articles and 26 resources. See [migration-checklist.md](migration-checklist.md) for primary-documentation results and approved corrections.

## Current hosted theme review, 18 November 2026

This dated review supersedes the earlier publication descriptions for current
release status. Historical local and migration evidence below keeps its scope.

- The ready preview deploy `6af7970e366ef43e04bdd2e9` serves `1065302` on
  [the preview branch](https://preview--devhints.netlify.app). Production remains
  locked at `ab42bca`, deploy `6ae71011dd3bdea0689602a5`, which already includes
  the Starlight migration and compact Resources layout. PRISM/MONO is pending
  production promotion. No merge, push, unlock or publication occurred.
- Fresh checks with the installed Node 24.22.3 runtime passed: Astro diagnostics
  reported zero errors/warnings/hints; the production build and existing site
  assertions passed for 13 routes, 49 references, three articles and 26 resources.
  The two documented non-fatal build warnings remain.
- Hosted HTTP checks returned 200 for all 13 topic/home routes and 404 for an
  unknown route. Home, Field Attributes and Resources were checked at 1440 px and
  390 px in light/dark themes without document overflow. Home/Resources images
  loaded without failures; sampled desktop/mobile captures were visually reviewed.
- Hosted Pagefind searches for SerializeField, DllImport, Shrink Fatten, formatter
  and Poly Haven found the expected pages/heading destinations. Enter activated
  the SerializeField heading result. Escape dismissed search.
- Native theme selection and reload persistence passed. Single-line and multiline
  clipboard contents matched the displayed code, including normal Windows CRLF.
  Mobile menu navigation, theme selection, heading search and code copying passed.
  No browser console errors were reported during these checks.
- This is site and release-readiness evidence. Unity/C# and Blender examples were
  not executed, and external resource availability was not audited. Next action:
  obtain separate approval for the reviewed theme promotion while preserving the
  production lock.

## Local checks, 2026-10-31

- `npm run check`: passed, zero errors, warnings or hints.
- `npm run build`: passed, including all 13 topic/home routes, 49 stable reference anchors, three articles, 26 resource destinations, generated HTML/CSS link and asset targets, native code-copy controls, Pagefind assets, tracking removal and verification-file content.
- The Google verification file moved to `public/` byte-for-byte: Git blob `73365b66b6105f0150e3a3d5c14a32ac094a27ef`, matching the production baseline.
- Dependency installation audit reported zero vulnerabilities. No runtime backend, user-input renderer or third-party search service was added.
- Starlight/Astro emits two non-fatal build warnings: an absent optional `i18n` collection and the custom `404` content route sharing the framework’s dedicated 404 route. The final `404.html`, canonical target, `noindex` metadata and local links are valid; all build assertions pass.

## Built-site browser checks

Chrome/Playwright against `astro preview`, not the development server:

- All 13 routes return 200 at 1440px and 390px widths, without page overflow, clipped paragraph/headings or broken images.
- Homepage and Field Attributes visually inspected in both light and dark themes on desktop and phone. Five homepage topic cards remain, and the reference page has 17 headings and 18 native code-copy buttons with zero screenshot images.
- Actual Pagefind queries `SerializeField`, `DllImport`, `Shrink Fatten`, `formatter` and `Poly Haven` find Unity, C#, Blender, tooling and resource pages. Results include working heading destinations such as `#serializefield`, `#dllimport`, `#shrink-fatten` and `#poly-haven-textures`.
- Keyboard checks cover sidebar navigation, mobile menu and theme selection, mobile contents navigation, search opening/result activation/Escape, and single-line/multiline copy. Focus-visible outlines are present. Clipboard output preserves multiline code, with normal Windows CRLF line endings.
- Auto theme responds to emulated system light/dark changes. On the native mobile splash homepage, theme selection is reached through a topic page’s menu and persists when returning home.
- Resource-link follow-up: all 26 original resource URLs use `target="_blank"` with `noopener noreferrer`, enforced against built HTML. A normal Chrome click on React Bits opened and selected a separate tab while the Resources tab kept its original URL. Browser settings can override foreground-tab selection.
- Approved Resources revision: 26 compact rows under 10 category headings, with 25 local PNG favicons and a JSplacement letter fallback. All icons load at 1440px/390px in light/dark themes; no icon borders, backing or corner rounding are added. No remote images, clipped row text or page overflow were found. Native category navigation, row focus outlines and keyboard activation work. The introductory paragraph and visit arrows were later removed at the user’s request. All 26 resource titles return their stable heading destinations in built Pagefind search; the decorative fallback is excluded from indexing.

## Theme update, 2026-11-12

- The approved combination is PRISM in light mode and MONO in dark mode. Palette sources: [PRISM](https://purist.design/colorbuilds/prism) and [MONO](https://purist.design/colorbuilds/mono). Layout, illustration, blue wordmark, content and resource icons are unchanged.
- `npm run check` passed with zero errors, warnings or hints. `npm run build` passed all existing site assertions; the two previously recorded non-fatal build warnings remain.
- Against local `astro preview`, Home, Field Attributes and Resources returned 200 at 1440px and 390px in both themes, with no horizontal overflow or broken images. Resource icons were loaded eagerly for the visual check only; their shipped lazy-loading behavior is unchanged.
- Sampled body text, headings, homepage descriptions, primary buttons, resource links/descriptions and visible selected-sidebar text meet 4.5:1 contrast. The lowest sampled pair is navy text on the pink light-mode button at 4.75:1. This is targeted contrast verification, not a complete accessibility audit.
- Desktop checks cover native theme selection and reload persistence, keyboard activation of the built Pagefind `SerializeField` heading result, single-line/multiline clipboard content and visible resource-row keyboard focus. Mobile checks cover menu navigation, theme selection, heading search, Escape and single-line clipboard content. Auto theme responds to emulated system light/dark changes.
- Rendered review captures are local artifacts under ignored `output/playwright/selected-*`. Verification is local; this theme change has not been pushed or deployed. No Unity or Blender examples were executed for the theme change.

## Deployment

- Migration commit `91ffcb3c722ec2271c582e5b42e0f63796d3c2f7` deployed successfully as Netlify branch deploy `6ae664dfc59ce91c7516a4b9`, state `ready`, branch `preview`.
- [Live review](https://preview--devhints.netlify.app): all 13 routes return 200 on direct load; the unchanged Google verification file returns 200; an unknown route returns the new 404 page with HTTP 404.
- Hosted Pagefind UI finds the same five representative subjects and their heading links. The deployed reference page shows native code blocks and successful copy confirmation, without original screenshots. Google tracking is absent from all topic HTML.
- `production` remains at baseline `1009957c50be6856d93559fc98f75f2e2955c4d7`. Netlify’s published deploy remains `6add377e780a52b7259d165a`, locked, and the public production homepage still serves the legacy renderer. GitHub default/Netlify production branch are `production`; only `preview` is enabled for branch deploys.
- Documentation-only follow-up commits can change the preview head without changing the verified application content. Production promotion, merge and publishing unlock require separate explicit approval after preview review.

Unity/C# examples were reviewed against documentation, not executed in Unity or a standalone C# project. Blender operations were checked against the Blender 4.5 manual, not run in Blender. External resource URLs were retained; third-party availability and terms are not certified.
