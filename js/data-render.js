/* Multi‑section JSON renderer */

/* Escape plain text */
function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s != null ? String(s) : '';
    return d.innerHTML;
}

function decodeHtml(s) {
    if (s == null || s === '') return '';
    const d = document.createElement('textarea');
    d.innerHTML = s;
    return d.value;
}

/* Allow <code> tags in alt/caption text */
function allowCodeTags(s) {
    const raw = s != null ? String(s) : "";
    const escaped = escHtml(raw);

    // Only re-enable <code>…</code>
    return escaped
        .replaceAll("&lt;code&gt;", "<code>")
        .replaceAll("&lt;/code&gt;", "</code>");
}

function slugify(str) {
    return (str == null ? '' : String(str))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

let sectionIdSeq = 0;

function nextSectionDomId(base) {
    const slug = slugify(base) || 'section';
    sectionIdSeq += 1;
    return `${slug}-${sectionIdSeq}`;
}

/* Row model */
/**
 * @typedef {Object} Row
 * @property {string=} code
 * @property {string=} type
 * @property {string=} docLink
 * @property {string=} description
 * @property {string=} descriptionHtml
 * @property {string=} requirements
 * @property {string[]=} exampleImgs
 * @property {string=} exampleImg
 * @property {string=} exampleAlt
 * @property {string=} exampleNote
 */

/**
 * @typedef {Object} Section
 * @property {string=} id
 * @property {string=} title
 * @property {string=} html // when present, section renders custom HTML instead of a table
 * @property {string[]=} columns
 * @property {Row[]=} rows
 * @property {boolean=} exampleOpen
 * @property {Array<Object>=} sites // optional resource cards rendered under the section
 * @property {string=} siteTitle // optional heading for section-specific sites
 */

/* Attribute row */
/** @param {Row} row */
function renderRow(row) {
    const r = (row && typeof row === 'object') ? row : {};
    const code = escHtml(r.code || "");
    const type = escHtml(r.type || "");
    const docLink = typeof r.docLink === "string" ? r.docLink : "";
    const hasHtml = Object.prototype.hasOwnProperty.call(r, "descriptionHtml");
    const descriptionHtml = hasHtml ? (r.descriptionHtml || "") : "";
    const descriptionText = escHtml(r.description || "");
    const requirements = escHtml(r.requirements || "");
    const descCell = descriptionHtml || descriptionText;
    const docAttr = docLink ? ' data-doc-link="' + escHtml(docLink) + '"' : "";

    // Prefer array of exampleImgs, fallback to single exampleImg
    const list = Array.isArray(r.exampleImgs) && r.exampleImgs.length
        ? r.exampleImgs
        : (r.exampleImg ? [r.exampleImg] : []);

    const hasExample = list.length > 0;
    const firstSrc = hasExample ? `examples/${list[0]}` : "";

    // Caption built from shared alt + note
    const exampleAlt  = allowCodeTags(r.exampleAlt || "");
    const exampleNote = allowCodeTags(r.exampleNote || "");
    const parts = [];
    if (exampleAlt)  parts.push(`<div class="cap-alt">${exampleAlt}</div>`);
    if (exampleNote) parts.push(`<div class="cap-note">${exampleNote}</div>`);
    const longCaptionHtml = parts.length ? parts.join("") : (descriptionHtml || descriptionText);

    // Store the full list in a data attribute for lightbox carousel
    const exampleDataAttr = hasExample
        ? ` data-examples='${JSON.stringify(list.map(s => `examples/${s}`))}'`
        : "";

    return `
  <tr>
    <td><code class="copy-attr" data-type="${type}"${docAttr}>${code}</code></td>
    <td class="desc-td"${hasExample ? ` data-example-src="${firstSrc}"${exampleDataAttr}` : ""}>
      <span class="desc-text">${descCell}</span>
      ${hasExample ? `<span class="example-cap" hidden>${longCaptionHtml}</span>` : ``}
    </td>
    <td>${requirements}</td>
  </tr>`;
}

/* Attribute table section */
function renderAttributeTable(section) {
    const s = (section && typeof section === 'object') ? section : {};
    const title = escHtml(s.title || '');
    const idSource = (typeof s.id === 'string' && s.id.trim()) ? s.id : (s.title || 'section');
    const domId = nextSectionDomId(idSource);
    const headerId = `${domId}-header`;
    const contentId = `${domId}-content`;
    const dataKey = slugify(idSource);
    const sectionAttrs = `class="collapsible-section" id="${escHtml(domId)}"${dataKey ? ` data-section-key="${escHtml(dataKey)}"` : ''}`;

    if (typeof s.html === 'string' && s.html.trim()) {
        let out = '';
        out += `<section ${sectionAttrs}>`;
        out +=   `<h2 class="section-header" id="${escHtml(headerId)}" role="button" tabindex="0" aria-expanded="true" aria-controls="${escHtml(contentId)}">`;
        out +=     '<span class="toggle-icon">-</span>';
        out +=     '<span class="section-title">' + title + '</span>';
        out +=   '</h2>';
        out +=   `<div class="section-content expanded" id="${escHtml(contentId)}" role="region" aria-hidden="false" aria-labelledby="${escHtml(headerId)}">`;
        out +=     s.html;
        out +=   '</div>';
        out += '</section>';
        return out;
    }

    const columns = Array.isArray(s.columns) ? s.columns : ['Attribute','Description','Requirements'];
    const rows = Array.isArray(s.rows) ? s.rows : [];
    const hasSites = Array.isArray(s.sites) && s.sites.length;

    let thead = '<thead><tr>';
    for (let i = 0; i < columns.length; i++) thead += '<th>' + escHtml(columns[i]) + '</th>';
    thead += '</tr></thead>';

    let tbody = '<tbody>';
    for (let j = 0; j < rows.length; j++) tbody += renderRow(rows[j]);
    tbody += '</tbody>';

    let out = '';
    out += `<section ${sectionAttrs}>`;
    out +=   `<h2 class="section-header" id="${escHtml(headerId)}" role="button" tabindex="0" aria-expanded="true" aria-controls="${escHtml(contentId)}">`;
    out +=     '<span class="toggle-icon">-</span>';
    out +=     '<span class="section-title">' + title + '</span>';
    out +=   '</h2>';
    out +=   `<div class="section-content expanded" id="${escHtml(contentId)}" role="region" aria-hidden="false" aria-labelledby="${escHtml(headerId)}">`;
    out +=     '<table>' + thead + tbody + '</table>';
    if (hasSites) {
        const siteHeading = escHtml(s.siteTitle || 'Related Resources');
        const siteData = escHtml(JSON.stringify(s.sites));
        out += `<div class="section-sites" data-sites="${siteData}">`;
        out +=   `<h3 class="section-sites-title">${siteHeading}</h3>`;
        out +=   '<ul class="site-grid"></ul>';
        out += '</div>';
    }
    out +=   '</div>';
    out += '</section>';
    return out;
}

function renderStandaloneSitesSection(opts) {
    const o = (opts && typeof opts === 'object') ? opts : {};
    const list = Array.isArray(o.sites) ? o.sites : [];
    if (!list.length) return '';

    const titleText = typeof o.title === 'string' && o.title.trim() ? o.title.trim() : 'Useful Sites';
    const idSource = typeof o.id === 'string' && o.id.trim() ? o.id : titleText;
    const innerTitleText = typeof o.innerTitle === 'string' && o.innerTitle.trim() ? o.innerTitle.trim() : '';
    const descriptionText = typeof o.description === 'string' && o.description.trim() ? o.description.trim() : '';

    const domId = nextSectionDomId(idSource);
    const headerId = `${domId}-header`;
    const contentId = `${domId}-content`;
    const dataKey = slugify(idSource);
    const siteData = escHtml(JSON.stringify(list));

    const innerTitleHtml = innerTitleText
        ? `<h3 class="section-sites-title">${escHtml(innerTitleText)}</h3>`
        : '';
    const descriptionHtml = descriptionText
        ? `<p class="section-sites-desc">${allowCodeTags(descriptionText)}</p>`
        : '';

    let out = '';
    out += `<section class="collapsible-section" id="${escHtml(domId)}"${dataKey ? ` data-section-key="${escHtml(dataKey)}"` : ''}>`;
    out +=   `<h2 class="section-header" id="${escHtml(headerId)}" role="button" tabindex="0" aria-expanded="true" aria-controls="${escHtml(contentId)}">`;
    out +=     '<span class="toggle-icon">-</span>';
    out +=     `<span class="section-title">${escHtml(titleText)}</span>`;
    out +=   '</h2>';
    out +=   `<div class="section-content expanded" id="${escHtml(contentId)}" role="region" aria-hidden="false" aria-labelledby="${escHtml(headerId)}">`;
    out +=     `<div class="section-sites" data-sites="${siteData}">`;
    out +=       innerTitleHtml;
    out +=       descriptionHtml;
    out +=       '<ul class="site-grid"></ul>';
    out +=     '</div>';
    out +=   '</div>';
    out += '</section>';

    return out;
}

/* Utilities for Sites */
function normalizeUrl(u) {
    try {
        const str = typeof u === "string" ? u.trim() : "";
        if (!str) return null;
        return /^https?:\/\//i.test(str) ? str : `https://${str}`;
    }
    catch {
        return null;
    }
}
function domainOf(url) {
    try { return new URL(url).hostname; } catch { return ""; }
}
function faviconFor(domain) {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
function gradientFromString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    const c1 = `hsl(${h} 55% 22%)`, c2 = `hsl(${h} 55% 12%)`;
    return `linear-gradient(180deg, ${c1}, ${c2})`;
}

function createSiteCardNode(site) {
    const tpl = document.getElementById('siteCardTpl');
    if (!tpl || !tpl.content || !tpl.content.firstElementChild) return null;

    const href = normalizeUrl(site && site.url);
    if (!href) {
        return null;
    }

    const node   = tpl.content.firstElementChild.cloneNode(true);
    const a      = node.querySelector('.site-link');
    const thumb  = node.querySelector('.thumb');
    const icon   = node.querySelector('.thumb-icon');
    const title  = node.querySelector('.title');
    const descEl = node.querySelector('.desc');
    const tagsEl = node.querySelector('.tags');

    const domain = domainOf(href);

    if (a) a.href = href;
    if (title) title.textContent = site && site.title ? site.title : (domain || href);
    if (descEl) descEl.textContent = site && site.description ? site.description : '';

    if (thumb) thumb.style.background = gradientFromString(domain || href);
    if (icon) {
        icon.src = faviconFor(domain);
        icon.alt = domain || 'favicon';
        icon.addEventListener('load', () => icon.classList.add('loaded'));
        icon.addEventListener('error', () => icon.remove());
    }

    if (tagsEl) {
        if (site && Array.isArray(site.tags) && site.tags.length) {
            tagsEl.innerHTML = site.tags
                .map(tag => `<span class="tag">${escHtml(tag)}</span>`)
                .join('');
        } else {
            tagsEl.remove();
        }
    }

    return node;
}

function renderSiteGrid(grid, sites) {
    if (!grid) return;

    grid.innerHTML = '';

    sites.forEach(site => {
        const node = createSiteCardNode(site);
        if (node) {
            grid.appendChild(node);
        }
    });
}

/* Render Sites into the Sites section using the template in index.html */
function renderSitesIntoMount(mount, sites) {
    const grid = mount.querySelector('.site-grid');
    if (!grid) return;

    renderSiteGrid(grid, sites);
}

function hydrateEmbeddedSites(root) {
    if (!root) return;

    const wrappers = root.querySelectorAll('.section-sites[data-sites]');
    wrappers.forEach(wrapper => {
        const grid = wrapper.querySelector('.site-grid');
        if (!grid) {
            wrapper.removeAttribute('data-sites');
            return;
        }

        let parsed = [];
        const rawAttr = wrapper.getAttribute('data-sites') || '';
        const raw = decodeHtml(rawAttr) || rawAttr;
        if (raw) {
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                console.warn('Could not parse section sites JSON', e);
            }
        }

        if (Array.isArray(parsed) && parsed.length) {
            renderSiteGrid(grid, parsed);
        }

        wrapper.removeAttribute('data-sites');
    });
}

/* Pre-seed doc-link icons to avoid layout shifts */
function preseedDocLinks(mount) {
    const codes = mount.querySelectorAll('code.copy-attr[data-doc-link]');
    codes.forEach(code => {
        let link = code.nextElementSibling;
        const exists = link && link.classList && link.classList.contains('doc-icon-link');
        if (exists) return;

        const url = code.getAttribute('data-doc-link');
        if (!url) return;

        link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.className = 'doc-icon-link';

        link.style.display = 'inline-block';
        link.style.width = '1rem';
        link.style.height = '1rem';
        link.style.marginLeft = '.35rem';
        link.style.opacity = '0';
        link.style.pointerEvents = 'none';
        link.style.transition = 'opacity .3s ease';
        link.style.verticalAlign = 'text-top';

        link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
      <text x="0" y="14" font-size="16" font-family="Arial, sans-serif" fill="currentColor">?</text>
    </svg>`;

        code.after(link);
    });
}

/* Render dispatcher that handles both shapes: {sections:[...]} and {sites:[...]} */
async function renderJsonInto(mountId, jsonPath, eventName) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    let data;
    try {
        const res = await fetch(jsonPath, { cache: 'no-cache' });
        data = await res.json();
    } catch (err) {
        console.error('Could not load', jsonPath, err);
        mount.innerHTML = '<p class="error">Could not load ' + escHtml(jsonPath) + '.</p>';
        return;
    }

    const siteList = (data && Array.isArray(data.sites)) ? data.sites : null;
    const sections = (data && Array.isArray(data.sections)) ? data.sections : null;
    const hasSections = Array.isArray(sections) && sections.length;
    const hasSitesOnly = !hasSections && Array.isArray(siteList);

    /* Sites-only shape */
    if (hasSitesOnly) {
        const sites = siteList || [];
        renderSitesIntoMount(mount, sites);

        const evName = eventName || 'sites:rendered';
        mount.dispatchEvent(new CustomEvent(evName, {
            bubbles: true,
            detail: {
                mountId,
                jsonPath,
                sites: sites.length
            }
        }));
        return;
    }

    const sects = hasSections ? sections : [];
    const globalSites = Array.isArray(siteList) ? siteList : [];
    const includeGlobalSites = globalSites.length > 0;

    let html = sects.map(s => renderAttributeTable(s)).join('');
    if (includeGlobalSites) {
        html += renderStandaloneSitesSection({
            title: (typeof data.sitesTitle === 'string' && data.sitesTitle.trim()) ? data.sitesTitle.trim() : 'Useful Sites',
            innerTitle: (typeof data.sitesInnerTitle === 'string' && data.sitesInnerTitle.trim()) ? data.sitesInnerTitle.trim() : '',
            description: typeof data.sitesDescription === 'string' ? data.sitesDescription : '',
            id: typeof data.sitesId === 'string' ? data.sitesId : '',
            sites: globalSites
        });
    }

    mount.innerHTML = html;

    preseedDocLinks(mount);
    hydrateEmbeddedSites(mount);

    const evName = eventName || 'data:rendered';
    const detail = {
        mountId,
        jsonPath,
        sections: sects.length,
        rows: mount.querySelectorAll('tbody tr').length
    };
    if (includeGlobalSites) {
        detail.sites = mount.querySelectorAll('.site-grid li').length;
    }

    mount.dispatchEvent(new CustomEvent(evName, {
        bubbles: true,
        detail
    }));
}

/* Render multiple sources */
async function renderAll(sources) {
    if (!Array.isArray(sources)) return;
    for (const s of sources) {
        await renderJsonInto(s.mountId, s.jsonPath, s.eventName);
    }
}

/* Configure mounts and JSON paths */
const dataSources = [
    { mountId: 'unitySection',  jsonPath: 'data/unity.json',  eventName: 'unity:rendered'  },
    { mountId: 'csharpSection', jsonPath: 'data/csharp.json', eventName: 'csharp:rendered' },
    { mountId: 'otherSection',  jsonPath: 'data/other.json',  eventName: 'other:rendered'  },
    { mountId: 'sitesSection',  jsonPath: 'data/sites.json',  eventName: 'sites:rendered'  },
    { mountId: 'blenderSection', jsonPath: 'data/blender.json', eventName: 'blender:rendered' }
];

/* Kick off after DOM ready */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await renderAll(dataSources);
    } catch (e) {
        console.error(e);
    }
});

/* Optional export */
window.DevHintsDataRender = {};
