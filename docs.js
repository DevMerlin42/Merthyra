(() => {
  "use strict";
  const pages = Array.from(document.querySelectorAll("[data-doc-page]"));
  const links = Array.from(document.querySelectorAll("[data-doc-target]"));
  const pageIDs = new Set(pages.map(page => page.id));
  const search = document.getElementById("docsSearch");
  const results = document.getElementById("searchResults");
  const sidebar = document.getElementById("docsSidebar");
  const mobileToggle = document.getElementById("docsMobileToggle");

  function activate(id, updateHash = true, shouldScroll = true) {
    if (!pageIDs.has(id)) id = "welcome";
    pages.forEach(page => { page.hidden = page.id !== id; });
    links.forEach(link => link.classList.toggle("active", link.dataset.docTarget === id));
    if (updateHash && location.hash !== `#${id}`) history.pushState({ doc: id }, "", `#${id}`);
    if (shouldScroll) document.querySelector(".docs-main")?.scrollIntoView({ block: "start" });
    if (window.innerWidth <= 840) {
      sidebar?.classList.remove("open");
      mobileToggle?.setAttribute("aria-expanded", "false");
    }
  }

  links.forEach(link => link.addEventListener("click", event => {
    event.preventDefault();
    activate(link.dataset.docTarget || "welcome");
  }));

  function pageSearchIndex(page) {
    return `${page.dataset.title || ""} ${page.textContent || ""}`.toLowerCase();
  }

  function renderResults(query) {
    if (!results) return;
    const value = query.trim().toLowerCase();
    if (!value) { results.classList.remove("open"); results.innerHTML = ""; return; }
    const matches = pages.filter(page => pageSearchIndex(page).includes(value)).slice(0, 10);
    results.innerHTML = matches.length ? matches.map(page => {
      const text = (page.textContent || "").replace(/\s+/g, " ").trim();
      const lower = text.toLowerCase();
      const start = Math.max(0, lower.indexOf(value) - 42);
      const snippet = text.slice(start, start + 120);
      return `<a class="search-result" href="#${page.id}" data-result-id="${page.id}"><b>${page.dataset.title}</b><span>${snippet}</span></a>`;
    }).join("") : `<div class="search-result"><b>No matches</b><span>Try a broader feature or workflow name.</span></div>`;
    results.classList.add("open");
  }

  search?.addEventListener("input", () => renderResults(search.value));
  results?.addEventListener("click", event => {
    const target = event.target.closest("[data-result-id]");
    if (!target) return;
    event.preventDefault();
    activate(target.dataset.resultId);
    search.value = "";
    renderResults("");
  });
  document.addEventListener("click", event => {
    if (!event.target.closest(".docs-search")) results?.classList.remove("open");
  });
  document.addEventListener("keydown", event => {
    if (event.key === "/" && !/input|textarea/i.test(document.activeElement?.tagName || "")) {
      event.preventDefault(); search?.focus();
    }
    if (event.key === "Escape") { results?.classList.remove("open"); search?.blur(); }
  });
  mobileToggle?.addEventListener("click", () => {
    const open = sidebar?.classList.toggle("open") || false;
    mobileToggle.setAttribute("aria-expanded", String(open));
  });
  window.addEventListener("hashchange", () => {
    const id = location.hash.slice(1);
    if (pageIDs.has(id)) activate(id, false);
  });

  const initial = location.hash.slice(1);
  activate(pageIDs.has(initial) ? initial : "welcome", false, Boolean(initial));
})();
