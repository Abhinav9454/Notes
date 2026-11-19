/**
 * Smart Notes - Universal Global Search & Direct Navigation Controller
 * Features:
 * - Instant fuzzy search across ALL connected subject notebooks (CN, Java, DSA, C, C++, DBMS)
 * - Hotkeys: '/' and 'Ctrl+K' / 'Cmd+K' to focus search
 * - Direct Jump: Clicking or hitting Enter navigates directly to that topic & section
 * - Visual Glow Pulse on target section when arrived
 * - Cross-notebook direct navigation with URL hash persistence
 */

(function () {
  'use strict';

  function initUniversalSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchDropdown = document.getElementById('global-search-dropdown');
    const searchResultsContainer = document.getElementById('search-dropdown-results');
    const searchSummary = document.getElementById('search-results-summary');
    const searchClearBtn = document.getElementById('global-search-clear');
    const searchBar = document.getElementById('global-search-bar');

    if (!searchInput || !searchDropdown) return;

    // Detect current page subject
    const path = window.location.pathname.toLowerCase();
    let currentSubjectKey = null;
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

    // Dynamic placeholder according to page context
    const activeSubj = currentSubjectKey && window.NOTEBOOK_OUTLINES ? window.NOTEBOOK_OUTLINES[currentSubjectKey] : null;
    if (activeSubj) {
      searchInput.placeholder = `Search within ${activeSubj.name}... (Press '/' or Ctrl+K)`;
    } else {
      searchInput.placeholder = `Search all notes, chapters, topics & code... (Press '/' or Ctrl+K)`;
    }

    let currentResults = [];
    let activeIndex = -1;

    // 1. Keyboard Shortcuts (Ctrl+K, Cmd+K, or '/')
    document.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      const isInput = activeTag === 'input' || activeTag === 'textarea' || document.activeElement.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === 'Escape') {
        closeDropdown();
        searchInput.blur();
      }
    });

    // 2. Input Event (Realtime Search)
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = val ? 'flex' : 'none';
      }
      performSearch(val.trim());
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) {
        performSearch(searchInput.value.trim());
      }
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchClearBtn.style.display = 'none';
        closeDropdown();
        if (window.filterSidebarTOC) window.filterSidebarTOC('');
        searchInput.focus();
      });
    }

    // 3. Keyboard Navigation within Dropdown (ArrowUp, ArrowDown, Enter)
    searchInput.addEventListener('keydown', (e) => {
      if (searchDropdown.style.display === 'none' || currentResults.length === 0) {
        if (e.key === 'Enter') {
          e.preventDefault();
          // Perform search on demand and jump to first
          const q = searchInput.value.trim();
          if (q) {
            const matches = queryOutlines(q);
            if (matches.length > 0) {
              jumpToTopic(matches[0]);
            }
          }
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % currentResults.length;
        updateActiveItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
        updateActiveItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = activeIndex >= 0 && activeIndex < currentResults.length
          ? currentResults[activeIndex]
          : currentResults[0];
        if (selected) {
          jumpToTopic(selected);
        }
      }
    });

    // 4. Click outside to close
    document.addEventListener('click', (e) => {
      if (!searchBar.contains(e.target) && !searchDropdown.contains(e.target)) {
        closeDropdown();
      }
    });

    // Core Search Algorithm: STRICT SCOPING
    // Subject notebook -> ONLY that subject's topics and content
    // Dashboard (index.html) -> ALL connected subjects
    function queryOutlines(query) {
      if (!window.NOTEBOOK_OUTLINES || !query) return [];
      const q = query.toLowerCase().trim();
      if (!q) return [];
      const results = [];

      // Determine subject scope
      const subjectKeys = currentSubjectKey 
        ? [currentSubjectKey] 
        : Object.keys(window.NOTEBOOK_OUTLINES);

      subjectKeys.forEach(subjKey => {
        const subj = window.NOTEBOOK_OUTLINES[subjKey];
        if (!subj || !subj.items) return;

        subj.items.forEach(it => {
          const title = it.title || it.text || '';
          const titleLower = title.toLowerCase();
          const unit = it.unit || '';
          const unitLower = unit.toLowerCase();
          const chapter = it.chapter || '';
          const chapterLower = chapter.toLowerCase();
          const subjNameLower = (subj.name || '').toLowerCase();

          let score = 0;
          if (titleLower.startsWith(q)) score += 120;
          else if (titleLower.includes(q)) score += 80;
          else if (chapterLower.includes(q)) score += 50;
          else if (unitLower.includes(q)) score += 35;
          else if (subjNameLower.includes(q)) score += 15;

          if (score > 0) {
            results.push({
              subjectKey: subjKey,
              subjectName: subj.name,
              subjectIcon: subj.icon,
              subjectFile: subj.file,
              href: it.href,
              title: title.replace(/^\d+\.\s*/, ''),
              unit: unit,
              chapter: chapter,
              score: score
            });
          }
        });
      });

      // On subject pages, also index section headers & body content of that subject
      if (currentSubjectKey) {
        const pageSections = document.querySelectorAll('.notes-section');
        pageSections.forEach(sec => {
          const secId = sec.id;
          const href = '#' + secId;
          const existing = results.find(r => r.href === href);

          const headingElem = sec.querySelector('.section-heading') || sec.querySelector('h2, h3');
          const title = headingElem ? headingElem.innerText.trim() : secId;
          const tagElem = sec.querySelector('.chapter-tag');
          const tag = tagElem ? tagElem.innerText.trim() : '';

          const subheadings = Array.from(sec.querySelectorAll('h4, h5')).map(h => h.innerText).join(' ').toLowerCase();
          const bodyText = (sec.querySelector('.section-body')?.innerText || sec.innerText || '').toLowerCase();

          let contentScore = 0;
          if (title.toLowerCase().includes(q)) contentScore += 70;
          else if (subheadings.includes(q)) contentScore += 45;
          else if (bodyText.includes(q)) contentScore += 25;

          if (contentScore > 0) {
            if (existing) {
              existing.score += contentScore;
            } else {
              const subj = window.NOTEBOOK_OUTLINES[currentSubjectKey] || {
                name: 'Subject',
                icon: '📖',
                file: window.location.pathname.split('/').pop()
              };
              results.push({
                subjectKey: currentSubjectKey,
                subjectName: subj.name,
                subjectIcon: subj.icon,
                subjectFile: subj.file,
                href: href,
                title: title.replace(/^\d+\.\s*/, ''),
                unit: tag,
                chapter: '',
                score: contentScore
              });
            }
          }
        });
      }

      // Sort by score descending
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, 16);
    }

    function performSearch(query) {
      if (!query) {
        closeDropdown();
        if (window.filterSidebarTOC) window.filterSidebarTOC('');
        return;
      }

      // Filter sidebar outline in subject mode in realtime
      if (window.filterSidebarTOC) {
        window.filterSidebarTOC(query);
      }

      currentResults = queryOutlines(query);
      activeIndex = currentResults.length > 0 ? 0 : -1;
      renderDropdown(query);
    }

    function renderDropdown(query) {
      searchDropdown.style.display = 'flex';

      const currentSubjObj = currentSubjectKey && window.NOTEBOOK_OUTLINES ? window.NOTEBOOK_OUTLINES[currentSubjectKey] : null;

      if (currentResults.length === 0) {
        if (searchSummary) searchSummary.innerText = 'No matches found';
        searchResultsContainer.innerHTML = `
          <div class="search-empty-state">
            <span class="search-empty-icon">🔍</span>
            <p>No topics matching "<strong>${escapeHtml(query)}</strong>"${currentSubjObj ? ` in ${escapeHtml(currentSubjObj.name)}` : ''}</p>
            <span class="search-empty-suggestion">
              ${currentSubjObj 
                ? `Search is strictly scoped to <strong>${escapeHtml(currentSubjObj.name)}</strong>. Try checking chapter names, protocols, or concepts.`
                : 'Try searching for keywords like <em>TCP</em>, <em>OSI</em>, <em>Subnetting</em>, <em>Arrays</em>, <em>Pointers</em>, <em>SQL</em>...'}
            </span>
          </div>
        `;
        return;
      }

      if (searchSummary) {
        if (currentSubjObj) {
          searchSummary.innerHTML = `Found <strong>${currentResults.length}</strong> matching ${currentResults.length === 1 ? 'topic' : 'topics'} in ${escapeHtml(currentSubjObj.name)}`;
        } else {
          searchSummary.innerHTML = `Found <strong>${currentResults.length}</strong> matching ${currentResults.length === 1 ? 'topic' : 'topics'} across all notebooks`;
        }
      }

      let html = '';
      currentResults.forEach((res, idx) => {
        const highlightedTitle = highlightMatch(res.title, query);
        const metaInfo = [res.unit, res.chapter].filter(Boolean).join(' • ') || res.subjectName;
        const isCurrent = res.subjectKey === currentSubjectKey;

        html += `
          <div class="search-result-item ${idx === 0 ? 'is-active' : ''}" data-index="${idx}">
            <div class="search-item-left">
              <span class="search-subject-badge" title="${escapeHtml(res.subjectName)}">
                <span>${res.subjectIcon}</span>
                <span>${escapeHtml(res.subjectKey.toUpperCase())}</span>
              </span>
              <div class="search-item-info">
                <div class="search-item-title">${highlightedTitle}</div>
                <div class="search-item-meta">${escapeHtml(metaInfo)}</div>
              </div>
            </div>
            <div class="search-item-arrow">
              ${isCurrent ? 'Jump ↵' : 'Open ↗'}
            </div>
          </div>
        `;
      });

      searchResultsContainer.innerHTML = html;

      // Click listener on search items
      searchResultsContainer.querySelectorAll('.search-result-item').forEach(elem => {
        elem.addEventListener('click', () => {
          const idx = parseInt(elem.getAttribute('data-index'), 10);
          if (currentResults[idx]) {
            jumpToTopic(currentResults[idx]);
          }
        });
      });
    }

    function updateActiveItem() {
      const items = searchResultsContainer.querySelectorAll('.search-result-item');
      items.forEach((item, idx) => {
        if (idx === activeIndex) {
          item.classList.add('is-active');
          item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
          item.classList.remove('is-active');
        }
      });
    }

    function closeDropdown() {
      searchDropdown.style.display = 'none';
      currentResults = [];
      activeIndex = -1;
    }

    // Direct Jump Logic: "aagar koi search karta hai agar us topic ka koi hai to vaha pe lete jaoo yrr"
    function jumpToTopic(item) {
      closeDropdown();
      if (searchInput) searchInput.blur();

      const isCurrentPage = item.subjectKey === currentSubjectKey;

      if (isCurrentPage) {
        // Direct scroll on current page
        const secId = item.href.replace('#', '');
        const target = document.getElementById(secId);
        if (target) {
          target.style.display = 'block';
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', item.href);
          triggerHighlightPulse(target);
        }
      } else {
        // Cross-notebook direct navigation
        window.location.href = `${item.subjectFile}${item.href}`;
      }
    }

    function triggerHighlightPulse(elem) {
      elem.classList.remove('highlight-pulse');
      // Trigger reflow
      void elem.offsetWidth;
      elem.classList.add('highlight-pulse');
      setTimeout(() => {
        elem.classList.remove('highlight-pulse');
      }, 2500);
    }

    function highlightMatch(text, query) {
      if (!query) return escapeHtml(text);
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return escapeHtml(text).replace(regex, '<mark>$1</mark>');
    }

    function escapeHtml(str) {
      return (str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    }

    // Export jumpToTopic for use in Drawer or other modules
    window.jumpToTopic = jumpToTopic;
  }

  // Handle URL hash on load (smooth scroll & highlight pulse)
  function handleUrlHashOnLoad() {
    if (window.location.hash) {
      const secId = window.location.hash.replace('#', '');
      setTimeout(() => {
        const target = document.getElementById(secId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.classList.add('highlight-pulse');
          setTimeout(() => target.classList.remove('highlight-pulse'), 2500);
        }
      }, 300);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initUniversalSearch();
      handleUrlHashOnLoad();
    });
  } else {
    initUniversalSearch();
    handleUrlHashOnLoad();
  }
})();
