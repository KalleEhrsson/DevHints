document.addEventListener('DOMContentLoaded', () => {

    /* SEARCH */
    const input = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    const searchInput = document.getElementById('searchInput');
    const defaultWidth = 100; // starting width in px
    const focusWidth = 200;   // width when focused with no text
    const maxWidth = 600;     // max growth width in px
    

    /* PAGE TITLE */
    const pageTitle = document.getElementById("pageTitle");
    const pageDesc = document.getElementById("pageDescription");
    
    /* FOOTER */
    const footer = document.querySelector('footer');
    const originalFooterText = footer.textContent;

    /* SIDEBAR */
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarItems = document.querySelectorAll('#sidebar li');

    const overlay = document.getElementById('overlay');

    /* THEME */
    const themeToggle = document.getElementById('themeToggle');
    const themePath = document.getElementById('themePath');

    const body = document.body;

    // lock page height to the visible tab
    function activeSectionEl() {
        return Array.from(document.querySelectorAll('.content-section'))
            .find(el => el.style.display !== 'none');
    }

    /* Persisted collapse state helpers */
    function slugify(s) {
        return (s || '')
            .toLowerCase()
            .replace(/\W+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function sectionScopeFor(node) {
        const mount = node.closest('.content-section');
        if (!mount) return 'app';
        return (mount.id || 'app').replace(/Section$/, '');
    }

    function keyForHeader(header) {
        const title = header.querySelector('.section-title')?.textContent.trim() || 'section';
        return 'collapse:' + sectionScopeFor(header) + ':' + slugify(title);
    }

    function saveCollapseState(header, expanded) {
        try { localStorage.setItem(keyForHeader(header), expanded ? '1' : '0'); } catch {}
    }

    function restoreAllCollapseStates() {
        document.querySelectorAll('.content-section').forEach(mount => {
            mount.querySelectorAll('.section-header').forEach(header => {
                const content = header.nextElementSibling;
                const icon    = header.querySelector('.toggle-icon');
                if (!content) return;

                const key     = keyForHeader(header);
                const stored  = localStorage.getItem(key);
                const expand  = stored === null ? true : stored === '1';

                content.classList.toggle('expanded', expand);
                if (icon) icon.textContent = expand ? '-' : '+';
            });
        });
        if (typeof recalcPageHeight === 'function') recalcPageHeight();
    }

    function recalcPageHeight() {
        const header = document.getElementById('appHeader');
        const footer = document.querySelector('footer');
        const sec = activeSectionEl();
        if (!sec) return;

        document.body.style.minHeight = '';
        document.body.style.height = '';

        const headerH = header ? header.offsetHeight : 0;
        const footerH = footer ? footer.offsetHeight : 0;
        const secH = sec.scrollHeight;
        const needed = Math.max(window.innerHeight, headerH + secH + footerH);

        document.body.style.minHeight = needed + 'px';
        document.body.style.height = needed + 'px';

        const progress = document.getElementById('scrollProgress');
        if (progress) {
            progress.style.width = '0%';
            progress.style.backgroundPosition = '0% 50%';
        }

        window.scrollTo(0, 0);
    }
    
    /* SEARCH */
    function applySearch() {
        const q = input.value.trim().toLowerCase();
        const sec = activeSectionEl();
        if (!sec) return;

        const groups = sec.querySelectorAll('section');
        let anyVisibleOverall = false;

        groups.forEach(group => {
            const table = group.querySelector('table');

            if (table) {
                let anyRowVisible = false;
                table.querySelectorAll('tbody tr').forEach(row => {
                    const show = !q || row.textContent.toLowerCase().includes(q);
                    row.style.display = show ? '' : 'none';
                    if (show) anyRowVisible = true;
                });
                group.style.display = anyRowVisible ? '' : 'none';
                if (anyRowVisible) anyVisibleOverall = true;
            } else {
                const show = !q || group.textContent.toLowerCase().includes(q);
                group.style.display = show ? '' : 'none';
                if (show) anyVisibleOverall = true;
            }
        });

        footer.textContent = (q && !anyVisibleOverall)
            ? 'No results found related to your search.'
            : originalFooterText;
    }

    /* Clear + unfocus */
    function doClear() {
        input.value = '';
        clearButton.style.display = 'none';
        if (typeof applySearch === 'function') applySearch();
        setTimeout(() => { input.blur(); }, 0);
    }

    // Wire search input
    input.addEventListener('keyup', applySearch);

    // Show hide the X and auto reset when empty
    input.addEventListener('input', () => {
        clearButton.style.display = input.value ? 'block' : 'none';
        if (!input.value) applySearch();
    });

    clearButton.addEventListener('mousedown', (e) => {
        e.preventDefault();
        doClear();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') doClear();
    });

    input.addEventListener('input', () => {
        clearButton.style.display = input.value ? 'block' : 'none';
    });
    
    // Expand on input
    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 0) {
            searchInput.style.width = Math.max(
                focusWidth,
                Math.min((searchInput.value.length + 2) * 10, maxWidth)
            ) + 'px';
            clearButton.style.display = 'block';
        } else {
            searchInput.style.width = focusWidth + 'px';
            clearButton.style.display = 'none';
        }
    });

    // Expand on focus (even if empty)
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length === 0) {
            searchInput.style.width = focusWidth + 'px';
        }
    });

    // Collapse when cleared
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.style.width = defaultWidth + 'px';
        clearButton.style.display = 'none';
        searchInput.focus();
    });

    // Collapse when unfocused
    searchInput.addEventListener('blur', () => {
        searchInput.style.width = defaultWidth + 'px';
    });

    input.addEventListener('input', () => clearButton.style.display = input.value ? 'block' : 'none');

    // Load saved active item from localStorage
    const savedActive = localStorage.getItem('activeSidebar');
    if (savedActive) {
        sidebarItems.forEach(li => {
            if (li.textContent.trim() === savedActive) {
                li.classList.add('active');
                const target = li.dataset.section;
                if (target) {
                    document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
                    document.getElementById(target + 'Section').style.display = 'block';
                }
            }
        });
    } else {
        sidebarItems[0].classList.add('active');
    }

    // Sidebar Open
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });

    // Sidebar Close
    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    // Close sidebar when clicking outside (overlay)
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });

    // Section switching + save active state
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.section;
            document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
            document.getElementById(target + 'Section').style.display = 'block';
            sidebarItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            localStorage.setItem('activeSidebar', item.textContent.trim());
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });

    // Change page header
    const headerCopy = {
        unity:  {
            title: 'Unity Inspector & Scripting Attributes Cheat Sheet',
            desc:  'A comprehensive list of built-in and common custom attributes you can use in Unity.',
            short: 'Unity'
        },
        csharp: {
            title: 'C# Tips & Tricks',
            desc:  'Handy syntax, attributes, and coding patterns for C# developers.',
            short: 'C#'
        },
        other:  {
            title: 'Other Notes',
            desc:  'Misc bits worth remembering.',
            short: 'Other'
        },
        sites:  {
            title: 'Useful Sites',
            desc:  'A curated collection of websites and tools to speed up your workflow.',
            short: 'Sites'
        }
    };

    function showSection(sectionKey) {
        document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');

        const secEl = document.getElementById(sectionKey + 'Section');
        if (secEl) secEl.style.display = 'block';

        const copy = headerCopy[sectionKey];
        if (copy) {
            pageTitle.textContent = copy.title;
            pageDesc.textContent  = copy.desc;
        }

        const badge = document.getElementById('sectionBadge');
        if (badge && copy) {
            badge.textContent = copy.short;

            // reset classes
            badge.className = '';
            badge.id = 'sectionBadge';
            badge.classList.add(sectionKey);
        }

        recalcPageHeight();
        updateScrollProgress();
    }

    // Restore active tab from storage (you already store li.textContent)
    const savedActiveText = localStorage.getItem('activeSidebar');
    let restored = false;

    if (savedActiveText) {
        sidebarItems.forEach(li => {
            if (li.textContent.trim() === savedActiveText) {
                sidebarItems.forEach(x => x.classList.remove('active'));
                li.classList.add('active');
                showSection(li.dataset.section);
                restored = true;
            }
        });
    }

    // Fallback to first tab if nothing restored
    if (!restored && sidebarItems.length) {
        const first = sidebarItems[0];
        first.classList.add('active');
        showSection(first.dataset.section);
    }

    // Click handling + saving active
    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            sidebarItems.forEach(li => li.classList.remove('active'));
            item.classList.add('active');
            localStorage.setItem('activeSidebar', item.textContent.trim());
            showSection(item.dataset.section);

            // close drawer on mobile (you already have these in your code)
            document.getElementById('sidebar').classList.remove('open');
            document.getElementById('overlay').classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    });


    // Copy to clipboard on attribute click 
    document.addEventListener('click', (e) => {
        const code = e.target.closest('code.copy-attr');
        if (!code) return;

        const text = code.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const original = code.textContent;
            code.textContent = 'Copied!';
            setTimeout(() => { code.textContent = original; }, 800);
        }).catch(console.error);
    });

    const tooltip = document.createElement('div');
    tooltip.className = 'attr-tooltip';
    tooltip.textContent = 'Click to copy';
    document.body.appendChild(tooltip);

    let tooltipShowTimer;
    let tooltipHideTimer;

    document.addEventListener('mouseenter', (e) => {
        const code = e.target.closest('code.copy-attr');
        if (!code) return;

        clearTimeout(tooltipHideTimer);

        // delay before showing
        tooltipShowTimer = setTimeout(() => {
            const rect = code.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top  = rect.top + window.scrollY - 20 + 'px';
            tooltip.style.opacity = '1';
        }, 300); 
    }, true);

    document.addEventListener('mouseleave', (e) => {
        const code = e.target.closest('code.copy-attr');
        if (!code) return;

        clearTimeout(tooltipShowTimer);
        tooltipHideTimer = setTimeout(() => {
            tooltip.style.opacity = '0';
        }, 200); // fade-out delay
    }, true);

    // Update tooltip text on click
    document.addEventListener('click', (e) => {
        const code = e.target.closest('code.copy-attr');
        if (!code) return;

        const text = code.dataset.copy || code.textContent;
        navigator.clipboard.writeText(text).then(() => {
            // Hide immediately (no "Copied!" linger)
            const oldTransition = tooltip.style.transition;
            tooltip.style.transition = 'none';
            tooltip.style.opacity = '0';
            requestAnimationFrame(() => { tooltip.style.transition = oldTransition; });
        }).catch(console.error);
    });

    // Back to top 
    window.addEventListener('scroll', function () {
        const btn = document.getElementById('backToTop');
        if (window.scrollY > 100) btn.classList.add('show'); else btn.classList.remove('show');
    });
    document.getElementById('backToTop').addEventListener('click', () =>
        window.scrollTo({top: 0, behavior: 'smooth'})
    );

    
    
    /* Expand or collapse sections and persist the state */
    document.addEventListener('click', (e) => {
        const target = e.target.closest('.section-header .section-title, .section-header .toggle-icon');
        if (!target) return;

        const header  = target.closest('.section-header');
        const content = header?.nextElementSibling;
        const icon    = header?.querySelector('.toggle-icon');
        if (!content) return;

        const expanded = content.classList.toggle('expanded');
        if (icon) icon.textContent = expanded ? '-' : '+';

        saveCollapseState(header, expanded);

        if (typeof recalcPageHeight === 'function') recalcPageHeight();
    });


    // Show documentation '?' icon on hover
    let docShowTimer;

    document.addEventListener('mouseenter', (e) => {
        const code = e.target.closest('code.copy-attr');
        if (!code) return;

        const url = code.dataset.docLink;
        if (!url) return;

        let link = code.nextElementSibling;
        const needNew = !(link && link.classList && link.classList.contains('doc-icon-link'));

        if (needNew) {
            link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'doc-icon-link';
            link.setAttribute('aria-label', `${code.textContent.trim()} documentation`);
            link.style.marginLeft = '0.3rem';
            link.style.opacity = '0';
            link.style.pointerEvents = 'none';
            link.style.transition = 'opacity 0.3s ease';
            link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
          <text x="0" y="14" font-size="16" font-family="Arial, sans-serif" fill="currentColor">?</text>
        </svg>`;
            code.after(link);

            /* Keep visible while hovering the link */
            link.addEventListener('mouseenter', () => {
                clearTimeout(docShowTimer);
                link.style.opacity = '1';
                link.style.pointerEvents = 'auto';
            });
            link.addEventListener('mouseleave', () => {
                link.style.opacity = '0';
                link.style.pointerEvents = 'none';
            });
        }

        // Delay before showing
        clearTimeout(docShowTimer);
        docShowTimer = setTimeout(() => {
            link.style.opacity = '1';
            link.style.pointerEvents = 'auto';
        }, 300); // 300ms delay
    }, true);

    document.addEventListener('mouseleave', (e) => {
        const code = e.target.closest('code.copy-attr');
        if (!code) return;
        const link = code.nextElementSibling;
        if (link && link.classList.contains('doc-icon-link')) {
            clearTimeout(docShowTimer); // cancel pending show
            setTimeout(() => {
                if (!link.matches(':hover')) {
                    link.style.opacity = '0';
                    link.style.pointerEvents = 'none';
                }
            }, 300); // fade-out delay
        }
    }, true);

    // Hide the ? immediately when clicked
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.doc-icon-link');
        if (!link) return;
        
        // kill transition so it disappears instantly
        const oldTransition = link.style.transition;
        link.style.transition = 'none';
        link.style.opacity = '0';
        link.style.pointerEvents = 'none';
        
        // restore transition for future hovers
        requestAnimationFrame(() => { link.style.transition = oldTransition; });
    });

    // Also hide immediately when tab regains focus
    window.addEventListener('focus', () => {
        document.querySelectorAll('a.doc-icon-link').forEach(link => {
            if (!link.matches(':hover')) {
                const oldTransition = link.style.transition;
                link.style.transition = 'none';
                link.style.opacity = '0';
                link.style.pointerEvents = 'none';
                requestAnimationFrame(() => { link.style.transition = oldTransition; });
            }
        });
    });

    // Theme Toggle 
    const sunPath = "M12 4a1 1 0 110-2 1 1 0 010 2zM12 22a1 1 0 110-2 1 1 0 010 2zM4 12a1 1 0 11-2 0 1 1 0 012 0zM22 12a1 1 0 11-2 0 1 1 0 012 0zM5.64 5.64a1 1 0 10-1.41 1.41 1 1 0 001.41-1.41zM18.36 18.36a1 1 0 10-1.41 1.41 1 1 0 001.41-1.41zM18.36 5.64a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zM5.64 18.36a1 1 0 10-1.41-1.41 1 1 0 001.41 1.41zM12 7a5 5 0 100 10 5 5 0 000-10z";
    const moonPath = "M13.719 1.8A8.759 8.759 0 1 1 1.8 13.719c3.335 1.867 7.633 1.387 10.469-1.449 2.837-2.837 3.318-7.134 1.45-10.47z";

    const setTheme = (theme) => {
        const isLight = theme === 'light';
        themePath.setAttribute('d', isLight ? sunPath : moonPath);
        themePath.setAttribute('fill', isLight ? '#FDB813' : '#FFD700');
        body.classList.toggle('light-theme', isLight);
        body.classList.toggle('dark-theme', !isLight);
        localStorage.setItem('theme', theme);
    };

    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const isLight = body.classList.contains('light-theme');
        setTheme(isLight ? 'dark' : 'light');
    });

    window.addEventListener('resize', recalcPageHeight);

    /* Make "Other" tab pretty: move doc link into header and mark as card */
    function enhanceOther() {
        const mount = document.getElementById('otherSection');
        if (!mount) return;

        mount.querySelectorAll('section').forEach(sec => {
            const header = sec.querySelector('.section-header');
            const content = sec.querySelector('.section-content');
            if (!header || !content) return;

            // find any ? link inside content
            const doc = content.querySelector('.doc-link, .doc-icon-link');
            if (doc && !header.contains(doc)) {
                // normalize class so CSS hits
                doc.classList.remove('doc-link');
                doc.classList.add('doc-icon-link');
                doc.setAttribute('aria-label', 'Docs');
                header.appendChild(doc);
            }
        });
    }

    document.getElementById('otherSection')?.addEventListener('other:rendered', enhanceOther);

    /* Reapply saved collapse states after JSON renders */
    document.getElementById('unitySection') ?.addEventListener('unity:rendered',  restoreAllCollapseStates);
    document.getElementById('csharpSection')?.addEventListener('csharp:rendered', restoreAllCollapseStates);
    document.getElementById('otherSection') ?.addEventListener('other:rendered',  restoreAllCollapseStates);

    /* Initial restore */
    restoreAllCollapseStates();
});

// Scroll progress line
function updateScrollProgress() {
    const progress = document.getElementById('scrollProgress');
    if (!progress) return;

    const doc = document.scrollingElement || document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    let pct = (doc.scrollTop / max) * 100;

    // snap to 100% at the very bottom
    if (doc.scrollTop >= max - 1) pct = 100;

    progress.style.width = pct + '%';
    progress.style.backgroundPosition = `${pct}% 50%`;
}

window.addEventListener('scroll', updateScrollProgress);