/* Multi‑section JSON renderer
   Renders any number of { mountId, jsonPath, eventName } entries */

/* Escape plain text */
function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s != null ? String(s) : '';
    return d.innerHTML;
}
/** Row coming from JSON */
/**
 * @typedef {Object} Row
 * @property {string=} code
 * @property {string=} type
 * @property {string=} docLink
 * @property {string=} description
 * @property {string=} descriptionHtml
 * @property {string=} requirements
 */

/** @param {Row} row */
function renderRow(row) {
    const r = (row && typeof row === 'object') ? row : {};

    const code = escHtml(r.code || '');
    const type = escHtml(r.type || '');

    const docLink = typeof r.docLink === 'string' ? r.docLink : '';
    const descriptionHtml = Object.prototype.hasOwnProperty.call(r, 'descriptionHtml') ? (r.descriptionHtml || '') : '';
    const descriptionText = escHtml(r.description || '');
    const requirements = escHtml(r.requirements || '');

    const docAttr = docLink ? ' data-doc-link="' + escHtml(docLink) + '"' : '';
    const descCell = descriptionHtml || descriptionText;

    let out = '';
    out += '<tr>';
    out +=   '<td><code class="copy-attr" data-type="' + type + '"' + docAttr + '>' + code + '</code></td>';
    out +=   '<td>' + descCell + '</td>';
    out +=   '<td>' + requirements + '</td>';
    out += '</tr>';
    return out;
}

/* Build one <section> table */
function renderAttributeTable(section) {
    const s = (section && typeof section === 'object') ? section : {};
    const title = escHtml(s.title || '');

    if (typeof s.html === 'string' && s.html.trim()) {
        let out = '';
        out += '<section>';
        out +=   '<h2 class="section-header">';
        out +=     '<span class="toggle-icon">-</span>';
        out +=     '<span class="section-title">' + title + '</span>';
        out +=   '</h2>';
        out +=   '<div class="section-content expanded">';
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
    out += '<section>';
    out +=   '<h2 class="section-header">';
    out +=     '<span class="toggle-icon">-</span>';
    out +=     '<span class="section-title">' + title + '</span>';
    out +=   '</h2>';
    out +=   '<div class="section-content expanded">';
    out +=     '<table>' + thead + tbody + '</table>';
    out +=   '</div>';
    out += '</section>';
    return out;
}

/* Pre-seed the doc-link icons so layout doesn’t jump on hover */
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

/* Render one JSON into one mount */
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

/* Render all configured sources */
async function renderAll(sources) {
    if (!Array.isArray(sources)) return;
    for (const s of sources) {
        await renderJsonInto(s.mountId, s.jsonPath, s.eventName);
    }
}

/* Configure your mounts and JSON paths here */
const dataSources = [
    { mountId: 'unitySection',  jsonPath: '/data/unity.json',  eventName: 'unity:rendered'  },
    { mountId: 'csharpSection', jsonPath: '/data/csharp.json', eventName: 'csharp:rendered' },
    { mountId: 'otherSection',  jsonPath: '/data/other.json',  eventName: 'other:rendered' }
];

/* Kick off after DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
    renderAll(dataSources);
});

/* Optional export for other scripts */
window.DevHintsDataRender = {};
