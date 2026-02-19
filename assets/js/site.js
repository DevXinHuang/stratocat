(() => {
  const THEME_KEY = "stratocat-theme";
  const UNIT_KEY = "stratocat-units";
  const THEME_EVENT = "stratocat:theme-changed";
  const UNIT_EVENT = "stratocat:units-changed";

  function readStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_error) {
      // Ignore storage failures (private mode, locked-down browsers, etc.)
    }
  }

  function normalizeTheme(value) {
    return value === "dark" || value === "light" ? value : null;
  }

  function normalizeUnits(value) {
    return value === "imperial" || value === "si" ? value : null;
  }

  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  let currentTheme = normalizeTheme(readStorage(THEME_KEY)) || getSystemTheme();
  let currentUnits = normalizeUnits(readStorage(UNIT_KEY)) || "si";

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
  }

  function applyUnits(units) {
    currentUnits = units;
    document.documentElement.setAttribute("data-units", units);
    window.dispatchEvent(new CustomEvent(UNIT_EVENT, { detail: { units } }));
  }

  function setTheme(theme, persist = true) {
    const normalized = normalizeTheme(theme);
    if (!normalized) return;
    if (persist) {
      writeStorage(THEME_KEY, normalized);
    }
    applyTheme(normalized);
  }

  function setUnits(units, persist = true) {
    const normalized = normalizeUnits(units);
    if (!normalized) return;
    if (persist) {
      writeStorage(UNIT_KEY, normalized);
    }
    applyUnits(normalized);
  }

  function toggleTheme() {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }

  function toggleUnits() {
    setUnits(currentUnits === "si" ? "imperial" : "si");
  }

  function setActiveNav() {
    const page = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href");
      const active = href === page || (page === "" && href === "index.html");
      if (active) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function setupMobileMenu() {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const menu = document.querySelector("[data-menu]");
    if (!menuButton || !menu) return;

    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menu.classList.toggle("menu-open", !expanded);
    });
  }

  function setupPreferenceControls() {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    const existing = nav.querySelector("[data-pref-controls]");
    if (existing) {
      return;
    }

    const controls = document.createElement("div");
    controls.className = "nav-controls";
    controls.setAttribute("data-pref-controls", "true");

    const themeButton = document.createElement("button");
    themeButton.type = "button";
    themeButton.className = "pref-toggle";
    themeButton.setAttribute("data-theme-toggle", "true");

    const unitsButton = document.createElement("button");
    unitsButton.type = "button";
    unitsButton.className = "pref-toggle";
    unitsButton.setAttribute("data-units-toggle", "true");

    controls.append(themeButton, unitsButton);

    const menuButton = nav.querySelector("[data-menu-toggle]");
    if (menuButton) {
      nav.insertBefore(controls, menuButton);
    } else {
      nav.appendChild(controls);
    }

    function refreshLabels() {
      themeButton.textContent = `Theme: ${currentTheme === "dark" ? "Dark" : "Light"}`;
      unitsButton.textContent = `Units: ${currentUnits === "si" ? "SI" : "Imperial"}`;
      themeButton.setAttribute("aria-label", "Toggle light and dark theme");
      unitsButton.setAttribute("aria-label", "Toggle SI and imperial units");
    }

    themeButton.addEventListener("click", () => {
      toggleTheme();
      refreshLabels();
    });

    unitsButton.addEventListener("click", () => {
      toggleUnits();
      refreshLabels();
    });

    window.addEventListener(THEME_EVENT, refreshLabels);
    window.addEventListener(UNIT_EVENT, refreshLabels);
    refreshLabels();
  }

  function syncWithSystemThemeWhenNotOverridden() {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const persisted = normalizeTheme(readStorage(THEME_KEY));
      if (!persisted) {
        applyTheme(getSystemTheme());
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onChange);
    }
  }

  // Initialize theme and units before the page renders component content.
  applyTheme(currentTheme);
  applyUnits(currentUnits);
  syncWithSystemThemeWhenNotOverridden();

  window.StratocatPrefs = {
    getTheme: () => currentTheme,
    setTheme,
    toggleTheme,
    getUnits: () => currentUnits,
    setUnits,
    toggleUnits
  };

  document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();
    setupMobileMenu();
    setupPreferenceControls();
  });
})();
