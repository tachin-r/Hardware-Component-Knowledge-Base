// Hardware Component Knowledge Base App Logic (Clean Light Theme with Image Support)

(function() {
  'use strict';

  const STORAGE_KEY = "hw_gotchas_custom_components_v2";

  // State
  let customComponents = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) customComponents = JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load custom components from localStorage", e);
  }

  // Combine initial static data with user-added entries
  let allComponents = [...customComponents, ...INITIAL_COMPONENTS];

  let searchQuery = "";
  let activeCategory = "All";
  let activeTag = null;
  let currentUploadedImage = "";

  // DOM Elements
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const categoryFiltersEl = document.getElementById("category-filters");
  const tagFiltersEl = document.getElementById("tag-filters");
  const componentsGridEl = document.getElementById("components-grid");
  const resultsCountEl = document.getElementById("results-count");
  const noResultsEl = document.getElementById("no-results");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");

  const statTotalParts = document.getElementById("stat-total-parts");
  const statTotalGotchas = document.getElementById("stat-total-gotchas");

  // Detail Modal
  const detailModal = document.getElementById("detail-modal");
  const detailModalBody = document.getElementById("detail-modal-body");
  const closeDetailModalBtn = document.getElementById("close-detail-modal");

  // Add Modal
  const addModal = document.getElementById("add-modal");
  const openAddModalBtn = document.getElementById("open-add-modal");
  const closeAddModalBtn = document.getElementById("close-add-modal");
  const cancelAddBtn = document.getElementById("cancel-add-btn");
  const addGotchaForm = document.getElementById("add-gotcha-form");
  const formImageFile = document.getElementById("form-image-file");
  const formImageUrl = document.getElementById("form-image-url");
  const formImagePreview = document.getElementById("form-image-preview");

  // Export Modal
  const exportModal = document.getElementById("export-modal");
  const openExportModalBtn = document.getElementById("open-export-modal");
  const closeExportModalBtn = document.getElementById("close-export-modal");
  const exportTextarea = document.getElementById("export-textarea");
  const copyMarkdownBtn = document.getElementById("copy-markdown-btn");
  const downloadMarkdownBtn = document.getElementById("download-markdown-btn");

  // Helper: Escape HTML
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Initialize
  function init() {
    setupEventListeners();
    updateStats();
    renderCategoryFilters();
    renderTagFilters();
    renderGrid();
  }

  // Update Stats
  function updateStats() {
    statTotalParts.textContent = allComponents.length;
    let totalGotchas = 0;
    allComponents.forEach(c => {
      if (c.gotchas && Array.isArray(c.gotchas)) totalGotchas += c.gotchas.length;
    });
    statTotalGotchas.textContent = totalGotchas;
  }

  // Extract Categories
  function getCategories() {
    const cats = new Set();
    allComponents.forEach(c => {
      if (c.category) cats.add(c.category);
    });
    return ["All", ...Array.from(cats).sort()];
  }

  // Extract Tags
  function getTags() {
    const tagCount = new Map();
    allComponents.forEach(c => {
      if (c.tags && Array.isArray(c.tags)) {
        c.tags.forEach(t => {
          tagCount.set(t, (tagCount.get(t) || 0) + 1);
        });
      }
    });
    return Array.from(tagCount.keys());
  }

  // Render Category Filters
  function renderCategoryFilters() {
    const categories = getCategories();
    categoryFiltersEl.innerHTML = categories.map(cat => {
      const isActive = cat === activeCategory;
      let count = 0;
      if (cat === "All") count = allComponents.length;
      else count = allComponents.filter(c => c.category === cat).length;
      return `<button class="filter-chip ${isActive ? 'active' : ''}" data-cat="${escapeHtml(cat)}">${escapeHtml(cat)} (${count})</button>`;
    }).join("");
  }

  // Render Tag Filters
  function renderTagFilters() {
    const tags = getTags();
    tagFiltersEl.innerHTML = tags.map(tag => {
      const isActive = tag === activeTag;
      return `<button class="tag-pill ${isActive ? 'active' : ''}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`;
    }).join("");
  }

  // Filter Components
  function getFilteredComponents() {
    return allComponents.filter(c => {
      if (activeCategory !== "All" && c.category !== activeCategory) {
        return false;
      }
      if (activeTag && (!c.tags || !c.tags.includes(activeTag))) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const partMatch = (c.partNumber || "").toLowerCase().includes(q);
        const mfrMatch = (c.manufacturer || "").toLowerCase().includes(q);
        const summaryMatch = (c.summary || "").toLowerCase().includes(q);
        const pkgMatch = (c.package || "").toLowerCase().includes(q);
        
        let gotchaMatch = false;
        if (c.gotchas && Array.isArray(c.gotchas)) {
          gotchaMatch = c.gotchas.some(g => 
            (g.title || "").toLowerCase().includes(q) ||
            (g.symptom || "").toLowerCase().includes(q) ||
            (g.rootCause || "").toLowerCase().includes(q) ||
            (g.fix || "").toLowerCase().includes(q)
          );
        }
        
        let tagMatch = false;
        if (c.tags && Array.isArray(c.tags)) {
          tagMatch = c.tags.some(t => t.toLowerCase().includes(q));
        }

        if (!partMatch && !mfrMatch && !summaryMatch && !pkgMatch && !gotchaMatch && !tagMatch) {
          return false;
        }
      }
      return true;
    });
  }

  // Render Grid
  function renderGrid() {
    const filtered = getFilteredComponents();
    
    resultsCountEl.textContent = `Showing ${filtered.length} of ${allComponents.length} components`;

    if (filtered.length === 0) {
      componentsGridEl.innerHTML = "";
      noResultsEl.style.display = "block";
      return;
    }

    noResultsEl.style.display = "none";
    componentsGridEl.innerHTML = filtered.map(c => {
      const severityClass = c.severity === "Critical" ? "badge-critical" : 
                            c.severity === "High" ? "badge-high" : "badge-info";
      
      const firstGotcha = c.gotchas && c.gotchas[0] ? c.gotchas[0] : null;

      const tagsHtml = (c.tags || []).slice(0, 3).map(t => 
        `<span class="tag-pill" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</span>`
      ).join("");

      return `
        <article class="component-card" data-id="${escapeHtml(c.id)}">
          ${c.image ? `
            <div class="card-media" title="Click to view details">
              <img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.partNumber)}" loading="lazy">
            </div>
          ` : `
            <div class="card-media" style="background: #f1f5f9; color: #94a3b8; font-size: 2rem;">
              <span>⚡</span>
            </div>
          `}

          <div class="card-body">
            <div class="card-top">
              <div class="part-title-group">
                <h3 class="part-number">${escapeHtml(c.partNumber)}</h3>
                <span class="part-mfr">${escapeHtml(c.manufacturer || "Generic")}</span>
              </div>
              <span class="badge ${severityClass}">⚠️ ${escapeHtml(c.severity || "Warning")}</span>
            </div>

            <div class="card-specs-row">
              ${c.category ? `<span class="spec-chip">🏷️ ${escapeHtml(c.category)}</span>` : ''}
              ${c.package ? `<span class="spec-chip">📦 ${escapeHtml(c.package)}</span>` : ''}
              ${c.rating ? `<span class="spec-chip">⚡ ${escapeHtml(c.rating)}</span>` : ''}
            </div>

            <p class="card-summary">${escapeHtml(c.summary || "")}</p>

            ${firstGotcha ? `
              <div class="card-gotchas-box">
                <span class="card-gotchas-title">⚠️ ${escapeHtml(firstGotcha.title)}</span>
                <div class="gotcha-item-preview">
                  <span>${escapeHtml(firstGotcha.symptom)}</span>
                </div>
              </div>
            ` : ''}

            <div class="card-tags">
              ${tagsHtml}
            </div>

            <div class="card-actions">
              <button class="btn btn-secondary btn-card-inspect inspect-btn" data-id="${escapeHtml(c.id)}">
                🔍 Details
              </button>
              ${c.projectRef ? `
                <a href="${escapeHtml(c.projectRef.url)}" target="_blank" rel="noopener" class="btn-kicanvas" title="Open KiCanvas Circuit">
                  🚀 KiCanvas
                </a>
              ` : ''}
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  // Open Detail Modal
  function openDetailModal(componentId) {
    const comp = allComponents.find(c => c.id === componentId);
    if (!comp) return;

    const severityClass = comp.severity === "Critical" ? "badge-critical" : 
                          comp.severity === "High" ? "badge-high" : "badge-info";

    const gotchasHtml = (comp.gotchas || []).map(g => `
      <div class="gotcha-detail-card">
        <h4 class="gotcha-detail-title">⚠️ ${escapeHtml(g.title)}</h4>
        
        <div class="gotcha-block">
          <span class="gotcha-label">Observed Symptom</span>
          <p class="gotcha-text">${escapeHtml(g.symptom)}</p>
        </div>

        <div class="gotcha-block">
          <span class="gotcha-label">Root Cause & Physics</span>
          <p class="gotcha-text">${escapeHtml(g.rootCause)}</p>
        </div>

        <div class="gotcha-block gotcha-fix-block">
          <span class="gotcha-label">Verified Fix & Rule</span>
          <p class="gotcha-text">${escapeHtml(g.fix)}</p>
        </div>
      </div>
    `).join("");

    const pinoutHtml = comp.pinout && Array.isArray(comp.pinout) && comp.pinout.length > 0 ? `
      <div class="detail-section">
        <h3 class="detail-section-title">📐 Key Pinout & Schematic Connections</h3>
        <table class="pinout-table">
          <thead>
            <tr>
              <th>Pin</th>
              <th>Name</th>
              <th>Function / Connection</th>
            </tr>
          </thead>
          <tbody>
            ${comp.pinout.map(p => `
              <tr>
                <td class="pin-num">${escapeHtml(p.pin)}</td>
                <td style="font-family: var(--font-mono); font-weight: 600;">${escapeHtml(p.name)}</td>
                <td>${escapeHtml(p.role)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    ` : '';

    const adviceHtml = comp.prototypingAdvice ? `
      <div class="detail-section">
        <h3 class="detail-section-title">🧪 Bench Prototyping Rules</h3>
        <div class="advice-comparison-grid">
          <div class="advice-card">
            <h4 class="advice-title" style="color: #b45309;">🥖 Breadboard Prototyping Rule</h4>
            <p class="advice-text">${escapeHtml(comp.prototypingAdvice.breadboard || "No specific breadboard warnings.")}</p>
          </div>
          <div class="advice-card">
            <h4 class="advice-title" style="color: var(--primary);">🟢 Final PCB Layout Rule</h4>
            <p class="advice-text">${escapeHtml(comp.prototypingAdvice.pcb || "Standard PCB layout practices apply.")}</p>
          </div>
        </div>
      </div>
    ` : '';

    const projectRefHtml = comp.projectRef ? `
      <div class="detail-section" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: var(--radius-md); padding: 1rem 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h4 style="font-family: var(--font-heading); font-size: 0.95rem; color: #166534;">🔗 Project Circuit: ${escapeHtml(comp.projectRef.name)}</h4>
            <p style="font-size: 0.85rem; color: #15803d; margin-top: 0.15rem;">View the active KiCad schematic and board layout in KiCanvas.</p>
          </div>
          <a href="${escapeHtml(comp.projectRef.url)}" target="_blank" rel="noopener" class="btn btn-primary" style="font-size: 0.82rem;">
            🚀 Open KiCanvas Viewer
          </a>
        </div>
      </div>
    ` : '';

    detailModalBody.innerHTML = `
      ${comp.image ? `
        <div class="detail-top-image">
          <img src="${escapeHtml(comp.image)}" alt="${escapeHtml(comp.partNumber)}">
        </div>
      ` : ''}

      <div class="detail-header-block">
        <div>
          <h2 class="detail-part-name">${escapeHtml(comp.partNumber)}</h2>
          <p style="color: var(--text-muted); font-size: 0.92rem; margin-top: 0.2rem;">${escapeHtml(comp.manufacturer || "Generic")} • ${escapeHtml(comp.package || "")} • ${escapeHtml(comp.rating || "")}</p>
          <div style="display: flex; gap: 0.4rem; margin-top: 0.6rem; flex-wrap: wrap;">
            <span class="badge ${severityClass}">⚠️ ${escapeHtml(comp.severity || "Warning")}</span>
            <span class="spec-chip">🏷️ ${escapeHtml(comp.category || "General")}</span>
            ${comp.status ? `<span class="spec-chip">✓ ${escapeHtml(comp.status)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h3 class="detail-section-title">📋 Overview</h3>
        <p style="color: var(--text-secondary); line-height: 1.6;">${escapeHtml(comp.summary || "")}</p>
      </div>

      <div class="detail-section">
        <h3 class="detail-section-title">⚠️ Documented Traps & Gotchas</h3>
        ${gotchasHtml}
      </div>

      ${adviceHtml}
      ${pinoutHtml}
      ${projectRefHtml}
    `;

    detailModal.classList.add("open");
    detailModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeDetailModal() {
    detailModal.classList.remove("open");
    detailModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Add Gotcha Modal Handlers
  function openAddModal() {
    currentUploadedImage = "";
    formImagePreview.innerHTML = '<span class="image-preview-placeholder">No image selected</span>';
    addModal.classList.add("open");
    addModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeAddModal() {
    addModal.classList.remove("open");
    addModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    addGotchaForm.reset();
  }

  // Export Modal Handlers
  function generateMarkdown() {
    let md = `# Hardware Component Knowledge Base & Lab Gotchas Report\n\n`;
    md += `*Generated automatically from Hardware Component Knowledge Base*\n\n`;
    md += `Total Components: ${allComponents.length}\n\n`;
    md += `---\n\n`;

    allComponents.forEach((c, idx) => {
      md += `## ${idx + 1}. ${c.partNumber} (${c.manufacturer || "Generic"})\n\n`;
      md += `- **Category**: ${c.category || "N/A"}\n`;
      md += `- **Package**: ${c.package || "N/A"}\n`;
      md += `- **Rating/Specs**: ${c.rating || "N/A"}\n`;
      md += `- **Severity**: ${c.severity || "Warning"}\n\n`;
      md += `### Summary\n${c.summary || "N/A"}\n\n`;

      if (c.gotchas && c.gotchas.length > 0) {
        md += `### ⚠️ Documented Gotchas\n\n`;
        c.gotchas.forEach((g, gIdx) => {
          md += `#### ${gIdx + 1}) ${g.title}\n`;
          md += `- **Observed Symptom**: ${g.symptom}\n`;
          md += `- **Physics / Root Cause**: ${g.rootCause}\n`;
          md += `- **Verified Fix**: ${g.fix}\n\n`;
        });
      }

      if (c.prototypingAdvice) {
        md += `### 🧪 Prototyping Advice\n`;
        if (c.prototypingAdvice.breadboard) md += `- **Breadboard Rule**: ${c.prototypingAdvice.breadboard}\n`;
        if (c.prototypingAdvice.pcb) md += `- **PCB Layout Rule**: ${c.prototypingAdvice.pcb}\n`;
        md += `\n`;
      }

      if (c.projectRef) {
        md += `**Real Project Reference**: [${c.projectRef.name}](${c.projectRef.url})\n\n`;
      }

      md += `---\n\n`;
    });

    return md;
  }

  function openExportModal() {
    const md = generateMarkdown();
    exportTextarea.value = md;
    exportModal.classList.add("open");
    exportModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeExportModal() {
    exportModal.classList.remove("open");
    exportModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Search input
    searchInput.addEventListener("input", e => {
      searchQuery = e.target.value;
      clearSearchBtn.style.display = searchQuery ? "block" : "none";
      renderGrid();
    });

    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchQuery = "";
      clearSearchBtn.style.display = "none";
      searchInput.focus();
      renderGrid();
    });

    // Category click
    categoryFiltersEl.addEventListener("click", e => {
      const chip = e.target.closest(".filter-chip");
      if (!chip) return;
      activeCategory = chip.dataset.cat;
      renderCategoryFilters();
      renderGrid();
    });

    // Tag click from toolbar
    tagFiltersEl.addEventListener("click", e => {
      const pill = e.target.closest(".tag-pill");
      if (!pill) return;
      const tag = pill.dataset.tag;
      activeTag = (activeTag === tag) ? null : tag;
      renderTagFilters();
      renderGrid();
    });

    // Grid clicks
    componentsGridEl.addEventListener("click", e => {
      const pill = e.target.closest(".tag-pill");
      if (pill) {
        e.stopPropagation();
        const tag = pill.dataset.tag;
        activeTag = tag;
        renderTagFilters();
        renderGrid();
        return;
      }

      const inspectBtn = e.target.closest(".inspect-btn");
      if (inspectBtn) {
        openDetailModal(inspectBtn.dataset.id);
        return;
      }

      const card = e.target.closest(".component-card");
      if (card && !e.target.closest(".btn-kicanvas")) {
        openDetailModal(card.dataset.id);
      }
    });

    // Reset filters
    resetFiltersBtn.addEventListener("click", () => {
      searchQuery = "";
      searchInput.value = "";
      clearSearchBtn.style.display = "none";
      activeCategory = "All";
      activeTag = null;
      renderCategoryFilters();
      renderTagFilters();
      renderGrid();
    });

    // File input change for image upload
    formImageFile.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = ev => {
        currentUploadedImage = ev.target.result;
        formImagePreview.innerHTML = `<img src="${currentUploadedImage}" alt="Uploaded Preview">`;
        formImageUrl.value = ""; // clear URL input if file is chosen
      };
      reader.readAsDataURL(file);
    });

    // Image URL input change
    formImageUrl.addEventListener("input", e => {
      const url = e.target.value.trim();
      if (url) {
        currentUploadedImage = url;
        formImagePreview.innerHTML = `<img src="${escapeHtml(url)}" alt="URL Preview" onerror="this.src=''; this.alt='Failed to load image';">`;
      } else {
        currentUploadedImage = "";
        formImagePreview.innerHTML = '<span class="image-preview-placeholder">No image selected</span>';
      }
    });

    // Modal close buttons
    closeDetailModalBtn.addEventListener("click", closeDetailModal);
    detailModal.addEventListener("click", e => {
      if (e.target === detailModal) closeDetailModal();
    });

    openAddModalBtn.addEventListener("click", openAddModal);
    closeAddModalBtn.addEventListener("click", closeAddModal);
    cancelAddBtn.addEventListener("click", closeAddModal);
    addModal.addEventListener("click", e => {
      if (e.target === addModal) closeAddModal();
    });

    openExportModalBtn.addEventListener("click", openExportModal);
    closeExportModalBtn.addEventListener("click", closeExportModal);
    exportModal.addEventListener("click", e => {
      if (e.target === exportModal) closeExportModal();
    });

    // Copy / Download Markdown
    copyMarkdownBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(exportTextarea.value);
        copyMarkdownBtn.textContent = "✓ Copied to Clipboard!";
        setTimeout(() => { copyMarkdownBtn.textContent = "📋 Copy to Clipboard"; }, 2000);
      } catch (err) {
        exportTextarea.select();
        document.execCommand("copy");
        copyMarkdownBtn.textContent = "✓ Copied!";
        setTimeout(() => { copyMarkdownBtn.textContent = "📋 Copy to Clipboard"; }, 2000);
      }
    });

    downloadMarkdownBtn.addEventListener("click", () => {
      const text = exportTextarea.value;
      const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Hardware_Gotchas_Knowledge_Base.md";
      a.click();
      URL.revokeObjectURL(url);
    });

    // Form submit: Add new gotcha
    addGotchaForm.addEventListener("submit", e => {
      e.preventDefault();

      const partNumber = document.getElementById("form-part-number").value.trim();
      const manufacturer = document.getElementById("form-manufacturer").value.trim();
      const category = document.getElementById("form-category").value;
      const pkg = document.getElementById("form-package").value.trim();
      const severity = document.getElementById("form-severity").value;
      const summary = document.getElementById("form-summary").value.trim();

      const gotchaTitle = document.getElementById("form-gotcha-title").value.trim();
      const symptom = document.getElementById("form-symptom").value.trim();
      const rootCause = document.getElementById("form-root-cause").value.trim();
      const fix = document.getElementById("form-fix").value.trim();

      const bbAdvice = document.getElementById("form-bb-advice").value.trim();
      const pcbAdvice = document.getElementById("form-pcb-advice").value.trim();
      const rawTags = document.getElementById("form-tags").value.trim();

      const tags = rawTags ? rawTags.split(",").map(t => {
        let clean = t.trim();
        if (clean && !clean.startsWith("#")) clean = "#" + clean;
        return clean;
      }).filter(Boolean) : [];

      const newComp = {
        id: "custom_" + Date.now(),
        partNumber: partNumber,
        manufacturer: manufacturer || "Generic",
        category: category,
        package: pkg || "N/A",
        rating: "Custom Bench Finding",
        image: currentUploadedImage || "",
        tags: tags.length > 0 ? tags : ["#BenchFinding"],
        status: "Lab Verified",
        severity: severity,
        summary: summary,
        gotchas: [
          {
            title: gotchaTitle,
            severity: severity === "Critical" ? "Danger" : severity === "High" ? "Warning" : "Info",
            symptom: symptom,
            rootCause: rootCause,
            fix: fix
          }
        ],
        prototypingAdvice: {
          breadboard: bbAdvice || "Follow standard breadboard layout precautions.",
          pcb: pcbAdvice || "Implement solid ground plane and tight decoupling."
        }
      };

      customComponents.unshift(newComp);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customComponents));
      } catch (err) {
        console.error("Failed to save to localStorage", err);
      }

      allComponents = [...customComponents, ...INITIAL_COMPONENTS];
      updateStats();
      renderCategoryFilters();
      renderTagFilters();
      renderGrid();

      closeAddModal();
    });

    // Keyboard Shortcuts
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        if (detailModal.classList.contains("open")) closeDetailModal();
        if (addModal.classList.contains("open")) closeAddModal();
        if (exportModal.classList.contains("open")) closeExportModal();
      }

      if (e.key === "/" && document.activeElement !== searchInput && !detailModal.classList.contains("open") && !addModal.classList.contains("open")) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // Run
  init();
})();
