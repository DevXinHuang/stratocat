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
        maxAltitude: "12.46 km / 40,879 ft",
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
      date: "2026-01-31",
      dateLabel: "January 31, 2026",
      location: "Tucson, Arizona",
      status: "completed",
      patchImage: "pictures/stratocat02.png",
      patchAlt: "Mission 1.5 patch",
      intro:
        "Design B focused on reliability and range with stronger thermal handling and refined field operations. This mission included support from community member Brendon (KC5VCW).",
      trackerUrl:
        "https://traquito.github.io/search/spots/dashboard/?band=20m&channel=150&callsign=KC5VCW&dtGte=2026-01-31",
      trackerLabel: "Traquito 20m Ch150 - KC5VCW",
      durationHours: 73.8,
      maxAltitudeM: 12700,
      landingDistanceKm: 54,
      trackerMode: "WSPR 20m Ch150",
      comparison: {
        mass: "64 g",
        power: "0.68 W avg / 1.0 W peak",
        comms: "WSPR + improved decode workflow",
        antenna: "Tuned wire monopole with strain relief",
        runtime: "73 h 50 m",
        maxAltitude: "12.70 km / 41,667 ft",
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
      title: "Flight Design C - Third Launch Multi-Balloon Campaign",
      missionCode: "Mission 2",
      date: "2026-03-22",
      dateLabel: "March 22, 2026",
      location: "Tucson, Arizona",
      status: "inprogress",
      patchImage: "pictures/stratocat02.png",
      patchAlt: "Mission 2 campaign patch",
      intro:
        "Mission 2 launched four of the five planned balloons on March 22, 2026. At 8:48 local time (15:48 UTC) on April 4, 2026, near 19.48 N, 108.46 W, the lead Stratocat balloon re-established transmission after completing a full global trajectory and confirmed one full circumnavigation of Earth.",
      trackerUrl: "tracking.html",
      trackerLabel: "Open live Mission 2 tracking",
      durationHours: null,
      durationStartIso: "2026-03-22T12:18:00-07:00",
      maxAltitudeM: 13240,
      landingDistanceKm: null,
      durationLabel: "Flight still active",
      maxAltitudeLabel: "13.24 km / 43,438 ft",
      landingDistanceLabel: "Flight still active",
      trackerMode: "WSPR on 12m / 15m / 20m",
      comparison: {
        mass: "4 balloons launched / 5 planned",
        power: "Flight system nominal during active track",
        comms: "WSPR across 12m, 15m, and 20m",
        antenna: "Band-specific flight setups",
        runtime: "Live since March 22, 2026 12:18 MST",
        maxAltitude: "13.24 km / 43,438 ft",
        failureMode: "1 balloon did not rise at release and will be retried"
      },
      missionOverview: [
        "Launch objective: fly multiple balloons in one campaign and confirm signals across all target bands.",
        "Primary success condition: receive telemetry from at least one balloon on 12m, 15m, and 20m.",
        "Secondary success condition: publish direct dashboards quickly so the team can monitor each active flight.",
        "April 4, 2026 update: the lead balloon re-established transmission near 19.48 N, 108.46 W after one full circumnavigation of Earth."
      ],
      architecture: [
        "Four active flight configurations were launched under the K7UAZ callsign.",
        "Each balloon was staged on a dedicated Traquito dashboard using a specific band and channel pairing.",
        "Detailed hardware deltas for each balloon will be added after the full post-flight write-up."
      ],
      groundStation: [
        "Launch-day operators used pre-staged Traquito dashboards for all active band and channel combinations.",
        "First signals were confirmed across 12m, 15m, and 20m during the launch campaign.",
        "The tracking page now archives the four dashboard links for replay and review.",
        "At 15:48 UTC on April 4, 2026, transmission was re-established near 19.48 N, 108.46 W, confirming one completed orbit."
      ],
      powerAndThermal: [
        "Thermal and endurance analysis is still being compiled from the active Mission 2 telemetry.",
        "The system continues to perform well as the live track advances beyond its first completed orbit.",
        "Detailed altitude, runtime, and power summaries will be added after the flight concludes."
      ],
      opsChecklist: [
        "Five balloons were prepared for release during the third launch campaign.",
        "Four balloons launched successfully and one did not rise, so it was held for a later retry.",
        "Dashboard links and UTC event notes were used to confirm launch-day status.",
        "Mission operators continue to monitor trajectory stability during the live around-the-world track."
      ],
      results: [
        "4 of the 5 planned balloons launched successfully on March 22, 2026.",
        "At least one balloon was heard on every target band: 12m, 15m, and 20m.",
        "At 8:48 local time (15:48 UTC) on April 4, 2026, the lead balloon re-established transmission near 19.48 N, 108.46 W.",
        "The mission has now completed one full circumnavigation of Earth.",
        "Four tracking dashboards are published while the live flight continues."
      ],
      lessons: [
        "Multi-balloon operations need a clear go or no-go check for lift before release.",
        "Cross-band dashboard staging made it easier to verify signals quickly.",
        "Launch-day summaries should immediately include direct links for every active balloon."
      ],
      roadmap: [
        "Continue publishing live mission updates as the Mission 2 flight continues beyond its first full orbit.",
        "Publish the full post-flight analysis after the Mission 2 flight concludes.",
        "Retry the balloon that did not rise during the initial release.",
        "Use third-launch data to define the next campaign."
      ],
      gallery: [
        {
          src: "pictures/stratocat02.png",
          alt: "Mission 2 badge image",
          caption: "Mission 2 campaign badge from the third launch cycle."
        }
      ]
    }
  ];

  const schedule = {
    status: "inprogress",
    nextLaunchIso: null,
    nextLaunchLabel: "Sunday, March 22, 2026",
    timezoneLabel: "Arizona MST",
    launchChipLabel: "Mission 2",
    launchChipValue: "Live",
    launchChipHref: "tracking.html"
  };

  window.StratocatData = {
    projectName: "K7UAZ Stratocat",
    missions,
    schedule
  };
})();
