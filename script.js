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

    /* SEARCH */
    input.addEventListener('keyup', function () {
        const filter = input.value.toLowerCase();
        const sections = document.querySelectorAll('section');
        let anyRowVisibleOverall = false;

        sections.forEach(section => {
            const table = section.querySelector('table');
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                let anyRowVisible = false;
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = (filter === '' || text.includes(filter)) ? '' : 'none';
                    if (row.style.display === '') anyRowVisible = true;
                });
                section.style.display = anyRowVisible ? '' : 'none';
                if (anyRowVisible) anyRowVisibleOverall = true;
            } else {
                const text = section.textContent.toLowerCase();
                section.style.display = (filter === '' || text.includes(filter)) ? '' : 'none';
                if (filter === '' || text.includes(filter)) anyRowVisibleOverall = true;
            }
        });

        footer.textContent = (filter !== '' && !anyRowVisibleOverall)
            ? 'No results found related to your search.'
            : originalFooterText;
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

    // Prevent input blur when pressing X
    clearButton.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Keeps focus on the input
    });

    // Clear search input and reset filter
    clearButton.addEventListener('click', () => {
        input.value = '';
        clearButton.style.display = 'none';
        input.dispatchEvent(new Event('keyup')); // trigger filter reset
        input.blur();
    });

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
            desc:  'Extra references, tips, and resources outside Unity and C#.',
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
            badge.textContent = copy.short; // always short label

            // reset classes
            badge.className = '';
            badge.id = 'sectionBadge';
            badge.classList.add(sectionKey);
        }
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
    document.querySelectorAll('.copy-attr').forEach(el => {
        el.addEventListener('click', () => {
            const text = el.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Feedback to user
                const originalText = el.textContent;
                el.textContent = 'Copied!';
                setTimeout(() => {
                    el.textContent = originalText;
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });

    document.querySelectorAll('.copy-attr').forEach(el => {
        /* Save the clean text once */
        if (!el.dataset.copy) el.dataset.copy = el.textContent.trim();

        let tip, showTimer, hideTimer;

        function ensureTip() {
            if (!tip) {
                tip = document.createElement('div');
                tip.className = 'attr-tooltip';
                tip.textContent = 'Click to copy';
                document.body.appendChild(tip); // attach globally
            }
            return tip;
        }

        function showTipDelayed() {
            clearTimeout(hideTimer);
            showTimer = setTimeout(() => {
                const rect = el.getBoundingClientRect();
                ensureTip();
                tip.style.left = rect.left + rect.width / 2 + "px";
                tip.style.top = (rect.top - 20) + window.scrollY + "px"; // 6px above
                tip.style.opacity = '1';
            }, 300);
        }

        function hideTipDelayed() {
            clearTimeout(showTimer);
            hideTimer = setTimeout(() => {
                if (tip) tip.style.opacity = '0';
            }, 300);
        }

        el.addEventListener('mouseenter', showTipDelayed);
        el.addEventListener('mouseleave', hideTipDelayed);

        /* Copy handler: always use the saved clean text */
        el.addEventListener('click', () => {
            const text = el.dataset.copy;  // clean, without tooltip
            navigator.clipboard.writeText(text).then(() => {
                ensureTip();
                clearTimeout(hideTimer);
                tip.style.opacity = '1';
                tip.textContent = 'Copied!';
                setTimeout(() => { if (tip) tip.textContent = 'Click to copy'; }, 800);
            }).catch(err => console.error('Failed to copy:', err));
        });
    });



    window.addEventListener('scroll', function () {
        const btn = document.getElementById('backToTop');
        if (window.scrollY > 100) {
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    });

    // Back to top 
    window.addEventListener('scroll', function () {
        const btn = document.getElementById('backToTop');
        if (window.scrollY > 100) btn.classList.add('show'); else btn.classList.remove('show');
    });
    document.getElementById('backToTop').addEventListener('click', () =>
        window.scrollTo({top: 0, behavior: 'smooth'})
    );

    // Expand/Collapse sections on header click
    document.querySelectorAll('.section-header').forEach(header => {
        const title = header.querySelector('.section-title');
        const icon = header.querySelector('.toggle-icon');
        const content = header.nextElementSibling;

        function toggle() {
            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                icon.textContent = '+';
            } else {
                content.classList.add('expanded');
                icon.textContent = '-';
            }
        }

        title.addEventListener('click', toggle);
        icon.addEventListener('click', toggle);
    });

    document.querySelectorAll('.copy-attr').forEach(code => {
        const docLink = code.dataset.docLink;

        if (docLink) {
            const link = document.createElement('a');
            link.href = docLink;
            link.target = '_blank';
            link.rel = 'noopener';
            link.className = 'doc-icon-link';
            link.setAttribute('aria-label', `${code.textContent.trim()} documentation`);
            link.style.marginLeft = '0.3rem';
            link.style.opacity = '0';
            link.style.pointerEvents = 'none';
            link.style.transition = 'opacity 0.3s ease';

            link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true" width="16" height="16">
            <text x="0" y="14" font-size="16" font-family="Arial, sans-serif" fill="currentColor">?</text></svg>`;

            code.after(link);

            let showTimer, hideTimer;

            function showIcon() {
                clearTimeout(hideTimer);
                link.style.opacity = '1';
                link.style.pointerEvents = 'auto';
            }

            function hideIcon() {
                hideTimer = setTimeout(() => {
                    link.style.opacity = '0';
                    link.style.pointerEvents = 'none';
                }, 300); // fade-out delay
            }

            code.addEventListener('mouseenter', () => {
                showTimer = setTimeout(showIcon, 300); // fade-in delay
            });

            code.addEventListener('mouseleave', () => {
                clearTimeout(showTimer);
                hideIcon();
            });

            // Keep visible while hovering the ? link
            link.addEventListener('mouseenter', showIcon);
            link.addEventListener('mouseleave', hideIcon);
        }
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
});

// Flash cards for Useful Sites 
const sites = [
    { title: "CSS Loaders", url: "https://uiball.com/ldrs/", description: "Copy loading spinners in pure CSS." },
    { title: "UI Colors", url: "https://uicolors.app/", description: "Generate and export Tailwind color palettes." },
    { title: "ReactBits", url: "https://www.reactbits.dev/", description: "Grab ready React components and patterns." },
    { title: "Thiings 3D", url: "https://www.thiings.co/things", description: "Download transparent 3D PNG renders." },
    { title: "Text Behind Image", url: "https://textbehindimage.com/", description: "Create masked headlines behind images." },
    { title: "Hugeicons", url: "https://hugeicons.com/icons?style=Stroke&type=Rounded", description: "Pro icon set with rounded stroke." },
    { title: "Remove Photos", url: "https://remove.photos/", description: "Remove objects and blemishes online." },
    { title: "Napkin AI", url: "https://app.napkin.ai/page/create", description: "Turn text prompts into images." },
    { title: "Cheatography", url: "https://cheatography.com/", description: "Search and download cheat sheets." },
    { title: "Stirling PDF", url: "https://stirlingpdf.io/", description: "Edit, split, and merge PDFs in the browser." },
    { title: "Snazzy Maps", url: "https://snazzymaps.com/", description: "Customize Google Maps styles." }
];

// Useful Sites rendering with favicons
function normalizeUrl(u) {
    return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}
function domainOf(url) {
    try { return new URL(url).hostname; } catch { return ""; }
}
function faviconFor(domain) {
    return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
function gradientFromString(str) {
    let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    const c1 = `hsl(${h} 55% 22%)`, c2 = `hsl(${h} 55% 12%)`;
    return `linear-gradient(180deg, ${c1}, ${c2})`;
}

function renderSites() {
    const grid = document.getElementById('siteGrid');
    const tpl  = document.getElementById('siteCardTpl');
    grid.innerHTML = '';

    sites.forEach(site => {
        const node   = tpl.content.firstElementChild.cloneNode(true);
        const a      = node.querySelector('.site-link');
        const thumb  = node.querySelector('.thumb');
        const icon   = node.querySelector('.thumb-icon');
        const title  = node.querySelector('.title');
        const descEl = node.querySelector('.desc');

        const href   = normalizeUrl(site.url);
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
renderSites();

// Scroll progress line
window.addEventListener('scroll', () => {
    const progress = document.getElementById('scrollProgress');
    const scrolled = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const percent = (scrolled / height) * 100;
    
    // width = scroll position
    progress.style.width = percent + "%";

    // gradient slides as you scroll
    progress.style.backgroundPosition = `${percent}% 50%`;
});