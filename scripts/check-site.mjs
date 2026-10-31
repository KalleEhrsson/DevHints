import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('dist');
const origin = 'https://devhints.kftech.se';
const routes = [
  '/', '/unity/', '/unity/field-attributes/', '/unity/component-class-attributes/',
  '/unity/method-editor-attributes/', '/unity/dots-native-burst/', '/unity/custom-property-drawers/',
  '/csharp/language-interop-attributes/', '/blender/modeling-hotkeys/', '/blender/modifiers-booleans/',
  '/tooling/resharper-formatter-directives/', '/tooling/visual-studio/', '/resources/',
];
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
const html = new Map(walk(root).filter(f => f.endsWith('.html')).map(f => [f, fs.readFileSync(f, 'utf8')]));

function checkTarget(value, base) {
  const url = new URL(decode(value), base);
  if (url.origin !== origin) return;
  let target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  assert(target === root || target.startsWith(root + path.sep), `Target outside dist: ${value}`);
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  assert(fs.existsSync(target), `Missing local target: ${value} from ${base}`);
  if (url.hash && html.has(target)) {
    const id = decodeURIComponent(url.hash.slice(1));
    assert([...html.get(target).matchAll(/\bid="([^"]+)"/g)].some(m => decode(m[1]) === id), `Missing anchor: ${url}`);
  }
  return target;
}

for (const route of routes) checkTarget(route, origin);
assert(fs.existsSync(path.join(root, '404.html')), 'Missing 404 page');
for (const [file, content] of html) {
  const route = '/' + path.relative(root, file).replaceAll(path.sep, '/').replace(/index\.html$/, '');
  const base = origin + route;
  // shortcut: generated HTML uses quoted attributes; replace with an HTML parser if authoring raw unquoted HTML.
  for (const m of content.matchAll(/\b(?:href|src|poster)="([^"]+)"/g)) checkTarget(m[1], base);
  for (const m of content.matchAll(/\bsrcset="([^"]+)"/g)) {
    for (const candidate of m[1].split(',')) checkTarget(candidate.trim().split(/\s+/)[0], base);
  }
  assert(!/googletagmanager\.com|google-analytics\.com|gtag\(|GTM-[A-Z0-9]+/.test(content), `Tracking in ${file}`);
  assert(!/examples\/|\.webp["']/.test(content), `Legacy screenshot reference in ${file}`);
  assert(!/javascript:/i.test(content), `Unexpected executable URL in ${file}`);
}
for (const file of walk(root).filter(f => f.endsWith('.css'))) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) {
    checkTarget(m[1], origin + '/' + path.relative(root, file).replaceAll(path.sep, '/'));
  }
}

const ledger = fs.readFileSync('docs/migration-checklist.md', 'utf8');
const references = [...ledger.matchAll(/\| ((?:unity|csharp|blender):[^|]+) \| \[Migrated\]\(([^)]+)\)/g)];
const destinations = [...ledger.matchAll(/\[Migrated\]\(([^)]+)\)/g)];
assert.equal(references.length, 49, 'Expected 49 reference entries');
assert.equal(destinations.length, 75, 'Expected 49 references plus 26 resources');
assert.equal(new Set(destinations.map(m => m[1])).size, 75, 'Duplicate destination');
for (const m of destinations) checkTarget(m[1], origin);
const resourceUrls = [...ledger.matchAll(/\[Resource\]\(([^)]+)\)/g)].map(m => m[1]);
assert.equal(resourceUrls.length, 26, 'Expected 26 original resource URLs');
const resourceLinks = [...html.get(checkTarget('/resources/', origin)).matchAll(/<a\b([^>]+)>/g)].map(m => m[1]);
const resourcesPage = html.get(checkTarget('/resources/', origin));
assert.equal((resourcesPage.match(/class="resource-row"/g) || []).length, 26, 'Expected 26 resource rows');
assert.equal((resourcesPage.match(/src="\/resource-icons\//g) || []).length, 25, 'Expected 25 locally hosted favicons');
assert.equal((resourcesPage.match(/class="resource-favicon-fallback"/g) || []).length, 1, 'Expected one unavailable-icon fallback');
for (const url of resourceUrls) {
  assert(resourceLinks.some(attrs => decode(attrs.match(/\bhref="([^"]+)"/)?.[1] || '') === url
    && /\btarget="_blank"/.test(attrs) && /\brel="[^"]*\bnoopener\b/.test(attrs)), `Resource must open a safe new tab: ${url}`);
}
for (const [, entry, destination] of references) {
  const file = checkTarget(destination, origin);
  const id = new URL(destination, origin).hash.slice(1);
  const section = html.get(file).split(`id="${id}"`)[1]?.split(/<h2\b/)[0];
  assert(section?.includes('expressive-code') && section.includes('Copy to clipboard'), `Missing native copyable syntax: ${entry}`);
  assert(section.includes('Requirements:') && section.includes('https://'), `Missing reference context: ${entry}`);
}
for (const route of ['/unity/custom-property-drawers/', '/tooling/resharper-formatter-directives/', '/tooling/visual-studio/']) {
  assert(html.get(checkTarget(route, origin)).includes('expressive-code'), `Missing article code: ${route}`);
}
assert.equal(fs.readFileSync(path.join(root, 'googlec132ae438df8900d.html'), 'utf8').trim(), 'google-site-verification: googlec132ae438df8900d.html');
assert(fs.existsSync(path.join(root, 'pagefind/pagefind.js')), 'Missing built search index');
for (const retired of ['index.html', 'style.css', 'js/data-render.js', 'js/script.js', 'data/unity.json', 'data/csharp.json', 'data/blender.json', 'data/other.json', 'data/sites.json']) {
  assert(!fs.existsSync(retired), `Retired content source still present: ${retired}`);
}
console.log(`Verified ${routes.length} routes, 49 reference entries, 3 articles, 26 resources, local links/assets, code-copy controls, search assets and tracking removal.`);
