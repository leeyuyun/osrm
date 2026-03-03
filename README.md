# OSRM Cloud API UI

Simple static UI for calling OSRM Route API.

Current version: `v0.2.0`

## Quick Start

1. Open terminal in this folder.
2. Start a local static server:

```bash
python -m http.server 8080
```

3. Open `http://localhost:8080`.
4. Keep default API URL (`https://router.project-osrm.org`) or replace with your own OSRM endpoint.
5. Enter coordinates and click `Calculate Route`.

## Simple Map

1. A Leaflet map is shown in the result panel.
2. Start/end markers sync with current coordinates.
3. When route is calculated, route geometry is drawn on the map and auto-fitted in view.

## Aviation Mode

1. Select profile `aviation (great-circle)`.
2. Click `Calculate Route`.
3. The app computes direct-air distance locally using the Haversine formula (no OSRM API call).
4. Duration in this mode is a rough estimate using 900 km/h cruise speed.

## Shipping Mode

1. Select profile `shipping (navigable approx)`.
2. Click `Calculate Route`.
3. The app computes a local navigable-approx path through built-in maritime waypoints (no OSRM API call).
4. Duration in this mode is a rough estimate using 35 km/h vessel speed.

## Address Input Mode

1. Enable `Use address input`.
2. Keep geocode base as `https://nominatim.openstreetmap.org` or set your own geocoding endpoint.
3. Fill `From Address` and `To Address`.
4. Click `Calculate Route` (it geocodes first, then calls OSRM), or click `Resolve Addresses` only.

## Release Highlights (v0.2.0)

1. Aviation mode now renders great-circle arc points (instead of a straight 2-point line).
2. Added aviation segment breakdown in result panel (per-segment distance/time + totals).
3. Shipping mode upgraded to local navigable approximation using a maritime waypoint network.
4. Added antimeridian-safe map rendering to avoid broken long lines across world wrap.

## Notes

- Coordinate order in UI is `lat / lon`, but request path is sent as `lon,lat` as required by OSRM.
- Public demo endpoint may have limits and no SLA.
- Simple map tiles come from OpenStreetMap tile servers (internet required).
- When API base is `https://router.project-osrm.org`, the UI disables `driving-traffic`, `walking`, and `cycling` to avoid misleading identical timings.
- For production, run your own OSRM service or use a managed routing API.
- Nominatim public endpoint is rate-limited; this UI adds a small delay between two geocode requests.
- Aviation mode is direct-air great-circle distance, not real airline route planning.
- Shipping mode uses a local waypoint network approximation for navigable seas; it is not a certified nautical routing engine.
- Shipping mode may snap inland endpoints to nearby maritime corridors for approximation.
