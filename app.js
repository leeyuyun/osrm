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
  requestUrl: document.getElementById("requestUrl"),
  rawJson: document.getElementById("rawJson"),
  preview: document.getElementById("preview"),
};

const publicOsrmLimitedProfiles = new Set(["driving-traffic", "walking", "cycling"]);

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

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function geocodeAddress(baseUrl, address, label) {
  const params = new URLSearchParams({
    q: address,
    format: "jsonv2",
    limit: "1",
    addressdetails: "0",
  });
  const url = `${baseUrl}/search?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
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
  els.geocodeResult.textContent = `From: ${fromPoint.display}\nTo: ${toPoint.display}`;
}

function buildRequestUrl() {
  const fromLat = parseCoordinate(els.fromLat, { min: -90, max: 90, name: "From latitude" });
  const fromLon = parseCoordinate(els.fromLon, { min: -180, max: 180, name: "From longitude" });
  const toLat = parseCoordinate(els.toLat, { min: -90, max: 90, name: "To latitude" });
  const toLon = parseCoordinate(els.toLon, { min: -180, max: 180, name: "To longitude" });

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
  const fromLat = parseCoordinate(els.fromLat, { min: -90, max: 90, name: "From latitude" });
  const fromLon = parseCoordinate(els.fromLon, { min: -180, max: 180, name: "From longitude" });
  const toLat = parseCoordinate(els.toLat, { min: -90, max: 90, name: "To latitude" });
  const toLon = parseCoordinate(els.toLon, { min: -180, max: 180, name: "To longitude" });

  const distance = haversineMeters(fromLat, fromLon, toLat, toLon);
  const assumedCruiseSpeedMps = (speedKph * 1000) / 3600;
  const duration = distance / assumedCruiseSpeedMps;

  return {
    code: modeCode,
    routes: [
      {
        distance,
        duration,
        geometry: {
          type: "LineString",
          coordinates: [
            [fromLon, fromLat],
            [toLon, toLat],
          ],
        },
      },
    ],
  };
}

function polylinePath(coords, width, height, padding = 8) {
  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const xSpan = Math.max(maxX - minX, 1e-9);
  const ySpan = Math.max(maxY - minY, 1e-9);
  const drawW = width - padding * 2;
  const drawH = height - padding * 2;

  return coords
    .map(([x, y], i) => {
      const px = padding + ((x - minX) / xSpan) * drawW;
      const py = padding + (1 - (y - minY) / ySpan) * drawH;
      return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    })
    .join(" ");
}

function renderPreview(route) {
  const geometry = route?.geometry;
  const coords = geometry?.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    els.preview.classList.add("empty");
    els.preview.textContent = "No geometry returned";
    return;
  }

  const width = 520;
  const height = 220;
  const d = polylinePath(coords, width, height);
  els.preview.classList.remove("empty");
  els.preview.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Route preview">
      <rect x="0" y="0" width="${width}" height="${height}" fill="transparent"></rect>
      <path d="${d}" fill="none" stroke-width="4" stroke="#0c8f82" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `;
}

function renderRoute(data, requestUrl) {
  const route = data.routes?.[0];
  if (!route) throw new Error("No route result found");

  els.distance.textContent = formatDistance(route.distance);
  els.duration.textContent = formatDuration(route.duration);
  els.routeCode.textContent = data.code || "-";
  els.requestUrl.textContent = requestUrl;
  els.rawJson.textContent = JSON.stringify(data, null, 2);
  renderPreview(route);
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
}

async function resolveAddressesManual() {
  try {
    if (!els.useAddress.checked) {
      throw new Error("Enable 'Use address input' before resolving addresses");
    }
    await resolveAddressesIfEnabled();
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
      const data = computeGreatCircleResult("AviationGreatCircle", 900);
      els.requestUrl.textContent = "N/A (local calculation)";
      renderRoute(data, "N/A (local calculation)");
      setStatus("Completed", "ok");
      return;
    }

    if (els.profile.value === "shipping-gc") {
      setStatus("Calculating shipping great-circle distance...", "busy");
      const data = computeGreatCircleResult("ShippingGreatCircle", 35);
      els.requestUrl.textContent = "N/A (local calculation)";
      renderRoute(data, "N/A (local calculation)");
      setStatus("Completed", "ok");
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
    els.distance.textContent = "-";
    els.duration.textContent = "-";
    els.routeCode.textContent = "-";
    els.rawJson.textContent = "-";
    els.preview.classList.add("empty");
    els.preview.textContent = "No route yet";
  }
}

els.runBtn.addEventListener("click", run);
els.geocodeBtn.addEventListener("click", resolveAddressesManual);
els.swapBtn.addEventListener("click", swapCoords);
els.apiBase.addEventListener("input", updateProfileAvailability);
updateProfileAvailability();
