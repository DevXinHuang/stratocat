(() => {
  const coverageConfig = window.StratocatData && window.StratocatData.coverage ? window.StratocatData.coverage : null;
  const mapHost = document.querySelector("[data-coverage-map]");

  if (!coverageConfig || !mapHost) {
    return;
  }

  const statusEl = document.querySelector("[data-coverage-status]");
  const tooltipEl = document.querySelector("[data-coverage-tooltip]");
  const sourceLabelEl = document.querySelector("[data-coverage-source-label]");
  const topRegionsEl = document.querySelector("[data-coverage-top-regions]");
  const latestNoteEl = document.querySelector("[data-coverage-latest-note]");
  const statEls = {
    regions: document.querySelector('[data-coverage-stat="regions"]'),
    windows: document.querySelector('[data-coverage-stat="windows"]'),
    latestGrid: document.querySelector('[data-coverage-stat="latest-grid"]'),
    span: document.querySelector('[data-coverage-stat="span"]')
  };

  if (sourceLabelEl && coverageConfig.sourceLabel) {
    sourceLabelEl.textContent = coverageConfig.sourceLabel;
  }

  const BAND_TO_ENUM = new Map([
    ["2190m", -1],
    ["630m", 0],
    ["160m", 1],
    ["80m", 3],
    ["60m", 5],
    ["40m", 7],
    ["30m", 10],
    ["20m", 14],
    ["17m", 18],
    ["15m", 21],
    ["12m", 24],
    ["10m", 28],
    ["6m", 50],
    ["4m", 70],
    ["2m", 144],
    ["70cm", 432],
    ["23cm", 1296]
  ]);

  const BAND_FREQUENCIES = [
    ["2190m", 136000],
    ["630m", 474200],
    ["160m", 1836600],
    ["80m", 3568600],
    ["60m", 5287200],
    ["40m", 7038600],
    ["30m", 10138700],
    ["20m", 14095600],
    ["17m", 18104600],
    ["15m", 21094600],
    ["12m", 24924600],
    ["10m", 28124600],
    ["6m", 50293000],
    ["4m", 70091000],
    ["2m", 144489000],
    ["70cm", 432300000],
    ["23cm", 1296500000]
  ];

  const THEME_EVENT = "stratocat:theme-changed";

  let worldTopology = null;
  let coverageSummary = null;
  let resizeObserver = null;
  const coverageFiltering = {
    maxLowerBoundSpeedKmh: 320,
    maxRejoinDistanceKm: 1200,
    maxGlitchSegmentMinutes: 360,
    maxGlitchSegmentPoints: 24,
    bounceReturnMinDistanceKm: 180,
    manualExclusions: [],
    ...(coverageConfig.filtering || {})
  };

  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  function formatInt(value) {
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function formatMonthDay(timeStr) {
    const date = parseUtcDateTime(timeStr);
    if (!date) return "Unknown";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function formatUtcStamp(timeStr) {
    const date = parseUtcDateTime(timeStr);
    if (!date) return "Unknown";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short"
    }).format(date);
  }

  function parseUtcDateTime(timeStr) {
    if (!timeStr) return null;
    const isoLike = String(timeStr).replace(" ", "T") + "Z";
    const parsed = new Date(isoLike);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function rotateRight(values, count) {
    const next = [...values];

    while (count > 0) {
      next.unshift(next.pop());
      count -= 1;
    }

    return next;
  }

  function getChannelDetails(band, channel) {
    const bandIndex = BAND_FREQUENCIES.findIndex(([bandName]) => bandName === band);
    if (bandIndex === -1) {
      return null;
    }

    const dialFrequency = BAND_FREQUENCIES[bandIndex][1];
    const rotationList = [4, 2, 0, 3, 1];
    const minuteList = rotateRight([8, 0, 2, 4, 6], rotationList[bandIndex % 5]);
    const id1List = ["0", "1", "Q"];
    const id3List = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    const frequencyWindowStart = dialFrequency + 1500 - 100;
    const bandSizeHz = 200 / 5;
    const frequencyBands = [1, 2, 4, 5];
    const channelNumber = Number(channel);
    let rowCount = 0;

    for (const frequencyBand of frequencyBands) {
      const rowsPerColumn = 5 * frequencyBands.length;

      for (const minute of minuteList) {
        for (const id1 of id1List) {
          let columnCount = 0;
          let id1Offset = 0;

          if (id1 === "1") id1Offset = 200;
          if (id1 === "Q") id1Offset = 400;

          for (const id3 of id3List) {
            const mappedChannel = id1Offset + (columnCount * rowsPerColumn) + rowCount;

            if (mappedChannel === channelNumber) {
              const frequencyBandLow = (frequencyBand - 1) * bandSizeHz;
              const frequencyBandHigh = frequencyBandLow + bandSizeHz;

              return {
                id1,
                id3,
                minute,
                frequencyLow: frequencyWindowStart + frequencyBandLow,
                frequencyHigh: frequencyWindowStart + frequencyBandHigh
              };
            }

            columnCount += 1;
          }
        }

        rowCount += 1;
      }
    }

    return null;
  }

  function escapeSqlLiteral(value) {
    return String(value).replaceAll("'", "''");
  }

  function buildCoverageQuery(config) {
    const bandEnum = BAND_TO_ENUM.get(config.band);
    const channelDetails = getChannelDetails(config.band, config.channel);

    if (bandEnum === undefined || !channelDetails) {
      throw new Error("Unable to resolve band or channel settings for the live map.");
    }

    const filters = [
      `time >= '${escapeSqlLiteral(config.dtGte)}'`,
      `band = ${bandEnum}`,
      `tx_sign = '${escapeSqlLiteral(config.callsign)}'`,
      "length(tx_loc) = 4",
      `toMinute(time) % 10 = ${channelDetails.minute}`,
      `frequency >= ${Math.floor(channelDetails.frequencyLow)}`,
      `frequency < ${Math.ceil(channelDetails.frequencyHigh)}`
    ];

    return `
select
    time,
    any(tx_loc) as grid4
from wspr.rx
where
    ${filters.join("\n  and ")}
group by time
order by time asc
FORMAT JSONCompact
    `.trim();
  }

  function rowsFromJsonCompact(payload) {
    const headers = Array.isArray(payload && payload.meta) ? payload.meta.map((entry) => entry.name) : [];
    const rows = Array.isArray(payload && payload.data) ? payload.data : [];

    return rows.map((row) => {
      const obj = {};

      headers.forEach((header, index) => {
        obj[header] = row[index];
      });

      return obj;
    });
  }

  function decodeGrid4Bounds(grid4) {
    if (!/^[A-Ra-r]{2}\d{2}$/.test(grid4 || "")) {
      return null;
    }

    const normalized = grid4.toUpperCase();
    const fieldLon = normalized.charCodeAt(0) - 65;
    const fieldLat = normalized.charCodeAt(1) - 65;
    const squareLon = Number(normalized[2]);
    const squareLat = Number(normalized[3]);
    const west = -180 + fieldLon * 20 + squareLon * 2;
    const east = west + 2;
    const south = -90 + fieldLat * 10 + squareLat;
    const north = south + 1;

    return {
      west,
      east,
      south,
      north,
      centerLng: west + 1,
      centerLat: south + 0.5
    };
  }

  function haversineDistanceKm(lat1, lng1, lat2, lng2) {
    const earthRadiusKm = 6371;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function centerDistanceKm(leftRow, rightRow) {
    if (!leftRow || !rightRow) return 0;

    return haversineDistanceKm(leftRow.centerLat, leftRow.centerLng, rightRow.centerLat, rightRow.centerLng);
  }

  function lowerBoundDistanceKm(leftRow, rightRow) {
    const estimatedCellUncertaintyKm = 250;
    return Math.max(0, centerDistanceKm(leftRow, rightRow) - estimatedCellUncertaintyKm);
  }

  function minutesBetween(leftTime, rightTime) {
    const leftDate = parseUtcDateTime(leftTime);
    const rightDate = parseUtcDateTime(rightTime);

    if (!leftDate || !rightDate) {
      return 0;
    }

    return Math.max(0, (rightDate.getTime() - leftDate.getTime()) / 60000);
  }

  function lowerBoundSpeedKmh(leftRow, rightRow) {
    const minutes = Math.max(1, minutesBetween(leftRow.time, rightRow.time));
    return lowerBoundDistanceKm(leftRow, rightRow) / (minutes / 60);
  }

  function normalizeCoverageRows(rows) {
    return rows
      .map((row) => {
        const grid4 = typeof row.grid4 === "string" ? row.grid4.toUpperCase() : "";
        const bounds = decodeGrid4Bounds(grid4);

        if (!bounds) {
          return null;
        }

        return {
          time: row.time,
          grid4,
          ...bounds
        };
      })
      .filter(Boolean);
  }

  function applyManualExclusions(rows) {
    const exclusions = Array.isArray(coverageFiltering.manualExclusions) ? coverageFiltering.manualExclusions : [];
    if (!exclusions.length) {
      return {
        keptRows: rows,
        removedRows: []
      };
    }

    const keptRows = [];
    const removedRows = [];

    rows.forEach((row) => {
      const exclusion = exclusions.find((rule) => {
        const grids = Array.isArray(rule.grids) ? rule.grids.map((grid) => String(grid).toUpperCase()) : [];
        const afterStart = !rule.startUtc || row.time >= rule.startUtc;
        const beforeEnd = !rule.endUtc || row.time <= rule.endUtc;
        const gridAllowed = !grids.length || grids.includes(row.grid4);
        return afterStart && beforeEnd && gridAllowed;
      });

      if (exclusion) {
        removedRows.push({
          ...row,
          filterReason: exclusion.reason || "manual-exclusion"
        });
        return;
      }

      keptRows.push(row);
    });

    return { keptRows, removedRows };
  }

  function removeBounceRows(rows) {
    if (rows.length < 3) {
      return {
        keptRows: rows,
        removedRows: []
      };
    }

    const keptRows = [];
    const removedRows = [];

    rows.forEach((row, index) => {
      if (index === 0 || index === rows.length - 1) {
        keptRows.push(row);
        return;
      }

      const previous = rows[index - 1];
      const next = rows[index + 1];
      const bouncesBackToSameGrid = previous.grid4 === next.grid4 && previous.grid4 !== row.grid4;
      const centerJumpKm = centerDistanceKm(previous, row);
      const outSpeed = lowerBoundSpeedKmh(previous, row);
      const returnSpeed = lowerBoundSpeedKmh(row, next);

      if (
        bouncesBackToSameGrid &&
        centerJumpKm >= coverageFiltering.bounceReturnMinDistanceKm &&
        outSpeed > coverageFiltering.maxLowerBoundSpeedKmh &&
        returnSpeed > coverageFiltering.maxLowerBoundSpeedKmh
      ) {
        removedRows.push({
          ...row,
          filterReason: "bounce-glitch"
        });
        return;
      }

      keptRows.push(row);
    });

    return { keptRows, removedRows };
  }

  function splitRowsIntoSpeedSegments(rows) {
    if (!rows.length) {
      return [];
    }

    const segments = [[rows[0]]];

    rows.slice(1).forEach((row) => {
      const currentSegment = segments[segments.length - 1];
      const previousRow = currentSegment[currentSegment.length - 1];
      const speedKmh = lowerBoundSpeedKmh(previousRow, row);

      if (speedKmh > coverageFiltering.maxLowerBoundSpeedKmh) {
        segments.push([row]);
        return;
      }

      currentSegment.push(row);
    });

    return segments;
  }

  function removeGlitchSegments(rows) {
    const segments = splitRowsIntoSpeedSegments(rows);
    if (segments.length < 3) {
      return {
        keptRows: rows,
        removedRows: []
      };
    }

    const removedRows = [];
    const removedSegmentIndexes = new Set();

    for (let index = 1; index < segments.length - 1; index += 1) {
      const previousSegment = segments[index - 1];
      const currentSegment = segments[index];
      const nextSegment = segments[index + 1];

      const previousLast = previousSegment[previousSegment.length - 1];
      const currentFirst = currentSegment[0];
      const currentLast = currentSegment[currentSegment.length - 1];
      const nextFirst = nextSegment[0];

      const durationMinutes = minutesBetween(currentFirst.time, currentLast.time);
      const shortSegment =
        currentSegment.length <= coverageFiltering.maxGlitchSegmentPoints &&
        durationMinutes <= coverageFiltering.maxGlitchSegmentMinutes;
      // The balloon is solar-powered, so long silent gaps are expected.
      // Only remove a segment when both the entry and exit would still require
      // impossible lower-bound speeds and the surrounding track rejoins cleanly.
      const entrySpeed = lowerBoundSpeedKmh(previousLast, currentFirst);
      const exitSpeed = lowerBoundSpeedKmh(currentLast, nextFirst);
      const rejoinDistanceKm = centerDistanceKm(previousLast, nextFirst);

      if (
        shortSegment &&
        entrySpeed > coverageFiltering.maxLowerBoundSpeedKmh &&
        exitSpeed > coverageFiltering.maxLowerBoundSpeedKmh &&
        rejoinDistanceKm <= coverageFiltering.maxRejoinDistanceKm
      ) {
        removedSegmentIndexes.add(index);
        currentSegment.forEach((row) => {
          removedRows.push({
            ...row,
            filterReason: "impossible-jump-segment"
          });
        });
      }
    }

    const keptRows = segments.flatMap((segment, index) => (removedSegmentIndexes.has(index) ? [] : segment));
    return { keptRows, removedRows };
  }

  function filterCoverageRows(rows) {
    const normalizedRows = normalizeCoverageRows(rows);
    const removedRows = [];

    const manual = applyManualExclusions(normalizedRows);
    removedRows.push(...manual.removedRows);

    const bounced = removeBounceRows(manual.keptRows);
    removedRows.push(...bounced.removedRows);

    const segmented = removeGlitchSegments(bounced.keptRows);
    removedRows.push(...segmented.removedRows);

    return {
      keptRows: segmented.keptRows,
      removedRows
    };
  }

  function aggregateCoverage(rows) {
    const cellsByGrid = new Map();
    let firstRecord = null;
    let latestRecord = null;

    rows.forEach((row) => {
      const { grid4 } = row;

      if (!firstRecord) {
        firstRecord = { time: row.time, grid4 };
      }

      latestRecord = { time: row.time, grid4, ...row };

      const existing = cellsByGrid.get(grid4) || {
        grid4,
        count: 0,
        firstTime: row.time,
        lastTime: row.time,
        ...row
      };

      existing.count += 1;
      existing.lastTime = row.time;
      cellsByGrid.set(grid4, existing);
    });

    const cells = Array.from(cellsByGrid.values()).sort((left, right) => right.count - left.count || left.grid4.localeCompare(right.grid4));

    return {
      windowCount: rows.length,
      uniqueRegions: cells.length,
      firstRecord,
      latestRecord,
      cells,
      topRegions: cells.slice(0, 6),
      maxCount: cells.length ? cells[0].count : 0
    };
  }

  function updateStats(summary) {
    if (statEls.regions) statEls.regions.textContent = formatInt(summary.uniqueRegions);
    if (statEls.windows) statEls.windows.textContent = formatInt(summary.windowCount);
    if (statEls.latestGrid) statEls.latestGrid.textContent = summary.latestRecord ? summary.latestRecord.grid4 : "None";

    if (statEls.span) {
      statEls.span.textContent =
        summary.firstRecord && summary.latestRecord
          ? `${formatMonthDay(summary.firstRecord.time)} to ${formatMonthDay(summary.latestRecord.time)}`
          : "No data";
    }

    if (latestNoteEl) {
      latestNoteEl.textContent = summary.latestRecord
        ? `Last heard ${formatUtcStamp(summary.latestRecord.time)}`
        : "Waiting for the latest spot...";
    }

    if (topRegionsEl) {
      topRegionsEl.innerHTML = summary.topRegions
        .map((cell) => {
          const label = `${cell.grid4} (${formatMonthDay(cell.lastTime)})`;
          const count = `${formatInt(cell.count)} window${cell.count === 1 ? "" : "s"}`;
          return `
            <li>
              <span class="coverage-region-label">${label}</span>
              <span class="coverage-region-count">${count}</span>
            </li>
          `;
        })
        .join("");
    }
  }

  function showEmptyMap(message) {
    mapHost.innerHTML = `<div class="coverage-empty"><p>${message}</p></div>`;
  }

  function hideTooltip() {
    if (!tooltipEl) return;

    tooltipEl.classList.remove("is-visible");
    tooltipEl.hidden = true;
  }

  function showTooltip(event, cell) {
    if (!tooltipEl) return;

    const rect = mapHost.getBoundingClientRect();
    tooltipEl.hidden = false;
    tooltipEl.classList.add("is-visible");
    tooltipEl.style.left = `${event.clientX - rect.left}px`;
    tooltipEl.style.top = `${event.clientY - rect.top}px`;
    tooltipEl.innerHTML = `
      <strong>${cell.grid4}</strong>
      <span>${formatInt(cell.count)} tracked window${cell.count === 1 ? "" : "s"}</span>
      <span>Last heard ${formatUtcStamp(cell.lastTime)}</span>
    `;
  }

  function renderMap() {
    if (!worldTopology || !coverageSummary) {
      return;
    }

    if (!window.d3 || !window.topojson) {
      showEmptyMap("Map libraries failed to load.");
      return;
    }

    if (!coverageSummary.cells.length) {
      showEmptyMap("No live grid squares were returned for this mission window yet.");
      return;
    }

    const width = Math.max(720, Math.round(mapHost.clientWidth || 720));
    const height = Math.round(width * 0.56);
    const d3 = window.d3;
    const countries = window.topojson.feature(worldTopology, worldTopology.objects.countries);
    const projection = d3.geoNaturalEarth1().fitExtent(
      [
        [18, 18],
        [width - 18, height - 18]
      ],
      { type: "Sphere" }
    );
    const path = d3.geoPath(projection);
    const maxCount = Math.max(coverageSummary.maxCount, 1);
    const color = d3
      .scaleSequential()
      .domain([1, maxCount])
      .interpolator((t) => d3.interpolateRgbBasis(["#88a6e8", "#efb168", "#ab0520"])(t));

    hideTooltip();
    mapHost.innerHTML = "";

    const svg = d3
      .select(mapHost)
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.append("path").datum({ type: "Sphere" }).attr("class", "coverage-sphere").attr("d", path);
    svg.append("path").datum(d3.geoGraticule10()).attr("class", "coverage-graticule").attr("d", path);

    svg
      .append("g")
      .selectAll("path")
      .data(countries.features)
      .join("path")
      .attr("class", "coverage-country")
      .attr("d", path);

    svg
      .append("g")
      .selectAll("path")
      .data(coverageSummary.cells)
      .join("path")
      .attr("class", (cell) => `coverage-cell${coverageSummary.latestRecord && cell.grid4 === coverageSummary.latestRecord.grid4 ? " coverage-cell-latest" : ""}`)
      .attr("d", (cell) =>
        path({
          type: "Polygon",
          coordinates: [[
            [cell.west, cell.south],
            [cell.east, cell.south],
            [cell.east, cell.north],
            [cell.west, cell.north],
            [cell.west, cell.south]
          ]]
        })
      )
      .attr("fill", (cell) => color(cell.count))
      .attr("fill-opacity", (cell) => {
        if (maxCount <= 1) return 0.82;
        return 0.28 + ((cell.count - 1) / (maxCount - 1)) * 0.58;
      })
      .on("mousemove", function onMove(event, cell) {
        showTooltip(event, cell);
      })
      .on("mouseenter", function onEnter(event, cell) {
        showTooltip(event, cell);
      })
      .on("mouseleave", hideTooltip);
  }

  async function fetchCoverageSummary() {
    const response = await fetch("assets/data/countries-110m.json");

    if (!response.ok) {
      throw new Error("Unable to load the world map asset.");
    }

    worldTopology = await response.json();

    const query = buildCoverageQuery(coverageConfig);
    const dataUrl = new URL("https://db1.wspr.live/");
    dataUrl.searchParams.set("query", query);

    const dataResponse = await fetch(dataUrl.toString());
    if (!dataResponse.ok) {
      throw new Error("Unable to load live WSPR coverage data.");
    }

    const payload = await dataResponse.json();
    const filtered = filterCoverageRows(rowsFromJsonCompact(payload));
    coverageSummary = {
      ...aggregateCoverage(filtered.keptRows),
      filteredPointCount: filtered.removedRows.length
    };
  }

  function setupResizeHandling() {
    if (resizeObserver || typeof ResizeObserver === "undefined") {
      return;
    }

    let frameId = 0;
    resizeObserver = new ResizeObserver(() => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        renderMap();
      });
    });

    resizeObserver.observe(mapHost);
  }

  async function init() {
    setStatus("Loading live coverage...");

    try {
      await fetchCoverageSummary();
      updateStats(coverageSummary);
      renderMap();
      setupResizeHandling();
      const filteredSuffix = coverageSummary.filteredPointCount
        ? ` | ${formatInt(coverageSummary.filteredPointCount)} glitches filtered`
        : "";
      setStatus(`Live data: ${formatInt(coverageSummary.windowCount)} windows${filteredSuffix}`);
    } catch (error) {
      console.error(error);
      setStatus("Coverage unavailable");
      showEmptyMap("The live coverage feed is temporarily unavailable. Try reloading in a moment.");
    }
  }

  window.addEventListener(THEME_EVENT, () => {
    renderMap();
  });

  init();
})();
