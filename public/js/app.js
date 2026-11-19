/**
 * Smart Notes - Universal Application Utilities
 * Responsive table handling, universal copy button, live search, dynamic TOC & stats
 */

// Global Copy Code Helper (supports all snippet variants)
function copyCode(btn) {
  if (!btn) return;
  const container = btn.closest('.code-block-container') || btn.closest('.code-block') || btn.parentElement.parentElement;
  if (!container) return;
  const target = container.querySelector('code') || container.querySelector('pre');
  if (target) {
    const code = target.innerText;
    navigator.clipboard.writeText(code).then(() => {
      const originalText = btn.innerText;
      btn.innerText = 'Copied!';
      btn.style.background = 'rgba(16, 185, 129, 0.35)';
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = '';
      }, 2000);
    }).catch(err => {
      console.warn('Clipboard write failed, fallback:', err);
    });
  }
}

// Global FAQ Accordion Toggle
function toggleFaq(btn) {
  if (!btn) return;
  const item = btn.closest('.faq-item');
  if (!item) return;
  const answer = item.querySelector('.faq-answer');
  const icon = item.querySelector('.faq-icon');
  if (!answer) return;

  const isHidden = answer.style.display === 'none' || !answer.style.display;
  if (isHidden) {
    answer.style.display = 'block';
    if (icon) icon.innerText = '−';
    btn.style.background = '#f1f5f9';
  } else {
    answer.style.display = 'none';
    if (icon) icon.innerText = '+';
    btn.style.background = '#f8fafc';
  }
}

// Global Search Filter (Realtime keyword highlighter & section filter)
function filterNotes() {
  const searchInput = document.getElementById('search-box');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const sections = document.querySelectorAll('.notes-section');
  let matchCount = 0;

  sections.forEach(sec => {
    const text = sec.innerText.toLowerCase();
    if (!query || text.includes(query)) {
      sec.style.display = 'block';
      matchCount++;
    } else {
      sec.style.display = 'none';
    }
  });

  const countBadge = document.getElementById('section-count-badge');
  if (countBadge && query) {
    countBadge.innerText = `${matchCount} of ${sections.length} found`;
  } else if (countBadge) {
    countBadge.innerText = `${sections.length} ${sections.length === 1 ? 'note' : 'notes'}`;
  }
}

// Automatically wrap all tables in responsive horizontal scrollers
function makeTablesResponsive() {
  document.querySelectorAll('table').forEach(table => {
    if (!table.parentElement.classList.contains('table-responsive')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'table-responsive';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });
}

// Dynamic Outline Generator and Notebook Counter
function updateNotebookStats() {
  const sections = document.querySelectorAll('#notebook-sections .notes-section');
  const countBadge = document.getElementById('section-count-badge');
  const tocContainer = document.getElementById('sidebar-toc');

  if (countBadge) {
    countBadge.innerText = `${sections.length} ${sections.length === 1 ? 'note' : 'notes'}`;
  }

  // Note: Detailed outline with Unit headers is managed by sidebar.js
}

// Universal Copy Button Click Delegation (supports all static & dynamic copy buttons)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.copy-code-btn, .copy-btn');
  if (btn && !btn.getAttribute('onclick')) {
    copyCode(btn);
  }
});

// Auto-run on document load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    makeTablesResponsive();
    updateNotebookStats();
  });
} else {
  makeTablesResponsive();
  updateNotebookStats();
}
