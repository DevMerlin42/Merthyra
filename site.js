(() => {
  "use strict";

  const root = document.documentElement;
  const storedTheme = (() => {
    try { return localStorage.getItem("merthyra-site-theme"); }
    catch { return null; }
  })();
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const forcedTheme = root.dataset.forceTheme === "light" || root.dataset.forceTheme === "dark" ? root.dataset.forceTheme : null;
  const initialTheme = forcedTheme || (storedTheme === "light" || storedTheme === "dark" ? storedTheme : (systemDark ? "dark" : "light"));

  function applyTheme(theme, persist = false) {
    if (forcedTheme) theme = forcedTheme;
    root.dataset.theme = theme;
    if (persist && !forcedTheme) {
      try { localStorage.setItem("merthyra-site-theme", theme); }
      catch { /* Theme still applies when storage is unavailable. */ }
    }
    document.querySelectorAll("[data-theme-toggle]").forEach(button => {
      const dark = theme === "dark";
      button.setAttribute("aria-label", dark ? "Use light appearance" : "Use dark appearance");
      button.setAttribute("title", dark ? "Use light appearance" : "Use dark appearance");
      button.dataset.themeState = theme;
    });
    window.dispatchEvent(new CustomEvent("merthyra-theme-change", { detail: { theme } }));
  }

  applyTheme(initialTheme);

  document.addEventListener("click", event => {
    const themeToggle = event.target.closest("[data-theme-toggle]");
    if (themeToggle) {
      if (!forcedTheme) applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
      return;
    }

    const menuButton = event.target.closest("[data-menu-toggle]");
    if (menuButton) {
      const menu = document.querySelector("[data-site-nav]");
      if (!menu) return;
      const open = menu.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      return;
    }

    const navLink = event.target.closest("[data-site-nav] a");
    if (navLink) {
      const menu = document.querySelector("[data-site-nav]");
      const button = document.querySelector("[data-menu-toggle]");
      menu?.classList.remove("open");
      button?.setAttribute("aria-expanded", "false");
    }
  });

  const header = document.querySelector("[data-site-header]");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 10);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const currentFile = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-site-nav] a").forEach(link => {
    const target = (link.getAttribute("href") || "").split("#")[0] || "index.html";
    if (target === currentFile) link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll("[data-current-year]").forEach(node => {
    node.textContent = String(new Date().getFullYear());
  });

  const revealNodes = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealNodes.forEach(node => observer.observe(node));
  } else {
    revealNodes.forEach(node => node.classList.add("revealed"));
  }


  const controlParallax = document.querySelector("[data-control-parallax]");
  if (controlParallax && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && window.matchMedia("(pointer: fine)").matches) {
    const updateControlParallax = event => {
      const rect = controlParallax.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      controlParallax.style.setProperty("--control-ry", `${x * 3.2}deg`);
      controlParallax.style.setProperty("--control-rx", `${y * -2.4}deg`);
    };
    controlParallax.addEventListener("pointermove", updateControlParallax);
    controlParallax.addEventListener("pointerleave", () => {
      controlParallax.style.setProperty("--control-ry", "0deg");
      controlParallax.style.setProperty("--control-rx", "0deg");
    });
  }

  const consent = document.getElementById("betaConsent");
  const downloadButton = document.getElementById("betaDownload");
  const consentStatus = document.getElementById("betaConsentStatus");
  if (consent && downloadButton && consentStatus) {
    const publicBetaUrl = downloadButton.dataset.betaUrl || "https://testflight.apple.com/join/qUXHpAf5";
    const updateConsent = () => {
      const accepted = consent.checked;
      downloadButton.disabled = !accepted;
      consentStatus.textContent = accepted
        ? "Terms accepted. TestFlight is ready to open."
        : "Review and accept the beta terms to unlock TestFlight.";
    };
    consent.addEventListener("change", updateConsent);
    downloadButton.addEventListener("click", () => {
      if (!consent.checked) return;
      window.open(publicBetaUrl, "_blank", "noopener,noreferrer");
    });
    updateConsent();
  }
})();
