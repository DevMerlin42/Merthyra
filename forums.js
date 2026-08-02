(() => {
  "use strict";
  const REPO = "DevMerlin42/Merthyra";
  const REPO_ID = "R_kgDOTL1QqQ";
  const tabs = {
    general: { number: "1", description: "<strong>General.</strong> Say hello, ask questions, and talk about anything Merthyra." },
    feedback: { number: "4", description: "<strong>Feedback.</strong> Share what feels great, what feels confusing, and what would make Merthyra better." },
    bugs: { number: "5", description: "<strong>Bug Reports.</strong> Include your device, OS version, app build, and exact steps to reproduce the issue." },
    features: { number: "3", description: "<strong>Feature Requests.</strong> Explain the problem, who it helps, and how the feature should behave across Apple platforms." }
  };
  const mount = document.getElementById("giscusMount");
  const description = document.getElementById("forumDesc");
  const buttons = Array.from(document.querySelectorAll("[data-forum-tab]"));
  let current = "";

  const giscusTheme = () => document.documentElement.dataset.theme === "dark" ? "dark_dimmed" : "light";

  function clearLoading() { mount?.querySelector(".forum-loading")?.remove(); }

  function mountGiscus(key) {
    if (!mount) return;
    const config = tabs[key];
    mount.innerHTML = '<div class="forum-loading"><span class="spinner"></span>Loading discussion…</div>';
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", REPO);
    script.setAttribute("data-repo-id", REPO_ID);
    script.setAttribute("data-mapping", "number");
    script.setAttribute("data-term", config.number);
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-theme", giscusTheme());
    script.setAttribute("data-lang", "en");
    script.crossOrigin = "anonymous";
    script.async = true;
    mount.appendChild(script);
    const observer = new MutationObserver(() => {
      if (mount.querySelector("iframe.giscus-frame")) { clearLoading(); observer.disconnect(); }
    });
    observer.observe(mount, { childList: true, subtree: true });
    window.setTimeout(clearLoading, 10000);
  }

  function activate(key, replace = false) {
    if (!tabs[key]) key = "general";
    if (current === key) return;
    current = key;
    buttons.forEach(button => {
      const active = button.dataset.forumTab === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (description) description.innerHTML = tabs[key].description;
    mountGiscus(key);
    const hash = `#${key}`;
    if (replace) history.replaceState({ forum: key }, "", hash);
    else history.pushState({ forum: key }, "", hash);
  }

  buttons.forEach(button => button.addEventListener("click", () => activate(button.dataset.forumTab)));
  window.addEventListener("hashchange", () => activate(location.hash.slice(1), true));
  window.addEventListener("merthyra-theme-change", event => {
    const iframe = document.querySelector("iframe.giscus-frame");
    iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme: event.detail.theme === "dark" ? "dark_dimmed" : "light" } } }, "https://giscus.app");
  });
  window.addEventListener("message", event => {
    if (event.origin === "https://giscus.app") clearLoading();
  });

  activate(tabs[location.hash.slice(1)] ? location.hash.slice(1) : "general", true);
})();
