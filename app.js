// Hardware Engineering Lab Notes - Interaction & Catalog Logic

(function() {
  'use strict';

  const tabCaseStudy = document.getElementById("tab-case-study");
  const tabCatalog = document.getElementById("tab-catalog");
  const viewCaseStudy = document.getElementById("view-case-study");
  const viewCatalog = document.getElementById("view-catalog");
  const catalogGrid = document.getElementById("catalog-grid");

  // Tab switching
  function showCaseStudy() {
    tabCaseStudy.classList.add("active");
    tabCatalog.classList.remove("active");
    viewCaseStudy.style.display = "block";
    viewCatalog.style.display = "none";
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showCatalog() {
    tabCatalog.classList.add("active");
    tabCaseStudy.classList.remove("active");
    viewCaseStudy.style.display = "none";
    viewCatalog.style.display = "block";
    renderCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabCaseStudy.addEventListener("click", showCaseStudy);
  tabCatalog.addEventListener("click", showCatalog);

  // Render Catalog
  function renderCatalog() {
    if (!catalogGrid) return;

    catalogGrid.innerHTML = INITIAL_COMPONENTS.map(c => {
      const isRef5045 = c.id === "ref5045";
      const gotchasCount = c.gotchas ? c.gotchas.length : 0;

      return `
        <div class="catalog-card">
          <div class="catalog-card-media">
            <img src="${c.image}" alt="${c.partNumber}" loading="lazy">
          </div>
          <div class="catalog-card-body">
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 class="catalog-part-name">${c.partNumber}</h3>
              <span style="font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-muted);">${c.package}</span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${c.manufacturer}</p>
            <p class="catalog-card-desc">${c.summary}</p>
            
            <div style="margin-top: auto; padding-top: 0.75rem; display: flex; gap: 0.5rem;">
              ${isRef5045 ? `
                <button class="btn-primary" style="flex: 1; text-align: center; padding: 0.45rem 0.75rem; font-size: 0.82rem;" onclick="document.getElementById('tab-case-study').click()">
                  📖 Read Full Case Study
                </button>
              ` : `
                <span style="font-size: 0.8rem; color: var(--text-muted); padding: 0.45rem 0;">
                  ⚠️ ${gotchasCount} Gotchas Documented
                </span>
              `}
              ${c.projectRef ? `
                <a href="${c.projectRef.url}" target="_blank" rel="noopener" class="nav-btn" style="padding: 0.45rem 0.65rem; font-size: 0.8rem;" title="View in KiCanvas">
                  🚀 KiCanvas
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // Initial
  renderCatalog();
})();
