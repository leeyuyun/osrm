# OSRM Cloud API UI

Simple static UI for calling OSRM Route API.

Current version: `v0.1.0`

## Quick Start

1. Open terminal in this folder.
2. Start a local static server:

```bash
python -m http.server 8080
```

3. Open `http://localhost:8080`.
4. Keep default API URL (`https://router.project-osrm.org`) or replace with your own OSRM endpoint.
5. Enter coordinates and click `Calculate Route`.

## Aviation Mode

1. Select profile `aviation (great-circle)`.
2. Click `Calculate Route`.
3. The app computes direct-air distance locally using the Haversine formula (no OSRM API call).
4. Duration in this mode is a rough estimate using 900 km/h cruise speed.

## Shipping Mode

1. Select profile `shipping (great-circle)`.
2. Click `Calculate Route`.
3. The app computes direct-sea great-circle distance locally (no OSRM API call).
4. Duration in this mode is a rough estimate using 35 km/h vessel speed.

## Address Input Mode

1. Enable `Use address input`.
2. Keep geocode base as `https://nominatim.openstreetmap.org` or set your own geocoding endpoint.
3. Fill `From Address` and `To Address`.
4. Click `Calculate Route` (it geocodes first, then calls OSRM), or click `Resolve Addresses` only.

## Notes

- Coordinate order in UI is `lat / lon`, but request path is sent as `lon,lat` as required by OSRM.
- Public demo endpoint may have limits and no SLA.
- When API base is `https://router.project-osrm.org`, the UI disables `driving-traffic`, `walking`, and `cycling` to avoid misleading identical timings.
- For production, run your own OSRM service or use a managed routing API.
- Nominatim public endpoint is rate-limited; this UI adds a small delay between two geocode requests.
- Aviation mode is direct-air great-circle distance, not real airline route planning.
- Shipping mode is a rough direct-sea estimate; it does not account for ports, channels, or maritime constraints.
