(() => {
  const THEME_KEY = "stratocat-theme";
  const UNIT_KEY = "stratocat-units";
  const THEME_EVENT = "stratocat:theme-changed";
  const UNIT_EVENT = "stratocat:units-changed";
  const DEFAULT_SCHEDULE = {
    status: "scheduled",
    nextLaunchIso: "2026-04-25T10:00:00-07:00",
    nextLaunchLabel: "Saturday, April 25, 2026 at 10:00 AM",
    timezoneLabel: "Arizona MST",
    launchChipLabel: "Mission 3",
    launchChipValue: "Countdown",
    launchChipHref: "countdown.html"
  };

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

  function getLaunchSchedule() {
    const schedule = window.StratocatData && window.StratocatData.schedule ? window.StratocatData.schedule : null;
    return {
      ...DEFAULT_SCHEDULE,
      ...(schedule || {})
    };
  }

  function getLaunchMissionLabel() {
    const schedule = getLaunchSchedule();
    if (schedule.launchChipLabel) {
      return schedule.launchChipLabel;
    }

    const missions = window.StratocatData && Array.isArray(window.StratocatData.missions) ? window.StratocatData.missions : [];
    const scheduledMission = missions.find((mission) => mission.status === "scheduled");
    return scheduledMission && scheduledMission.missionCode ? scheduledMission.missionCode : "Next Launch";
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function formatCountdown(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `T-${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
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
    themeButton.className = "pref-toggle pref-toggle-theme";
    themeButton.setAttribute("data-theme-toggle", "true");

    const unitsButton = document.createElement("button");
    unitsButton.type = "button";
    unitsButton.className = "pref-toggle pref-toggle-units";
    unitsButton.setAttribute("data-units-toggle", "true");

    controls.append(themeButton, unitsButton);

    nav.appendChild(controls);

    function themeIcon(theme) {
      if (theme === "dark") {
        return `
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20 15a8 8 0 1 1-9-9 6 6 0 0 0 9 9z"></path>
          </svg>
        `;
      }

      return `
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v3M12 19v3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M2 12h3M19 12h3M4.9 19.1l2.2-2.2M16.9 7.1l2.2-2.2"></path>
        </svg>
      `;
    }

    const unitsIcon = `
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="8" width="18" height="8" rx="2"></rect>
        <path d="M7 8v3M10 8v2M13 8v3M16 8v2"></path>
      </svg>
    `;

    function refreshLabels() {
      const themeLabel = currentTheme === "dark" ? "Dark" : "Light";
      const unitsLabel = currentUnits === "si" ? "SI" : "Imperial";

      themeButton.innerHTML = `
        <span class="pref-icon">${themeIcon(currentTheme)}</span>
        <span class="pref-text">
          <span class="pref-label">Theme</span>
          <span class="pref-value">${themeLabel}</span>
        </span>
      `;

      unitsButton.innerHTML = `
        <span class="pref-icon">${unitsIcon}</span>
        <span class="pref-text">
          <span class="pref-label">Units</span>
          <span class="pref-value">${unitsLabel}</span>
        </span>
      `;

      themeButton.setAttribute("aria-label", `Switch theme (current: ${themeLabel})`);
      unitsButton.setAttribute("aria-label", `Switch units (current: ${unitsLabel})`);
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

  function setupLaunchCountdownChip() {
    const nav = document.querySelector(".nav");
    if (!nav || nav.querySelector("[data-launch-chip]")) return;

    const brand = nav.querySelector(".brand");
    if (!brand) return;
    const schedule = getLaunchSchedule();

    const chip = document.createElement("a");
    chip.className = "launch-chip";
    chip.setAttribute("data-launch-chip", "true");
    chip.setAttribute("href", schedule.launchChipHref || "countdown.html");

    const dot = document.createElement("span");
    dot.className = "launch-chip-dot";
    dot.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "launch-chip-label";
    label.textContent = getLaunchMissionLabel();

    const value = document.createElement("span");
    value.className = "launch-chip-value";

    chip.append(dot, label, value);

    const controls = nav.querySelector("[data-pref-controls]");
    if (controls) {
      controls.insertBefore(chip, controls.firstChild);
    } else {
      nav.insertBefore(chip, brand.nextSibling);
    }

    if (schedule.status === "inprogress") {
      chip.title = `Open live tracking for ${getLaunchMissionLabel()}`;
      chip.setAttribute("aria-label", `Open live tracking for ${getLaunchMissionLabel()}`);
    } else {
      chip.title = `Open launch page for ${schedule.nextLaunchLabel} (${schedule.timezoneLabel})`;
      chip.setAttribute("aria-label", `Open launch page for ${schedule.nextLaunchLabel}`);
    }

    if (schedule.status === "inprogress") {
      value.textContent = schedule.launchChipValue || "Live";
      chip.classList.add("launch-live");
      return;
    }

    if (schedule.status === "completed" || !schedule.nextLaunchIso) {
      value.textContent = schedule.launchChipValue || "Complete";
      return;
    }

    const target = new Date(schedule.nextLaunchIso).getTime();

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        value.textContent = "Window Open";
        chip.classList.add("launch-live");
        return;
      }

      value.textContent = formatCountdown(diff);
      chip.classList.remove("launch-live");
    }

    tick();
    window.setInterval(tick, 1000);
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
    setupPreferenceControls();
    setupLaunchCountdownChip();
    setupMobileMenu();
  });
})();
