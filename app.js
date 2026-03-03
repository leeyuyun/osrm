const els = {
  apiBase: document.getElementById("apiBase"),
  geocodeBase: document.getElementById("geocodeBase"),
  profile: document.getElementById("profile"),
  useAddress: document.getElementById("useAddress"),
  fromAddress: document.getElementById("fromAddress"),
  toAddress: document.getElementById("toAddress"),
  fromLat: document.getElementById("fromLat"),
  fromLon: document.getElementById("fromLon"),
  toLat: document.getElementById("toLat"),
  toLon: document.getElementById("toLon"),
  steps: document.getElementById("steps"),
  alternatives: document.getElementById("alternatives"),
  annotations: document.getElementById("annotations"),
  runBtn: document.getElementById("runBtn"),
  geocodeBtn: document.getElementById("geocodeBtn"),
  swapBtn: document.getElementById("swapBtn"),
  status: document.getElementById("status"),
  profileHint: document.getElementById("profileHint"),
  geocodeResult: document.getElementById("geocodeResult"),
  distance: document.getElementById("distance"),
  duration: document.getElementById("duration"),
  routeCode: document.getElementById("routeCode"),
  segmentPanel: document.getElementById("segmentPanel"),
  segmentTotals: document.getElementById("segmentTotals"),
  segmentList: document.getElementById("segmentList"),
  requestUrl: document.getElementById("requestUrl"),
  rawJson: document.getElementById("rawJson"),
  simpleMap: document.getElementById("simpleMap"),
  mapMeta: document.getElementById("mapMeta"),
};

const publicOsrmLimitedProfiles = new Set(["driving-traffic", "walking", "cycling"]);
const mapState = {
  map: null,
  startMarker: null,
  endMarker: null,
  routeLayer: null,
  routeLines: [],
};

const shippingWaypoints = [
  { id: "singapore", lat: 1.29, lon: 103.85 },
  { id: "strait_malacca", lat: 3.0, lon: 100.5 },
  { id: "andaman_sea", lat: 9.0, lon: 94.0 },
  { id: "taiwan_strait", lat: 23.5, lon: 119.8 },
  { id: "luzon_strait", lat: 20.8, lon: 122.3 },
  { id: "philippine_sea", lat: 18.0, lon: 132.0 },
  { id: "okinawa_approach", lat: 26.0, lon: 129.5 },
  { id: "bay_of_bengal", lat: 13.0, lon: 87.0 },
  { id: "arabian_sea", lat: 15.0, lon: 63.0 },
  { id: "gulf_aden", lat: 12.0, lon: 46.0 },
  { id: "red_sea_south", lat: 17.0, lon: 41.0 },
  { id: "suez_south", lat: 29.4, lon: 32.5 },
  { id: "suez_north", lat: 31.2, lon: 32.3 },
  { id: "med_east", lat: 34.0, lon: 26.0 },
  { id: "med_west", lat: 37.0, lon: 10.0 },
  { id: "gibraltar", lat: 36.0, lon: -5.5 },
  { id: "north_atlantic_east", lat: 36.0, lon: -20.0 },
  { id: "north_atlantic_mid", lat: 38.0, lon: -40.0 },
  { id: "north_atlantic_west", lat: 36.0, lon: -60.0 },
  { id: "us_east", lat: 35.0, lon: -74.0 },
  { id: "boston_approach", lat: 42.6, lon: -69.8 },
  { id: "caribbean", lat: 17.0, lon: -75.0 },
  { id: "panama_atlantic", lat: 9.4, lon: -79.8 },
  { id: "panama_pacific", lat: 8.8, lon: -79.6 },
  { id: "mexico_pacific", lat: 18.0, lon: -108.0 },
  { id: "california_approach", lat: 33.0, lon: -122.0 },
  { id: "south_china_sea", lat: 14.0, lon: 114.0 },
  { id: "east_china_sea", lat: 28.0, lon: 126.0 },
  { id: "japan_pacific", lat: 35.0, lon: 143.0 },
  { id: "north_pacific_west", lat: 39.0, lon: 165.0 },
  { id: "north_pacific_mid", lat: 40.0, lon: -170.0 },
  { id: "north_pacific_east", lat: 37.0, lon: -145.0 },
  { id: "aleutian_west", lat: 50.0, lon: 175.0 },
  { id: "aleutian_mid", lat: 52.0, lon: -175.0 },
  { id: "aleutian_east", lat: 52.0, lon: -160.0 },
  { id: "hawaii_north", lat: 28.0, lon: -158.0 },
  { id: "hawaii_east", lat: 24.0, lon: -145.0 },
  { id: "us_west_north", lat: 47.0, lon: -125.0 },
  { id: "us_west_mid", lat: 38.0, lon: -124.0 },
  { id: "baja_pacific", lat: 25.0, lon: -116.0 },
  { id: "equatorial_west_pacific", lat: 4.0, lon: 145.0 },
  { id: "equatorial_mid_pacific", lat: 2.0, lon: -170.0 },
  { id: "equatorial_east_pacific", lat: 5.0, lon: -125.0 },
  { id: "indian_ocean_mid", lat: -20.0, lon: 72.0 },
  { id: "cape_good_hope", lat: -35.0, lon: 18.0 },
  { id: "south_atlantic_mid", lat: -20.0, lon: -20.0 },
];

const shippingEdges = [
  ["singapore", "strait_malacca"],
  ["singapore", "south_china_sea"],
  ["south_china_sea", "taiwan_strait"],
  ["taiwan_strait", "east_china_sea"],
  ["taiwan_strait", "luzon_strait"],
  ["luzon_strait", "philippine_sea"],
  ["east_china_sea", "okinawa_approach"],
  ["okinawa_approach", "japan_pacific"],
  ["philippine_sea", "japan_pacific"],
  ["philippine_sea", "north_pacific_west"],
  ["equatorial_west_pacific", "philippine_sea"],
  ["strait_malacca", "andaman_sea"],
  ["andaman_sea", "bay_of_bengal"],
  ["bay_of_bengal", "arabian_sea"],
  ["arabian_sea", "gulf_aden"],
  ["gulf_aden", "red_sea_south"],
  ["red_sea_south", "suez_south"],
  ["suez_south", "suez_north"],
  ["suez_north", "med_east"],
  ["med_east", "med_west"],
  ["med_west", "gibraltar"],
  ["gibraltar", "north_atlantic_east"],
  ["north_atlantic_east", "north_atlantic_mid"],
  ["north_atlantic_mid", "north_atlantic_west"],
  ["north_atlantic_west", "us_east"],
  ["north_atlantic_west", "boston_approach"],
  ["us_east", "boston_approach"],
  ["north_atlantic_west", "caribbean"],
  ["caribbean", "panama_atlantic"],
  ["panama_atlantic", "panama_pacific"],
  ["panama_pacific", "mexico_pacific"],
  ["mexico_pacific", "california_approach"],
  ["south_china_sea", "east_china_sea"],
  ["east_china_sea", "japan_pacific"],
  ["japan_pacific", "north_pacific_west"],
  ["japan_pacific", "aleutian_west"],
  ["aleutian_west", "aleutian_mid"],
  ["aleutian_mid", "aleutian_east"],
  ["aleutian_east", "us_west_north"],
  ["us_west_north", "us_west_mid"],
  ["us_west_mid", "california_approach"],
  ["north_pacific_west", "north_pacific_mid"],
  ["north_pacific_mid", "north_pacific_east"],
  ["north_pacific_east", "california_approach"],
  ["north_pacific_west", "hawaii_north"],
  ["hawaii_north", "hawaii_east"],
  ["hawaii_east", "north_pacific_east"],
  ["hawaii_east", "equatorial_east_pacific"],
  ["south_china_sea", "equatorial_west_pacific"],
  ["equatorial_west_pacific", "equatorial_mid_pacific"],
  ["equatorial_mid_pacific", "equatorial_east_pacific"],
  ["equatorial_east_pacific", "panama_pacific"],
  ["arabian_sea", "indian_ocean_mid"],
  ["indian_ocean_mid", "cape_good_hope"],
  ["cape_good_hope", "south_atlantic_mid"],
  ["south_atlantic_mid", "north_atlantic_west"],
  ["south_atlantic_mid", "panama_atlantic"],
  ["mexico_pacific", "baja_pacific"],
  ["baja_pacific", "california_approach"],
];

function setStatus(text, type = "idle") {
  els.status.textContent = text;
  els.status.className = `status ${type}`;
}

function parseCoordinate(input, { min, max, name }) {
  const value = Number(input.value);
  if (Number.isNaN(value) || value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max}`);
  }
  return value;
}

function getCurrentCoordinates() {
  return {
    fromLat: parseCoordinate(els.fromLat, { min: -90, max: 90, name: "From latitude" }),
    fromLon: parseCoordinate(els.fromLon, { min: -180, max: 180, name: "From longitude" }),
    toLat: parseCoordinate(els.toLat, { min: -90, max: 90, name: "To latitude" }),
    toLon: parseCoordinate(els.toLon, { min: -180, max: 180, name: "To longitude" }),
  };
}

function formatDuration(seconds) {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes}m`;
}

function formatDistance(meters) {
  const km = meters / 1000;
  if (km >= 100) return `${km.toFixed(0)} km`;
  if (km >= 10) return `${km.toFixed(1)} km`;
  return `${km.toFixed(2)} km`;
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function clamp(value, min, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function toCartesian(lat, lon) {
  const latRad = toRad(lat);
  const lonRad = toRad(lon);
  const cosLat = Math.cos(latRad);
  return {
    x: cosLat * Math.cos(lonRad),
    y: cosLat * Math.sin(lonRad),
    z: Math.sin(latRad),
  };
}

function fromCartesian(point) {
  const hyp = Math.sqrt((point.x * point.x) + (point.y * point.y));
  const lat = Math.atan2(point.z, hyp);
  const lon = Math.atan2(point.y, point.x);
  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
  };
}

function lerpGreatCirclePoint(fromLat, fromLon, toLat, toLon, t) {
  const start = toCartesian(fromLat, fromLon);
  const end = toCartesian(toLat, toLon);

  const dot = clamp(
    start.x * end.x + start.y * end.y + start.z * end.z,
    -1,
    1,
  );
  const omega = Math.acos(dot);

  if (omega < 1e-12) {
    return { lat: fromLat, lon: fromLon };
  }

  const sinOmega = Math.sin(omega);
  const scaleStart = Math.sin((1 - t) * omega) / sinOmega;
  const scaleEnd = Math.sin(t * omega) / sinOmega;

  const point = {
    x: scaleStart * start.x + scaleEnd * end.x,
    y: scaleStart * start.y + scaleEnd * end.y,
    z: scaleStart * start.z + scaleEnd * end.z,
  };
  return fromCartesian(point);
}

function buildGreatCircleRoute(fromLat, fromLon, toLat, toLon, speedKph, segmentMaxKm = null) {
  const distance = haversineMeters(fromLat, fromLon, toLat, toLon);
  const assumedSpeedMps = (speedKph * 1000) / 3600;
  let routeCoords = [];
  let segments = [];

  if (distance === 0 || !segmentMaxKm) {
    routeCoords = [[fromLon, fromLat], [toLon, toLat]];
  } else {
    const segmentCount = Math.max(2, Math.ceil(distance / 1000 / clamp(Number(segmentMaxKm), 1, 5000)));

    for (let i = 0; i <= segmentCount; i += 1) {
      const t = i / segmentCount;
      const point = lerpGreatCirclePoint(fromLat, fromLon, toLat, toLon, t);
      routeCoords.push([point.lon, point.lat]);
    }

    if (segmentMaxKm) {
      segments = routeCoords.slice(0, -1).map((coord, index) => {
        const next = routeCoords[index + 1];
        const segmentDistance = haversineMeters(coord[1], coord[0], next[1], next[0]);
        return {
          segment: index + 1,
          distance: segmentDistance,
          duration: segmentDistance / assumedSpeedMps,
        };
      });
    }
  }

  return {
    distance,
    duration: distance / assumedSpeedMps,
    geometry: {
      type: "LineString",
      coordinates: routeCoords,
    },
    segments,
  };
}

function addUndirectedEdge(adjacency, a, b, cost) {
  adjacency.get(a).push({ to: b, cost });
  adjacency.get(b).push({ to: a, cost });
}

function shortestPathByDijkstra(adjacency, startId, endId) {
  const dist = new Map();
  const prev = new Map();
  const visited = new Set();

  for (const id of adjacency.keys()) {
    dist.set(id, Number.POSITIVE_INFINITY);
  }
  dist.set(startId, 0);

  while (visited.size < adjacency.size) {
    let currentId = null;
    let currentDist = Number.POSITIVE_INFINITY;
    for (const [id, value] of dist.entries()) {
      if (!visited.has(id) && value < currentDist) {
        currentId = id;
        currentDist = value;
      }
    }

    if (currentId === null) break;
    if (currentId === endId) break;
    visited.add(currentId);

    const edges = adjacency.get(currentId) || [];
    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      const alt = currentDist + edge.cost;
      if (alt < dist.get(edge.to)) {
        dist.set(edge.to, alt);
        prev.set(edge.to, currentId);
      }
    }
  }

  if (!Number.isFinite(dist.get(endId))) {
    return null;
  }

  const path = [];
  let cursor = endId;
  while (cursor) {
    path.push(cursor);
    if (cursor === startId) break;
    cursor = prev.get(cursor);
    if (!cursor) return null;
  }
  path.reverse();
  return path;
}

function buildNavigableShippingRoute(fromLat, fromLon, toLat, toLon, speedKph) {
  const fallback = buildGreatCircleRoute(fromLat, fromLon, toLat, toLon, speedKph);
  const nodes = new Map();
  for (const waypoint of shippingWaypoints) {
    nodes.set(waypoint.id, waypoint);
  }
  nodes.set("_start", { id: "_start", lat: fromLat, lon: fromLon });
  nodes.set("_end", { id: "_end", lat: toLat, lon: toLon });

  const adjacency = new Map();
  for (const id of nodes.keys()) {
    adjacency.set(id, []);
  }

  for (const [a, b] of shippingEdges) {
    const nodeA = nodes.get(a);
    const nodeB = nodes.get(b);
    if (!nodeA || !nodeB) continue;
    const edgeDistance = haversineMeters(nodeA.lat, nodeA.lon, nodeB.lat, nodeB.lon);
    addUndirectedEdge(adjacency, a, b, edgeDistance);
  }

  function connectVirtualNode(virtualId, maxLinks, maxDistanceKm) {
    const virtualNode = nodes.get(virtualId);
    const ranked = shippingWaypoints
      .map((waypoint) => ({
        id: waypoint.id,
        distance: haversineMeters(virtualNode.lat, virtualNode.lon, waypoint.lat, waypoint.lon),
      }))
      .sort((a, b) => a.distance - b.distance);

    const threshold = clamp(Number(maxDistanceKm), 50, 20000) * 1000;
    const inRange = ranked.filter((item) => item.distance <= threshold);
    const nearest = (inRange.length > 0 ? inRange : ranked.slice(0, 1)).slice(0, maxLinks);

    for (const item of nearest) {
      addUndirectedEdge(adjacency, virtualId, item.id, item.distance);
    }
  }

  connectVirtualNode("_start", 4, 1800);
  connectVirtualNode("_end", 4, 1800);

  const path = shortestPathByDijkstra(adjacency, "_start", "_end");
  if (!path || path.length < 2) {
    return {
      ...fallback,
      shippingMode: "great-circle-fallback",
    };
  }

  const routeCoords = path.map((id) => {
    const node = nodes.get(id);
    return [node.lon, node.lat];
  });

  let distance = 0;
  for (let i = 1; i < routeCoords.length; i += 1) {
    const prev = routeCoords[i - 1];
    const next = routeCoords[i];
    distance += haversineMeters(prev[1], prev[0], next[1], next[0]);
  }

  const assumedSpeedMps = (speedKph * 1000) / 3600;
  return {
    distance,
    duration: distance / assumedSpeedMps,
    geometry: {
      type: "LineString",
      coordinates: routeCoords,
    },
    segments: [],
    shippingMode: "navigable-approx",
    shippingNodePath: path,
  };
}

function getNearestShippingDistanceMeters(lat, lon) {
  let nearest = Number.POSITIVE_INFINITY;
  for (const waypoint of shippingWaypoints) {
    const d = haversineMeters(lat, lon, waypoint.lat, waypoint.lon);
    if (d < nearest) nearest = d;
  }
  return nearest;
}

function unwrapRouteLineLongitudes(line) {
  if (!Array.isArray(line) || line.length < 2) return line || [];

  const unwrapped = [line[0]];
  for (let i = 1; i < line.length; i += 1) {
    const next = line[i];
    const prevLon = unwrapped[unwrapped.length - 1][1];
    let lon = next[1];

    while (lon - prevLon > 180) lon -= 360;
    while (lon - prevLon < -180) lon += 360;

    unwrapped.push([next[0], lon]);
  }
  return unwrapped;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isPublicNominatim(baseUrl) {
  return /^https?:\/\/nominatim\.openstreetmap\.org(?:\/|$)/i.test(baseUrl);
}

function isPublicOsrmDemo(baseUrl) {
  return /^https?:\/\/router\.project-osrm\.org(?:\/|$)/i.test(baseUrl);
}

function updateProfileAvailability() {
  const baseUrl = els.apiBase.value.trim().replace(/\/+$/, "");
  const usingPublicDemo = isPublicOsrmDemo(baseUrl);

  for (const option of els.profile.options) {
    option.disabled = usingPublicDemo && publicOsrmLimitedProfiles.has(option.value);
  }

  if (usingPublicDemo) {
    if (publicOsrmLimitedProfiles.has(els.profile.value)) {
      els.profile.value = "driving";
    }
    els.profileHint.textContent = "Public OSRM demo may return identical results for walking/cycling. Those profiles are disabled on this endpoint.";
    els.profileHint.classList.remove("hidden");
  } else {
    els.profileHint.textContent = "";
    els.profileHint.classList.add("hidden");
  }
}

async function geocodeAddress(baseUrl, address, label) {
  const params = new URLSearchParams({
    q: address,
    format: "jsonv2",
    limit: "1",
    addressdetails: "0",
  });
  const url = `${baseUrl}/search?${params.toString()}`;

  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Geocoding failed (${label}): HTTP ${response.status}`);
  }
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Address not found (${label})`);
  }

  const item = data[0];
  const lat = Number(item.lat);
  const lon = Number(item.lon);
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(`Invalid geocode result (${label})`);
  }

  return {
    lat,
    lon,
    display: item.display_name || address,
  };
}

function writeCoordinates(fromPoint, toPoint) {
  els.fromLat.value = fromPoint.lat.toFixed(6);
  els.fromLon.value = fromPoint.lon.toFixed(6);
  els.toLat.value = toPoint.lat.toFixed(6);
  els.toLon.value = toPoint.lon.toFixed(6);
}

async function resolveAddressesIfEnabled() {
  if (!els.useAddress.checked) return;

  const fromAddress = els.fromAddress.value.trim();
  const toAddress = els.toAddress.value.trim();
  if (!fromAddress || !toAddress) {
    throw new Error("Both from/to address fields are required in address mode");
  }

  const baseUrl = els.geocodeBase.value.trim().replace(/\/+$/, "");
  if (!baseUrl) {
    throw new Error("Geocode base URL is required");
  }

  setStatus("Geocoding origin address...", "busy");
  const fromPoint = await geocodeAddress(baseUrl, fromAddress, "from");

  if (isPublicNominatim(baseUrl)) {
    await sleep(1100);
  }

  setStatus("Geocoding destination address...", "busy");
  const toPoint = await geocodeAddress(baseUrl, toAddress, "to");

  writeCoordinates(fromPoint, toPoint);
  syncMapMarkersFromInputs();
  els.geocodeResult.textContent = `From: ${fromPoint.display}\nTo: ${toPoint.display}`;
}

function buildRequestUrl() {
  const { fromLat, fromLon, toLat, toLon } = getCurrentCoordinates();

  const base = els.apiBase.value.trim().replace(/\/+$/, "");
  if (!base) throw new Error("API base URL is required");

  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    alternatives: String(els.alternatives.checked),
    steps: String(els.steps.checked),
    annotations: String(els.annotations.checked),
  });

  const path = `/route/v1/${encodeURIComponent(els.profile.value)}/${fromLon},${fromLat};${toLon},${toLat}`;
  return `${base}${path}?${params.toString()}`;
}

function computeGreatCircleResult(modeCode, speedKph) {
  const { fromLat, fromLon, toLat, toLon } = getCurrentCoordinates();
  const route = buildGreatCircleRoute(fromLat, fromLon, toLat, toLon, speedKph);
  return {
    code: modeCode,
    routes: [route],
  };
}

function ensureSimpleMap() {
  if (mapState.map) return true;
  if (typeof L === "undefined") {
    els.mapMeta.textContent = "Map library failed to load.";
    return false;
  }

  mapState.map = L.map(els.simpleMap, { zoomControl: true }).setView([25.0404, 121.5485], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }).addTo(mapState.map);

  mapState.startMarker = L.circleMarker([25.0330, 121.5654], {
    radius: 6,
    color: "#0a7a6f",
    fillColor: "#0a7a6f",
    fillOpacity: 0.9,
    weight: 1.5,
  }).bindTooltip("Start");
  mapState.endMarker = L.circleMarker([25.0478, 121.5319], {
    radius: 6,
    color: "#cc2956",
    fillColor: "#cc2956",
    fillOpacity: 0.9,
    weight: 1.5,
  }).bindTooltip("End");
  mapState.routeLayer = L.layerGroup();

  mapState.startMarker.addTo(mapState.map);
  mapState.endMarker.addTo(mapState.map);
  mapState.routeLayer.addTo(mapState.map);
  return true;
}

function syncMapMarkersFromInputs() {
  if (!ensureSimpleMap()) return;

  try {
    const { fromLat, fromLon, toLat, toLon } = getCurrentCoordinates();
    const start = L.latLng(fromLat, fromLon);
    const end = L.latLng(toLat, toLon);
    mapState.startMarker.setLatLng(start);
    mapState.endMarker.setLatLng(end);
    if (mapState.routeLines.length === 0) {
      mapState.map.fitBounds(L.latLngBounds([start, end]).pad(0.35));
    }
    els.mapMeta.textContent = "Map shows start/end and route geometry.";
  } catch {
    // Ignore invalid input while typing.
  }
}

function renderMapRoute(routeCoords) {
  if (!ensureSimpleMap()) return;

  const hasRoute = Array.isArray(routeCoords) && routeCoords.length >= 2;
  if (!hasRoute) {
    mapState.routeLayer.clearLayers();
    mapState.routeLines = [];
    syncMapMarkersFromInputs();
    return;
  }

  const line = routeCoords.map(([lon, lat]) => [lat, lon]);
  const displayLine = unwrapRouteLineLongitudes(line);
  mapState.routeLayer.clearLayers();
  mapState.routeLines = [
    L.polyline(displayLine, {
      color: "#1f76d1",
      weight: 4,
      opacity: 0.88,
    }).addTo(mapState.routeLayer),
  ];

  try {
    const bounds = L.latLngBounds(displayLine);
    mapState.startMarker.setLatLng(displayLine[0]);
    mapState.endMarker.setLatLng(displayLine[displayLine.length - 1]);
    mapState.map.fitBounds(bounds.pad(0.22));
  } catch {
    mapState.map.fitBounds(L.latLngBounds(displayLine).pad(0.22));
  }

  els.mapMeta.textContent = `Map route points: ${displayLine.length}`;
}

function renderGreatCircleSegments(routeDistance, routeDuration, segments) {
  if (!Array.isArray(segments) || segments.length === 0) {
    els.segmentPanel.classList.add("hidden");
    els.segmentTotals.textContent = "-";
    els.segmentList.innerHTML = "";
    return;
  }

  const segmentLines = segments.map(
    (segment) =>
      `<li>Segment ${segment.segment}: ${formatDistance(segment.distance)} / ${formatDuration(
        segment.duration,
      )}</li>`,
  );
  els.segmentTotals.textContent = `Segments: ${segments.length} | Total ${formatDistance(routeDistance)} | ${formatDuration(
    routeDuration,
  )}`;
  els.segmentList.innerHTML = segmentLines.join("");
  els.segmentPanel.classList.remove("hidden");
}

function renderRoute(data, requestUrl) {
  const route = data.routes?.[0];
  if (!route) throw new Error("No route result found");

  const routeCoords = Array.isArray(route.geometry?.coordinates) ? route.geometry.coordinates : null;
  els.distance.textContent = formatDistance(route.distance);
  els.duration.textContent = formatDuration(route.duration);
  els.routeCode.textContent = data.code || "-";
  els.requestUrl.textContent = requestUrl;
  els.rawJson.textContent = JSON.stringify(data, null, 2);
  renderGreatCircleSegments(route.distance, route.duration, route.segments);
  renderMapRoute(routeCoords);
}

function clearResults() {
  els.distance.textContent = "-";
  els.duration.textContent = "-";
  els.routeCode.textContent = "-";
  els.segmentPanel.classList.add("hidden");
  els.segmentTotals.textContent = "-";
  els.segmentList.innerHTML = "";
  els.rawJson.textContent = "-";
  renderMapRoute(null);
}

function swapCoords() {
  const fromAddress = els.fromAddress.value;
  const fromLat = els.fromLat.value;
  const fromLon = els.fromLon.value;
  els.fromAddress.value = els.toAddress.value;
  els.fromLat.value = els.toLat.value;
  els.fromLon.value = els.toLon.value;
  els.toAddress.value = fromAddress;
  els.toLat.value = fromLat;
  els.toLon.value = fromLon;
  renderMapRoute(null);
  syncMapMarkersFromInputs();
}

async function resolveAddressesManual() {
  try {
    if (!els.useAddress.checked) {
      throw new Error("Enable 'Use address input' before resolving addresses");
    }
    await resolveAddressesIfEnabled();
    renderMapRoute(null);
    syncMapMarkersFromInputs();
    setStatus("Address geocoding completed", "ok");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function run() {
  try {
    updateProfileAvailability();
    await resolveAddressesIfEnabled();

    if (els.profile.value === "aviation-gc") {
      setStatus("Calculating aviation great-circle distance...", "busy");
      const { fromLat, fromLon, toLat, toLon } = getCurrentCoordinates();
      const route = buildGreatCircleRoute(fromLat, fromLon, toLat, toLon, 900, 500);
      const data = {
        code: "AviationGreatCircle",
        routes: [route],
      };
      els.requestUrl.textContent = "N/A (local calculation)";
      renderRoute(data, "N/A (local calculation)");
      setStatus("Completed", "ok");
      return;
    }

    if (els.profile.value === "shipping-gc") {
      setStatus("Calculating navigable shipping route...", "busy");
      const { fromLat, fromLon, toLat, toLon } = getCurrentCoordinates();
      const route = buildNavigableShippingRoute(fromLat, fromLon, toLat, toLon, 35);
      const data = {
        code: route.shippingMode === "navigable-approx" ? "ShippingNavigableApprox" : "ShippingGreatCircleFallback",
        routes: [route],
      };
      els.requestUrl.textContent = "N/A (local navigable approximation)";
      renderRoute(data, "N/A (local navigable approximation)");
      const fromSea = getNearestShippingDistanceMeters(fromLat, fromLon);
      const toSea = getNearestShippingDistanceMeters(toLat, toLon);
      if (fromSea > 250000 || toSea > 250000) {
        setStatus("Completed (endpoint far from sea, route uses nearest maritime corridor approximation)", "ok");
      } else {
        setStatus("Completed", "ok");
      }
      return;
    }

    setStatus("Building request...", "busy");
    const requestUrl = buildRequestUrl();
    els.requestUrl.textContent = requestUrl;

    setStatus("Calling OSRM API...", "busy");
    const response = await fetch(requestUrl);
    const data = await response.json();

    if (!response.ok || data.code !== "Ok") {
      const msg = data.message || `HTTP ${response.status}`;
      throw new Error(`OSRM request failed: ${msg}`);
    }

    renderRoute(data, requestUrl);
    setStatus("Completed", "ok");
  } catch (error) {
    setStatus(error.message, "error");
    clearResults();
  }
}

els.runBtn.addEventListener("click", run);
els.geocodeBtn.addEventListener("click", resolveAddressesManual);
els.swapBtn.addEventListener("click", swapCoords);
els.apiBase.addEventListener("input", updateProfileAvailability);
els.fromLat.addEventListener("input", syncMapMarkersFromInputs);
els.fromLon.addEventListener("input", syncMapMarkersFromInputs);
els.toLat.addEventListener("input", syncMapMarkersFromInputs);
els.toLon.addEventListener("input", syncMapMarkersFromInputs);

updateProfileAvailability();
ensureSimpleMap();
syncMapMarkersFromInputs();
