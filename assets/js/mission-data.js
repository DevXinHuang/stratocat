(() => {
  const missions = [
    {
      slug: "design-a",
      label: "Design A",
      title: "Flight Design A - Proof of Concept",
      missionCode: "Mission 1",
      date: "2025-11-09",
      dateLabel: "November 9, 2025",
      location: "Tucson, Arizona",
      status: "completed",
      patchImage: "pictures/stratocat01.png",
      patchAlt: "Mission 1 patch",
      intro:
        "Design A validated the minimum viable Picoballoon stack: stable lift, low-power telemetry, and a working recovery workflow.",
      trackerUrl:
        "https://traquito.github.io/search/spots/dashboard/?band=20m&channel=39&callsign=K7UAZ&dtGte=2025-11-01",
      trackerLabel: "Traquito 20m Ch39 - K7UAZ",
      durationHours: 4.3,
      maxAltitudeM: 12460,
      landingDistanceKm: 31,
      trackerMode: "WSPR 20m Ch39",
      comparison: {
        mass: "58 g",
        power: "0.72 W avg / 1.1 W peak",
        comms: "WSPR only",
        antenna: "Quarter-wave wire whip",
        runtime: "~6 hours (battery)",
        maxAltitude: "12.46 km",
        failureMode: "Battery voltage sag during cold soak"
      },
      missionOverview: [
        "Launch objective: prove end-to-end telemetry and recovery process with minimum payload complexity.",
        "Primary success condition: receive consistent telemetry through ascent and descent.",
        "Secondary success condition: recover payload and preserve full log data."
      ],
      architecture: [
        "Single-board tracker with lightweight MCU and low duty-cycle beaconing.",
        "Simple battery power path with no active thermal regulation.",
        "Manual preflight checklist and handheld Yagi for recovery support."
      ],
      groundStation: [
        "Decoded WSPR spots using Traquito dashboard plus local logging scripts.",
        "Used map overlays to estimate descent corridor and landing region.",
        "Created post-flight CSV archive for altitude and timing analysis."
      ],
      powerAndThermal: [
        "Lithium primary cell performed well at launch but dropped rapidly at high altitude temperatures.",
        "Insulation mass was intentionally minimal to stay under weight target.",
        "Voltage logs showed low-temperature effects were the top limiting factor."
      ],
      opsChecklist: [
        "Range-check beacon before inflation and seal payload after final continuity test.",
        "Verify callsign/channel configuration and UTC clock sync.",
        "Track landing corridor live and stage recovery team before descent."
      ],
      results: [
        "Telemetry lock achieved for full ascent and partial descent.",
        "Payload recovered with intact enclosure and complete onboard logs.",
        "Confirmed baseline airframe, comms, and operations concept."
      ],
      lessons: [
        "Thermal margin must be treated as a first-order requirement.",
        "Pre-launch checklist reduced avoidable field mistakes.",
        "Simple architecture accelerated troubleshooting and made data easier to trust."
      ],
      roadmap: [
        "Improve insulation and cold-voltage resilience.",
        "Add redundant telemetry mode for degraded link scenarios.",
        "Standardize launch-day role assignments for faster recovery."
      ],
      gallery: [
        {
          src: "pictures/stratocat01.png",
          alt: "Mission 1 patch image",
          caption: "Mission 1 badge (stored in /pictures)."
        }
      ]
    },
    {
      slug: "design-b",
      label: "Design B",
      title: "Flight Design B - Reliability + Range",
      missionCode: "Mission 1.5",
      date: "2026-01-11",
      dateLabel: "January 11, 2026",
      location: "Tucson, Arizona",
      status: "completed",
      patchImage: "pictures/stratocat02.png",
      patchAlt: "Mission 1.5 patch",
      intro:
        "Design B focused on reliability and range with stronger thermal handling and refined field operations. This mission included support from community member Brendon (KC5VCW).",
      trackerUrl:
        "https://traquito.github.io/search/spots/dashboard/?band=20m&channel=150&callsign=KC5VCW&dtGte=2026-01-01",
      trackerLabel: "Traquito 20m Ch150 - KC5VCW",
      durationHours: 7.9,
      maxAltitudeM: 17680,
      landingDistanceKm: 54,
      trackerMode: "WSPR 20m Ch150",
      comparison: {
        mass: "64 g",
        power: "0.68 W avg / 1.0 W peak",
        comms: "WSPR + improved decode workflow",
        antenna: "Tuned wire monopole with strain relief",
        runtime: "~10 hours (battery)",
        maxAltitude: "17.68 km",
        failureMode: "Antenna detune risk after moisture exposure"
      },
      missionOverview: [
        "Launch objective: increase time-on-track and validate improved flight procedures.",
        "Primary success condition: extend useful telemetry duration beyond Design A.",
        "Secondary success condition: reduce recovery uncertainty window."
      ],
      architecture: [
        "Revised enclosure mass distribution and better cable strain management.",
        "Improved insulation placement around battery and RF chain.",
        "Added cleaner harness routing to reduce antenna interaction."
      ],
      groundStation: [
        "Added confidence checks between dashboard spots and local parser output.",
        "Used channel-specific watchlist for faster anomaly detection.",
        "Documented handoff protocol between tracking and recovery operators."
      ],
      powerAndThermal: [
        "Thermal strategy improved low-temperature voltage stability.",
        "Power budget stayed within target during cruise phase.",
        "Post-flight logs showed reserve margin for additional sensors."
      ],
      opsChecklist: [
        "Dual operator verification for callsign/channel and tracker startup.",
        "Antenna geometry inspection after enclosure close-out.",
        "Recovery crew staged earlier based on predicted drift corridor."
      ],
      results: [
        "Longer track duration and higher peak altitude than Design A.",
        "Recovery timing improved with fewer route corrections.",
        "Documented remaining weak points in moisture and antenna handling."
      ],
      lessons: [
        "Reliability gains came more from process discipline than hardware complexity.",
        "Antenna protection must survive both flight and recovery handling.",
        "Cross-checking decode pipelines prevents misleading map interpretation."
      ],
      roadmap: [
        "Integrate solar-assisted power for long-duration mission profile.",
        "Add a second telemetry fallback path.",
        "Run full dry-run operations with all launch roles before launch weekend."
      ],
      gallery: [
        {
          src: "pictures/stratocat02.png",
          alt: "Mission 1.5 patch image",
          caption: "Mission 1.5 badge (stored in /pictures)."
        }
      ]
    },
    {
      slug: "design-c",
      label: "Design C",
      title: "Flight Design C - Long Duration / Solar / Next-Gen",
      missionCode: "Mission 2",
      date: "2026-02-28",
      dateLabel: "February 28, 2026 (weekend window)",
      location: "Tucson, Arizona",
      status: "scheduled",
      patchImage: "pictures/stratocat02.png",
      patchAlt: "Mission 2 campaign patch",
      intro:
        "Design C is the active mission build targeting long-duration flight with solar support, tighter telemetry quality, and a more robust enclosure.",
      trackerUrl:
        "https://traquito.github.io/search/spots/dashboard/?band=20m&channel=39&callsign=K7UAZ&dtGte=2025-11-01",
      trackerLabel: "Primary tracking dashboard",
      durationHours: null,
      maxAltitudeM: null,
      landingDistanceKm: null,
      trackerMode: "WSPR + planned redundancy",
      comparison: {
        mass: "Target: <= 68 g",
        power: "Target: 0.45 W avg / 1.0 W peak",
        comms: "WSPR + backup telemetry",
        antenna: "Thermally isolated long-wire design",
        runtime: "Target: 24+ hours",
        maxAltitude: "Goal: > 18 km",
        failureMode: "Primary risk: thermal/power imbalance at dawn transition"
      },
      missionOverview: [
        "Launch objective: demonstrate long-duration profile with improved telemetry continuity.",
        "Primary success condition: sustain mission operations through at least one full diurnal cycle.",
        "Secondary success condition: close data gaps in descent and recovery phases."
      ],
      architecture: [
        "Solar-assisted power architecture with low-leakage overnight mode.",
        "Higher integrity payload enclosure and better cable/antenna isolation.",
        "Expanded onboard logging for thermal and voltage diagnostics."
      ],
      groundStation: [
        "Pre-staged dashboard bookmarks for primary and backup channels.",
        "Automated spot capture plus manual operator log for event timing.",
        "Recovery planning includes dynamic corridor updates every 30 minutes."
      ],
      powerAndThermal: [
        "Solar panel and battery balance modeled for cold morning startup.",
        "Insulation and venting tuned to avoid condensation during descent.",
        "Critical telemetry thresholds configured for low-voltage alerts."
      ],
      opsChecklist: [
        "Complete final mass audit and verify center-of-mass alignment.",
        "Run full ground thermal soak test 48 hours before launch.",
        "Confirm FAA/ham compliance checklist and team radio assignments."
      ],
      results: [
        "Status: scheduled for Saturday, February 28, 2026.",
        "Success criteria will be scored against telemetry uptime, duration, and recovery quality.",
        "Post-flight report will be published after launch weekend."
      ],
      lessons: [
        "Design C planning is incorporating all failure modes observed in A and B.",
        "A launch-day go/no-go gate is required for weather and RF conditions.",
        "Thermal validation must be completed before the final integration freeze."
      ],
      roadmap: [
        "Execute launch window on February 28 weekend.",
        "Publish telemetry and postmortem within one week.",
        "Define Design D scope based on long-duration findings."
      ],
      gallery: [
        {
          src: "pictures/stratocat02.png",
          alt: "Mission 2 badge image",
          caption: "Mission 2 campaign badge from the active mission cycle."
        }
      ]
    }
  ];

  const schedule = {
    nextLaunchIso: "2026-02-28T08:00:00-07:00",
    nextLaunchLabel: "Saturday, February 28, 2026",
    timezoneLabel: "Arizona (MST)"
  };

  window.StratocatData = {
    projectName: "K7UAZ Picoballoon",
    missions,
    schedule
  };
})();
