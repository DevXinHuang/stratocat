(() => {
  const data = window.StratocatData;
  if (!data || !Array.isArray(data.missions)) {
    return;
  }

  const FEET_PER_METER = 3.28084;
  const MILES_PER_KM = 0.621371;

  const STATUS_CLASS = {
    completed: "status-completed",
    scheduled: "status-scheduled",
    inprogress: "status-inprogress"
  };

  function statusLabel(status) {
    if (status === "completed") return "Completed";
    if (status === "scheduled") return "Scheduled";
    if (status === "inprogress") return "In Progress";
    return status || "Unknown";
  }

  function currentUnits() {
    if (window.StratocatPrefs && typeof window.StratocatPrefs.getUnits === "function") {
      return window.StratocatPrefs.getUnits();
    }
    return "si";
  }

  function formatInt(value) {
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function formatFixed(value, decimals = 1) {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  function padClock(value) {
    return String(value).padStart(2, "0");
  }

  function formatAltitude(meters, fallback = "Pending") {
    if (meters === null || meters === undefined) {
      return fallback;
    }

    const feet = Math.round(meters * FEET_PER_METER);
    if (currentUnits() === "imperial") {
      return `${formatInt(feet)} ft (${formatInt(meters)} m)`;
    }

    return `${formatInt(meters)} m (${formatInt(feet)} ft)`;
  }

  function formatDistance(km, fallback = "Pending") {
    if (km === null || km === undefined) {
      return fallback;
    }

    const miles = km * MILES_PER_KM;
    if (currentUnits() === "imperial") {
      return `${formatFixed(miles, 1)} mi (${formatInt(km)} km)`;
    }

    return `${formatInt(km)} km (${formatFixed(miles, 1)} mi)`;
  }

  function formatDuration(hours, fallback = "Pending") {
    if (hours === null || hours === undefined) {
      return fallback;
    }
    return `${formatFixed(hours, 1)} h`;
  }

  function missionDurationMs(mission, now = Date.now()) {
    if (mission.durationHours !== null && mission.durationHours !== undefined) {
      return mission.durationHours * 60 * 60 * 1000;
    }

    if (!mission.durationStartIso) {
      return null;
    }

    const startMs = Date.parse(mission.durationStartIso);
    if (Number.isNaN(startMs)) {
      return null;
    }

    return Math.max(0, now - startMs);
  }

  function formatDurationCounterMarkup(durationMs) {
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `
      <span class="stat-counter-kicker">
        <span class="stat-counter-dot" aria-hidden="true"></span>
        Mission elapsed
      </span>
      <span class="stat-counter-major">
        <span class="stat-counter-number">${formatInt(days)}</span>
        <span class="stat-counter-unit stat-counter-unit-major">Days</span>
      </span>
      <span class="stat-counter-minor">
        <span class="stat-counter-segment">
          <span class="stat-counter-number">${padClock(hours)}</span>
          <span class="stat-counter-unit">Hrs</span>
        </span>
        <span class="stat-counter-segment">
          <span class="stat-counter-number">${padClock(minutes)}</span>
          <span class="stat-counter-unit">Min</span>
        </span>
        <span class="stat-counter-segment">
          <span class="stat-counter-number">${padClock(seconds)}</span>
          <span class="stat-counter-unit">Sec</span>
        </span>
      </span>
    `;
  }

  function metricItem(label, value) {
    return `<div class="metric-item"><span class="metric-label">${label}</span><span class="metric-value">${value}</span></div>`;
  }

  function safeValue(value, fallback = "Pending") {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }
    return value;
  }

  function flightCardMarkup(mission) {
    const durationLabel = mission.durationLabel || (mission.status === "scheduled" ? "Planned" : "Pending");
    const altitudeLabel = mission.maxAltitudeLabel || "Pending";
    const distanceLabel = mission.landingDistanceLabel || "Pending";

    return `
      <article class="card flight-card">
        <div class="flight-card-head">
          <p class="eyebrow">${mission.missionCode}</p>
          <h3>${mission.title}</h3>
          <p class="flight-meta">${mission.dateLabel} | ${mission.location}</p>
          <span class="status-pill ${STATUS_CLASS[mission.status] || ""}">${statusLabel(mission.status)}</span>
        </div>

        <figure class="patch-wrap">
          <div class="patch-frame">
            <img src="${mission.patchImage}" alt="${mission.patchAlt}" loading="lazy" />
          </div>
          <figcaption>Mission badge image from <code>/pictures</code></figcaption>
        </figure>

        <div class="metric-grid compact">
          ${metricItem("Duration", formatDuration(mission.durationHours, durationLabel))}
          ${metricItem("Max altitude", formatAltitude(mission.maxAltitudeM, altitudeLabel))}
          ${metricItem("Landing distance", formatDistance(mission.landingDistanceKm, distanceLabel))}
          ${metricItem("Tracker", mission.trackerMode)}
        </div>

        <div class="button-row">
          <a class="button" href="report.html?mission=${mission.slug}">Read flight report</a>
          <a class="button button-ghost" href="${mission.trackerUrl}" target="_blank" rel="noreferrer">Open tracker</a>
        </div>
      </article>
    `;
  }

  function listMarkup(items) {
    if (!items || items.length === 0) {
      return "<li>No data yet.</li>";
    }
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  function galleryMarkup(items) {
    if (!items || items.length === 0) {
      return "";
    }

    return items
      .map(
        (item) => `
        <figure class="report-gallery-item card">
          <img src="${item.src}" alt="${item.alt}" loading="lazy" />
          <figcaption>${item.caption}</figcaption>
        </figure>
      `
      )
      .join("");
  }

  function comparisonCell(value) {
    return `<td>${safeValue(value)}</td>`;
  }

  function renderMissionCards(containerSelector, missionFilter = null) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const missions = missionFilter
      ? data.missions.filter((mission) => missionFilter(mission))
      : data.missions;

    container.innerHTML = missions.map((mission) => flightCardMarkup(mission)).join("");
  }

  function renderComparisonTable(bodySelector) {
    const body = document.querySelector(bodySelector);
    if (!body) return;

    body.innerHTML = data.missions
      .map(
        (mission) => `
      <tr>
        <th scope="row">${mission.label}</th>
        ${comparisonCell(mission.comparison.mass)}
        ${comparisonCell(mission.comparison.power)}
        ${comparisonCell(mission.comparison.comms)}
        ${comparisonCell(mission.comparison.antenna)}
        ${comparisonCell(mission.comparison.runtime)}
        ${comparisonCell(mission.comparison.maxAltitude)}
        ${comparisonCell(mission.comparison.failureMode)}
      </tr>
    `
      )
      .join("");
  }

  function renderHomeStats() {
    const launched = data.missions.filter((mission) => mission.status !== "scheduled");
    const maxAltitude = launched.reduce((max, mission) => Math.max(max, mission.maxAltitudeM || 0), 0);
    const activeMission = launched.find((mission) => mission.status === "inprogress" && mission.durationStartIso);

    const flightsEl = document.querySelector("#stat-flights");
    const altitudeEl = document.querySelector("#stat-altitude");
    const durationEl = document.querySelector("#stat-duration");
    const durationCard = durationEl ? durationEl.closest(".stat-badge") : null;

    if (window.StratocatHomeDurationTimer) {
      window.clearInterval(window.StratocatHomeDurationTimer);
      window.StratocatHomeDurationTimer = null;
    }

    if (flightsEl) flightsEl.textContent = String(launched.length);
    if (altitudeEl) altitudeEl.textContent = maxAltitude ? formatAltitude(maxAltitude) : "Pending";

    if (!durationEl) {
      return;
    }

    const updateDuration = () => {
      const now = Date.now();
      const longest = activeMission
        ? { mission: activeMission, durationMs: missionDurationMs(activeMission, now) }
        : launched.reduce((current, mission) => {
            const durationMs = missionDurationMs(mission, now);
            if (durationMs === null) {
              return current;
            }

            if (!current || durationMs > current.durationMs) {
              return { mission, durationMs };
            }

            return current;
          }, null);

      if (!longest || longest.durationMs === null) {
        durationEl.textContent = "Pending";
        durationEl.classList.remove("stat-value-live-counter");
        if (durationCard) durationCard.classList.remove("stat-badge-live");
        durationEl.removeAttribute("title");
        return;
      }

      if (longest.mission.durationStartIso) {
        durationEl.innerHTML = formatDurationCounterMarkup(longest.durationMs);
        durationEl.classList.add("stat-value-live-counter");
        if (durationCard) durationCard.classList.add("stat-badge-live");
        durationEl.title = "Live count-up since March 22, 2026 12:18 MST";
        return;
      }

      durationEl.textContent = `${formatFixed(longest.durationMs / 3600000, 1)} h`;
      durationEl.classList.remove("stat-value-live-counter");
      if (durationCard) durationCard.classList.remove("stat-badge-live");
      durationEl.removeAttribute("title");
    };

    updateDuration();

    if (activeMission) {
      window.StratocatHomeDurationTimer = window.setInterval(updateDuration, 1000);
    }
  }

  function findMissionFromQuery() {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("mission") || "design-a";
    return data.missions.find((mission) => mission.slug === requested) || data.missions[0];
  }

  function renderMissionReport() {
    const host = document.querySelector("[data-report-page]");
    if (!host) return;

    const mission = findMissionFromQuery();

    document.querySelector("#report-title").textContent = mission.title;
    document.querySelector("#report-subtitle").textContent = `${mission.missionCode} | ${mission.dateLabel} | ${mission.location}`;
    document.querySelector("#report-status").textContent = statusLabel(mission.status);
    document.querySelector("#report-status").className = `status-pill ${STATUS_CLASS[mission.status] || ""}`;
    document.querySelector("#report-intro").textContent = mission.intro;

    document.querySelector("#report-metrics").innerHTML = `
      ${metricItem("Duration", formatDuration(mission.durationHours, mission.durationLabel || "Pending"))}
      ${metricItem("Max altitude", formatAltitude(mission.maxAltitudeM, mission.maxAltitudeLabel || "Pending"))}
      ${metricItem("Landing distance", formatDistance(mission.landingDistanceKm, mission.landingDistanceLabel || "Pending"))}
      ${metricItem("Tracker mode", mission.trackerMode)}
    `;

    document.querySelector("#report-link").setAttribute("href", mission.trackerUrl);
    document.querySelector("#report-link").textContent = mission.trackerLabel;

    document.querySelector("#report-mission-overview").innerHTML = listMarkup(mission.missionOverview);
    document.querySelector("#report-architecture").innerHTML = listMarkup(mission.architecture);
    document.querySelector("#report-ground").innerHTML = listMarkup(mission.groundStation);
    document.querySelector("#report-power").innerHTML = listMarkup(mission.powerAndThermal);
    document.querySelector("#report-ops").innerHTML = listMarkup(mission.opsChecklist);
    document.querySelector("#report-results").innerHTML = listMarkup(mission.results);
    document.querySelector("#report-lessons").innerHTML = listMarkup(mission.lessons);
    document.querySelector("#report-roadmap").innerHTML = listMarkup(mission.roadmap);
    document.querySelector("#report-gallery").innerHTML = galleryMarkup(mission.gallery);
  }

  function renderScheduleSummary() {
    const schedule = data.schedule;
    if (!schedule) return;

    const labelTargets = document.querySelectorAll("[data-next-launch-label]");
    labelTargets.forEach((target) => {
      target.textContent = `${schedule.nextLaunchLabel} (${schedule.timezoneLabel})`;
    });
  }

  function renderUnitSensitiveViews() {
    renderMissionCards("[data-mission-cards='home']", () => true);
    renderMissionCards("[data-mission-cards='flights']", () => true);
    renderHomeStats();
    renderMissionReport();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderUnitSensitiveViews();
    renderComparisonTable("#comparison-table-body");
    renderScheduleSummary();
  });

  window.addEventListener("stratocat:units-changed", () => {
    renderUnitSensitiveViews();
  });
})();
