# Migration verification

The migration retains 49 references, three articles and 26 resources. See [migration-checklist.md](migration-checklist.md) for primary-documentation results and approved corrections.

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
- Approved Resources revision: 26 compact rows under 10 category headings, with 25 local PNG favicons and a JSplacement letter fallback. All icons load at 1440px/390px in light/dark themes; no icon borders, backing or corner rounding are added. No remote images, clipped row text or page overflow were found. Native category navigation, row focus outlines, keyboard activation and the visit arrow work. All 26 resource titles return their stable heading destinations in built Pagefind search; the decorative fallback is excluded from indexing.

## Deployment

- Migration commit `91ffcb3c722ec2271c582e5b42e0f63796d3c2f7` deployed successfully as Netlify branch deploy `6ae664dfc59ce91c7516a4b9`, state `ready`, branch `preview`.
- [Live review](https://preview--devhints.netlify.app): all 13 routes return 200 on direct load; the unchanged Google verification file returns 200; an unknown route returns the new 404 page with HTTP 404.
- Hosted Pagefind UI finds the same five representative subjects and their heading links. The deployed reference page shows native code blocks and successful copy confirmation, without original screenshots. Google tracking is absent from all topic HTML.
- `production` remains at baseline `1009957c50be6856d93559fc98f75f2e2955c4d7`. Netlify’s published deploy remains `6add377e780a52b7259d165a`, locked, and the public production homepage still serves the legacy renderer. GitHub default/Netlify production branch are `production`; only `preview` is enabled for branch deploys.
- Documentation-only follow-up commits can change the preview head without changing the verified application content. Production promotion, merge and publishing unlock require separate explicit approval after preview review.

Unity/C# examples were reviewed against documentation, not executed in Unity or a standalone C# project. Blender operations were checked against the Blender 4.5 manual, not run in Blender. External resource URLs were retained; third-party availability and terms are not certified.
