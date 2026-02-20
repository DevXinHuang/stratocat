# stratocat

GitHub Pages site for the K7UAZ Stratocat project.
This version uses a more modern UI design across the full site.

## Core pages

- `index.html` - Home / landing page
- `hardware.html` - About the hardware
- `teams.html` - Teams and work breakdown
- `schedule.html` - Schedule and milestones
- `club.html` - About the K7UAZ club

## Supporting pages

- `flights.html` - Flight cards + design comparison table
- `tracking.html` - Embedded live and historical tracking views
- `countdown.html` - Mission countdown page
- `sponsors.html` - Sponsor and funding section
- `report.html?mission=design-a|design-b|design-c` - Reusable flight report page

## Editing mission data

Update mission content in `assets/js/mission-data.js`.

## Assets

Mission images are stored in `pictures/`.

## Deployment (GitHub Actions)

This repo uses the workflow in `.github/workflows/deploy-pages.yml` to deploy GitHub Pages.

In GitHub:

1. Go to `Settings` -> `Pages`
2. Set `Source` to `GitHub Actions`

After that, every push to `main` auto-deploys the site.
