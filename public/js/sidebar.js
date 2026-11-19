/**
 * Smart Notes - Unified Sidebar Controller
 * Features:
 * - Desktop Sidebar Pin/Collapse & Hover Peek
 * - Mobile Slide-over Drawer
 * - Dedicated Subject Table of Contents (Full Height, Unit Headers, No cramped search)
 * - Dashboard Slide-over Outline Drawer (Clean, Accessible)
 * - ScrollSpy for Active Section Highlighting
 */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }

  function initSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const pinBtn = document.getElementById('pin-sidebar-btn');
    const closeBtn = document.getElementById('sidebar-close-btn');
    const backdrop = document.querySelector('.sidebar-backdrop') || createBackdrop();

    function createBackdrop() {
      const bd = document.createElement('div');
      bd.className = 'sidebar-backdrop';
      sidebar.after(bd);
      return bd;
    }

    // 1. Desktop Pin State
    const savedPinState = localStorage.getItem('notes_sidebar_collapsed');
    if (savedPinState === 'true' && window.innerWidth > 1024) {
      document.body.classList.add('sidebar-collapsed');
    }

    if (pinBtn) {
      pinBtn.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
        const isCollapsed = document.body.classList.contains('sidebar-collapsed');
        localStorage.setItem('notes_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      });
    }

    // 3. Desktop Hover Peek
    sidebar.addEventListener('mouseenter', () => {
      if (window.innerWidth > 1024 && document.body.classList.contains('sidebar-collapsed')) {
        sidebar.classList.add('hover-expanded');
      }
    });

    sidebar.addEventListener('mouseleave', () => {
      if (window.innerWidth > 1024 && document.body.classList.contains('sidebar-collapsed')) {
        sidebar.classList.remove('hover-expanded');
      }
    });

    // 4. Mobile Drawer Controls
    function openMobileDrawer() {
      sidebar.classList.add('mobile-open');
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileDrawer() {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeMobileDrawer);
    backdrop.addEventListener('click', closeMobileDrawer);

    // Toggle button in header (Mobile drawer open/close, or Desktop pin collapse)
    const mobileToggles = document.querySelectorAll('.mobile-menu-toggle, #mobile-menu-toggle');
    mobileToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.innerWidth <= 1024) {
          if (sidebar.classList.contains('mobile-open')) {
            closeMobileDrawer();
          } else {
            openMobileDrawer();
          }
        } else {
          document.body.classList.toggle('sidebar-collapsed');
          const isCollapsed = document.body.classList.contains('sidebar-collapsed');
          localStorage.setItem('notes_sidebar_collapsed', isCollapsed ? 'true' : 'false');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (sidebar.classList.contains('mobile-open')) closeMobileDrawer();
        if (typeof closeOutlineDrawer === 'function') closeOutlineDrawer();
      }
    });

    // 5. SUBJECT OUTLINE CONTROLLER
    initOutlineSystem(sidebar, closeMobileDrawer);
  }

  function initOutlineSystem(sidebar, closeMobileDrawer) {
    const path = window.location.pathname.toLowerCase();
    let currentSubjectKey = null;

    // Check Dashboard explicitly first: '/', '/index', or 'index.html'
    if (path === '/' || path.endsWith('/') || path.includes('index') || path.endsWith('index.html')) {
      currentSubjectKey = null;
    } else if (path.includes('html_css')) {
      currentSubjectKey = 'html_css';
    } else if (path.includes('java')) {
      currentSubjectKey = 'java';
    } else if (path.includes('dsa')) {
      currentSubjectKey = 'dsa';
    } else if (path.includes('cn')) {
      currentSubjectKey = 'cn';
    } else if (path.includes('c.html') || path.endsWith('/c')) {
      currentSubjectKey = 'c';
    } else if (path.includes('cpp')) {
      currentSubjectKey = 'cpp';
    } else if (path.includes('sql')) {
      currentSubjectKey = 'sql';
    } else if (path.includes('dbms')) {
      currentSubjectKey = 'dbms';
    } else if (path.includes('js.html') || path.endsWith('/js')) {
      currentSubjectKey = 'js';
    } else if (path.includes('springboot')) {
      currentSubjectKey = 'springboot';
    } else if (path.includes('os.html') || path.endsWith('/os') || (path.split('/').pop().startsWith('os'))) {
      currentSubjectKey = 'os';
    }

    const isSubjectPage = !!currentSubjectKey;
    const isDashboard = !currentSubjectKey;

    if (isSubjectPage) {
      // SUBJECT PAGE MODE: The sidebar is the dedicated TOC!
      document.body.classList.add('is-subject-page');
      sidebar.classList.add('sidebar-subject-mode');

      // Hide Subject Notebooks list
      const navList = sidebar.querySelector('.notebook-nav-list');
      if (navList) navList.style.display = 'none';
      const navLabels = sidebar.querySelectorAll('.nav-label');
      navLabels.forEach(lbl => lbl.style.display = 'none');

      // Setup dedicated Subject TOC in sidebar
      let outlineWrapper = document.getElementById('sidebar-outline-wrapper');
      const sidebarContent = sidebar.querySelector('.sidebar-content');

      // Remove any existing static toc-section to prevent duplicates
      const staticToc = sidebarContent ? sidebarContent.querySelector(':scope > .toc-section') : null;
      if (staticToc) staticToc.remove();

      if (!outlineWrapper) {
        outlineWrapper = document.createElement('div');
        outlineWrapper.className = 'sidebar-outline-wrapper';
        outlineWrapper.id = 'sidebar-outline-wrapper';
        if (sidebarContent) sidebarContent.appendChild(outlineWrapper);
      }

      outlineWrapper.innerHTML = `
        <div class="toc-section" id="sidebar-toc"></div>
      `;

      renderSubjectTOC(currentSubjectKey);
      initScrollSpy();

      // Click on TOC links & tree toggles
      sidebar.addEventListener('click', (e) => {
        // 1. Parent tree toggle (e.g. Arrays chevron)
        const parentToggle = e.target.closest('.toc-tree-parent-toggle');
        if (parentToggle) {
          e.preventDefault();
          e.stopPropagation();
          const treeNode = parentToggle.closest('.toc-tree-node');
          if (treeNode) {
            treeNode.classList.toggle('is-collapsed');
          }
          return;
        }

        // 2. Submodule toggle (circle chevron >)
        const subToggle = e.target.closest('.toc-tree-sub-toggle');
        if (subToggle) {
          e.preventDefault();
          e.stopPropagation();
          const submodule = subToggle.closest('.toc-tree-submodule');
          if (submodule) {
            submodule.classList.toggle('is-open');
          }
          return;
        }

        // 3. TOC link click (smooth scroll + pulse)
        const tocLink = e.target.closest('.toc-link');
        if (tocLink) {
          const secId = tocLink.getAttribute('data-sec-id');
          if (secId) {
            const targetElem = document.getElementById(secId);
            if (targetElem) {
              e.preventDefault();
              targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
              history.pushState(null, '', '#' + secId);

              // Visual highlight pulse
              targetElem.classList.remove('highlight-pulse');
              void targetElem.offsetWidth;
              targetElem.classList.add('highlight-pulse');
              setTimeout(() => targetElem.classList.remove('highlight-pulse'), 2500);
            }
          }
          if (window.innerWidth <= 1024) {
            closeMobileDrawer();
          }
        }
      });
    } else {
      // DASHBOARD MODE: Keep sidebar clean (no cramped outline at bottom)
      const existingOutline = document.getElementById('sidebar-outline-wrapper');
      if (existingOutline) existingOutline.remove();

      // Ensure Subject Notebooks list is fully visible on Dashboard
      const navList = sidebar.querySelector('.notebook-nav-list');
      if (navList) navList.style.display = '';
      const navLabels = sidebar.querySelectorAll('.nav-label');
      navLabels.forEach(lbl => lbl.style.display = '');

      document.body.classList.remove('is-subject-page');
      sidebar.classList.remove('sidebar-subject-mode');

      // Setup Dashboard Slide-Over Outline Drawer
      setupDashboardOutlineDrawer();
    }
  }

  // Render Subject TOC in Sidebar (with sticky Unit headers & expandable trees)
  function renderSubjectTOC(subjectKey) {
    const tocElem = document.getElementById('sidebar-toc');
    if (!tocElem || !window.NOTEBOOK_OUTLINES || !window.NOTEBOOK_OUTLINES[subjectKey]) return;

    const subject = window.NOTEBOOK_OUTLINES[subjectKey];
    const items = subject.items || [];

    if (items.length === 0) {
      tocElem.innerHTML = `
        <div class="toc-empty-notice">
          📝 <strong>${escapeHtml(subject.name)}</strong><br>
          Notes will appear here once added.
        </div>
      `;
      return;
    }

    let html = '';
    let lastUnit = null;

    items.forEach((it, idx) => {
      const secId = it.href.replace('#', '');
      const rawText = (it.text && /^(\d+(\.\d+)*)\.?\s+/.test(it.text)) ? it.text : (it.title || it.text || `Topic ${idx + 1}`);
      const numMatch = rawText.match(/^(\d+(\.\d+)*)\.?\s+(.*)$/);
      const isCapstone = (it.unit && it.unit.toLowerCase().includes('capstone')) || (it.href && it.href.includes('master-wrap-up'));
      const displayNum = numMatch ? (numMatch[1].includes('.') ? numMatch[1] : `${numMatch[1]}.`) : (isCapstone ? '★' : `${idx + 1}.`);
      const cleanLabel = numMatch ? numMatch[3] : (it.title || rawText);

      // Render Unit divider if present and changed
      if (it.unit && it.unit !== lastUnit) {
        lastUnit = it.unit;
        html += `
          <div class="toc-unit-header" title="${escapeHtml(it.unit)}">
            <span class="toc-unit-icon">📌</span>
            <span class="toc-unit-title">${escapeHtml(it.unit)}</span>
          </div>
        `;
      }

      // Check if item has submodules / tree structure (e.g. Arrays, Hashing, Binary Search)
      if (it.submodules && it.submodules.length > 0) {
        let totalNodeProblems = 0;
        let doneNodeProblems = 0;
        let submodulesHtml = '';

        it.submodules.forEach(sub => {
          let problemsHtml = '';
          let subDoneCount = 0;
          const subTotalCount = sub.problems ? sub.problems.length : 0;
          totalNodeProblems += subTotalCount;

          if (sub.problems && sub.problems.length > 0) {
            sub.problems.forEach(p => {
              const pSecId = p.href.replace('#', '');
              const badgeClass = p.badge ? `badge-${escapeHtml(p.badge.toLowerCase())}` : '';
              problemsHtml += `
                <a href="${p.href}" class="toc-link toc-tree-problem-link" data-sec-id="${pSecId}" title="${escapeHtml(p.title)}">
                  <span class="toc-link-text">${escapeHtml(p.title)}</span>
                  ${p.badge ? `<span class="toc-tree-badge ${badgeClass}">${escapeHtml(p.badge)}</span>` : ''}
                </a>
              `;
            });
          }

          const subSecId = sub.href.replace('#', '');
          const displaySubCount = subTotalCount > 0 ? `${subTotalCount}` : (sub.count || '');
          submodulesHtml += `
            <div class="toc-tree-submodule is-open" id="tree-sub-${subSecId}">
              <div class="toc-tree-submodule-header">
                <button type="button" class="toc-tree-sub-toggle" title="Expand / Collapse ${escapeHtml(sub.title)}">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
                <a href="${sub.href}" class="toc-link toc-tree-submodule-link" data-sec-id="${subSecId}" title="${escapeHtml(sub.title)}">
                  <span>${escapeHtml(sub.title)}</span>
                  ${displaySubCount ? `<span class="toc-tree-submodule-count">${escapeHtml(displaySubCount)}</span>` : ''}
                </a>
              </div>
              <div class="toc-tree-problems">
                ${problemsHtml}
              </div>
            </div>
          `;
        });

        const displayNodeCount = totalNodeProblems > 0 ? `${totalNodeProblems}` : (it.count || '');

        html += `
          <div class="toc-tree-node" id="tree-node-${secId}">
            <div class="toc-tree-header">
              <button type="button" class="toc-tree-parent-toggle" title="Toggle ${escapeHtml(cleanLabel)}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              <a href="${it.href}" class="toc-link toc-tree-parent-link" data-sec-id="${secId}" title="${escapeHtml(rawText)}">
                <span class="toc-link-text">${escapeHtml(cleanLabel)}</span>
                ${displayNodeCount ? `<span class="toc-tree-parent-count">${escapeHtml(displayNodeCount)}</span>` : ''}
              </a>
            </div>
            <div class="toc-tree-children">
              ${submodulesHtml}
            </div>
          </div>
        `;
        return;
      }

      html += `
        <a href="${it.href}" class="toc-link" title="${escapeHtml(rawText)}" data-sec-id="${secId}">
          <span class="toc-link-num">${displayNum}</span>
          <span class="toc-link-text">${escapeHtml(cleanLabel)}</span>
        </a>
      `;
    });

    tocElem.innerHTML = html;
  }

  // Live Outline TOC filter in Subject Mode
  window.filterSidebarTOC = function (query) {
    const tocElem = document.getElementById('sidebar-toc');
    if (!tocElem) return;
    const q = (query || '').toLowerCase().trim();
    const links = tocElem.querySelectorAll('.toc-link');
    const headers = tocElem.querySelectorAll('.toc-unit-header');

    if (!q) {
      links.forEach(l => l.style.display = '');
      headers.forEach(h => h.style.display = '');
      return;
    }

    links.forEach(l => {
      const text = (l.innerText || '').toLowerCase();
      if (text.includes(q)) {
        l.style.display = 'flex';
        const sub = l.closest('.toc-tree-submodule');
        if (sub) sub.classList.add('is-open');
        const node = l.closest('.toc-tree-node');
        if (node) node.classList.remove('is-collapsed');
      } else {
        l.style.display = 'none';
      }
    });

    // Clean up empty unit headers when their topics are filtered out
    headers.forEach(h => {
      let next = h.nextElementSibling;
      let hasVisible = false;
      while (next && !next.classList.contains('toc-unit-header')) {
        if (next.classList.contains('toc-link') && next.style.display !== 'none') {
          hasVisible = true;
          break;
        }
        next = next.nextElementSibling;
      }
      h.style.display = hasVisible ? 'flex' : 'none';
    });
  };

  // Dashboard Slide-Over Outline Drawer Setup
  function setupDashboardOutlineDrawer() {
    let backdrop = document.getElementById('outline-drawer-backdrop');
    let drawer = document.getElementById('outline-drawer');

    if (!drawer) {
      backdrop = document.createElement('div');
      backdrop.className = 'outline-drawer-backdrop';
      backdrop.id = 'outline-drawer-backdrop';
      document.body.appendChild(backdrop);

      drawer = document.createElement('div');
      drawer.className = 'outline-drawer';
      drawer.id = 'outline-drawer';
      drawer.innerHTML = `
        <div class="outline-drawer-header">
          <div class="drawer-header-left">
            <div class="drawer-subject-icon" id="drawer-subject-icon">📖</div>
            <div class="drawer-title-col">
              <h3 id="drawer-subject-title">Subject Outline</h3>
              <span id="drawer-subject-meta">0 Chapters & Topics</span>
            </div>
          </div>
          <button type="button" class="drawer-close-btn" id="drawer-close-btn" title="Close Outline">✕</button>
        </div>
        <div class="outline-drawer-body" id="drawer-outline-body"></div>
        <div class="outline-drawer-footer">
          <span style="font-size: 0.74rem; color: var(--text-muted);">Click any topic to jump directly</span>
          <a href="#" class="drawer-open-notebook-btn" id="drawer-open-notebook-btn">Open Full Notebook ↗</a>
        </div>
      `;
      document.body.appendChild(drawer);

      const closeBtn = document.getElementById('drawer-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', closeOutlineDrawer);
      backdrop.addEventListener('click', closeOutlineDrawer);
    }

    // Attach click listeners to cards on Dashboard
    const cards = document.querySelectorAll('.notebook-card');
    cards.forEach(card => {
      // Clicking anywhere on card navigates directly to the notebook
      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return; // let <a> handle itself
        const link = card.querySelector('a.card-action-btn') || card.querySelector('a');
        if (link && link.href) {
          window.location.href = link.href;
        }
      });
    });

    // Also support global calls
    window.openOutlineDrawer = openOutlineDrawer;
    window.closeOutlineDrawer = closeOutlineDrawer;
  }

  function openOutlineDrawer(subjectKey) {
    if (!window.NOTEBOOK_OUTLINES || !window.NOTEBOOK_OUTLINES[subjectKey]) return;

    const subject = window.NOTEBOOK_OUTLINES[subjectKey];
    const backdrop = document.getElementById('outline-drawer-backdrop');
    const drawer = document.getElementById('outline-drawer');
    const iconElem = document.getElementById('drawer-subject-icon');
    const titleElem = document.getElementById('drawer-subject-title');
    const metaElem = document.getElementById('drawer-subject-meta');
    const bodyElem = document.getElementById('drawer-outline-body');
    const openBtn = document.getElementById('drawer-open-notebook-btn');

    if (!drawer || !bodyElem) return;

    if (iconElem) iconElem.innerText = subject.icon;
    if (titleElem) titleElem.innerText = subject.name;
    if (metaElem) metaElem.innerText = `${(subject.items || []).length} Chapters & Topics`;
    if (openBtn) {
      openBtn.href = subject.file;
      openBtn.innerText = `Open ${subject.name} ↗`;
    }

    const items = subject.items || [];
    if (items.length === 0) {
      bodyElem.innerHTML = `
        <div class="toc-empty-notice" style="margin-top: 30px;">
          📝 <strong>${escapeHtml(subject.name)}</strong><br>
          Notes will be added soon.
        </div>
      `;
    } else {
      let html = '';
      let lastUnit = null;

      items.forEach((it, idx) => {
        const rawText = (it.text && /^(\d+(\.\d+)*)\.?\s+/.test(it.text)) ? it.text : (it.title || it.text || `Topic ${idx + 1}`);
        const numMatch = rawText.match(/^(\d+(\.\d+)*)\.?\s+(.*)$/);
        const isCapstone = (it.unit && it.unit.toLowerCase().includes('capstone')) || (it.href && it.href.includes('master-wrap-up'));
        const displayNum = numMatch ? (numMatch[1].includes('.') ? numMatch[1] : `${numMatch[1]}.`) : (isCapstone ? '★' : `${idx + 1}.`);
        const cleanLabel = numMatch ? numMatch[3] : (it.title || rawText);

        if (it.unit && it.unit !== lastUnit) {
          lastUnit = it.unit;
          html += `
            <div class="toc-unit-header" title="${escapeHtml(it.unit)}" style="position: sticky; top: 0; z-index: 2; margin-top: 12px;">
              <span class="toc-unit-icon">📌</span>
              <span class="toc-unit-title">${escapeHtml(it.unit)}</span>
            </div>
          `;
        }

        html += `
          <a href="${subject.file}${it.href}" class="toc-link" title="${escapeHtml(rawText)}" data-file="${subject.file}" data-href="${it.href}">
            <span class="toc-link-num">${displayNum}</span>
            <span class="toc-link-text">${escapeHtml(cleanLabel)}</span>
          </a>
        `;
      });

      bodyElem.innerHTML = html;

      // Direct jump click handler in drawer
      bodyElem.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetFile = link.getAttribute('data-file');
          const targetHref = link.getAttribute('data-href');
          closeOutlineDrawer();
          window.location.href = `${targetFile}${targetHref}`;
        });
      });
    }

    if (backdrop) backdrop.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeOutlineDrawer() {
    const backdrop = document.getElementById('outline-drawer-backdrop');
    const drawer = document.getElementById('outline-drawer');
    if (backdrop) backdrop.classList.remove('active');
    if (drawer) drawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  function getSubjectFromHref(href) {
    if (!href) return null;
    const h = href.toLowerCase();
    if (h.includes('index') || h === '/' || h === '#') return null;
    if (h.includes('html_css')) return 'html_css';
    if (h.includes('java')) return 'java';
    if (h.includes('dsa')) return 'dsa';
    if (h.includes('cn')) return 'cn';
    if (h.includes('c.html') || h.endsWith('/c')) return 'c';
    if (h.includes('cpp')) return 'cpp';
    if (h.includes('sql')) return 'sql';
    if (h.includes('dbms')) return 'dbms';
    if (h.includes('js.html') || h.endsWith('/js')) return 'js';
    return null;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const clean = String(str)
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    return clean.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
  }

  // ScrollSpy for Active TOC Link on Subject Notebook
  function initScrollSpy() {
    const tocContainer = document.getElementById('sidebar-toc');
    const contentArea = document.querySelector('.content-area');
    if (!tocContainer) return;

    // Observe all targets in the page that have matching TOC links
    const tocLinks = tocContainer.querySelectorAll('.toc-link');
    const observedElements = [];
    tocLinks.forEach(link => {
      const secId = link.getAttribute('data-sec-id');
      if (secId) {
        const el = document.getElementById(secId);
        if (el) observedElements.push(el);
      }
    });

    if (!observedElements.length) return;

    let currentActiveId = null;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && id !== currentActiveId) {
            currentActiveId = id;
            updateActiveTocLink(id);
          }
        }
      });
    }, {
      root: contentArea || null,
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0
    });

    observedElements.forEach(sec => observer.observe(sec));

    function updateActiveTocLink(activeId) {
      const links = tocContainer.querySelectorAll('.toc-link');
      links.forEach(link => {
        const secId = link.getAttribute('data-sec-id');
        if (secId === activeId) {
          link.classList.add('active');
          link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
})();
