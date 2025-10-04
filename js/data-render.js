/* Multi‑section JSON renderer */

/* Escape plain text */
function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s != null ? String(s) : '';
    return d.innerHTML;
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
    out +=   '</div>';
    out += '</section>';
    return out;
}

/* Utilities for Sites */
function normalizeUrl(u) {
    try { return /^https?:\/\//i.test(u) ? u : `https://${u}`; }
    catch { return u; }
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

/* Render Sites into the Sites section using the template in index.html */
function renderSitesIntoMount(mount, sites) {
    const grid = mount.querySelector('#siteGrid');
    const tpl  = mount.querySelector('#siteCardTpl');
    if (!grid || !tpl) return;

    grid.innerHTML = '';

    sites.forEach(site => {
        const node   = tpl.content.firstElementChild.cloneNode(true);
        const a      = node.querySelector('.site-link');
        const thumb  = node.querySelector('.thumb');
        const icon   = node.querySelector('.thumb-icon');
        const title  = node.querySelector('.title');
        const descEl = node.querySelector('.desc');

        const href   = normalizeUrl(site.url || '');
        const domain = domainOf(href);

        a.href = href;
        title.textContent = site.title || domain || href;
        descEl.textContent = site.description || '';

        thumb.style.background = gradientFromString(domain || href);
        icon.src = faviconFor(domain);
        icon.alt = domain || 'favicon';
        icon.addEventListener('load', () => icon.classList.add('loaded'));
        icon.addEventListener('error', () => icon.remove());

        grid.appendChild(node);
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

    /* Sites shape */
    if (data && Array.isArray(data.sites)) {
        // keep outer structure; the template lives in index.html
        renderSitesIntoMount(mount, data.sites);

        const evName = eventName || 'sites:rendered';
        mount.dispatchEvent(new CustomEvent(evName, {
            bubbles: true,
            detail: {
                mountId,
                jsonPath,
                sites: data.sites.length
            }
        }));
        return;
    }

    /* Attribute sections shape */
    const sects = (data && Array.isArray(data.sections)) ? data.sections : [];
    mount.innerHTML = sects.map(s => renderAttributeTable(s)).join('');

    preseedDocLinks(mount);

    const evName = eventName || 'data:rendered';
    mount.dispatchEvent(new CustomEvent(evName, {
        bubbles: true,
        detail: {
            mountId,
            jsonPath,
            sections: sects.length,
            rows: mount.querySelectorAll('tbody tr').length
        }
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
    { mountId: 'sitesSection',  jsonPath: 'data/sites.json',  eventName: 'sites:rendered'  }
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
