const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "";
const MAP_PROVIDER = (process.env.MAP_PROVIDER || "osm").toLowerCase();
const FRENCH_ADDRESS_BASE_URL = process.env.FRENCH_ADDRESS_BASE_URL || "https://api-adresse.data.gouv.fr";
const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
const OSRM_BASE_URL = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
const SERVER_CONTACT_EMAIL = process.env.SERVER_CONTACT_EMAIL || "";
const RESTAURANT = {
    name: "ZEN SUSHI WOK",
    address: "108 Boulevard du General de Gaulle, 06340 La Trinite, France",
    lat: 43.743546,
    lng: 7.313728
};

const DELIVERY_ZONES = [
    { max: 1, fee: 0, minimum: 15 },
    { max: 2.99, fee: 2, minimum: 25 },
    { max: 4.99, fee: 3, minimum: 35 },
    { max: 10, fee: 5, minimum: 45 }
];

const cache = new Map();

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

function sendJson(res, status, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end(body);
}

function sendHealthCheck(res) {
    res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
    });
    res.end("ok");
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => {
            body += chunk;
            if (body.length > 1_000_000) {
                req.destroy();
                reject(new Error("Request body too large"));
            }
        });
        req.on("end", () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (error) {
                reject(error);
            }
        });
        req.on("error", reject);
    });
}

function requireGoogleKey(res) {
    if (GOOGLE_MAPS_API_KEY) return true;
    sendJson(res, 500, {
        error: "GOOGLE_MAPS_API_KEY is missing on the server."
    });
    return false;
}

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function cacheSet(key, value, ttlMs = 10 * 60 * 1000) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
}

async function googleFetch(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = data.error?.message || data.error_message || `Google API error ${response.status}`;
        throw new Error(message);
    }
    return data;
}

async function osmFetch(url, options = {}) {
    const headers = {
        "Accept": "application/json",
        "User-Agent": SERVER_CONTACT_EMAIL
            ? `ZenSushiWokDelivery/1.0 (${SERVER_CONTACT_EMAIL})`
            : "ZenSushiWokDelivery/1.0"
    };
    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`OpenStreetMap service error ${response.status}`);
    }
    return data;
}

async function jsonFetch(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(`Address service error ${response.status}`);
    }
    return data;
}

function zoneForDistance(distanceKm) {
    return DELIVERY_ZONES.find((zone) => distanceKm <= zone.max) || null;
}

function formatOsmAddress(place) {
    return place.display_name || place.name || "";
}

function normalizeOsmPlace(place) {
    return {
        address: formatOsmAddress(place),
        lat: Number(place.lat),
        lng: Number(place.lon),
        placeId: `${place.osm_type || "osm"}:${place.osm_id || place.place_id || ""}`
    };
}

function isUsableLocation(location) {
    return location
        && Number.isFinite(Number(location.lat))
        && Number.isFinite(Number(location.lng));
}

async function searchOsmAddress(input, limit = 6) {
    const normalizedInput = String(input || "").trim();
    if (!normalizedInput) return [];
    const cacheKey = `osm:search:${limit}:${normalizedInput.toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        q: normalizedInput,
        format: "jsonv2",
        addressdetails: "1",
        limit: String(limit),
        countrycodes: "fr",
        "accept-language": "fr"
    });
    const data = await osmFetch(`${NOMINATIM_BASE_URL}/search?${params}`);
    const places = (Array.isArray(data) ? data : [])
        .map(normalizeOsmPlace)
        .filter((place) => place.address && isUsableLocation(place));
    return cacheSet(cacheKey, places);
}

function normalizeFrenchAddressFeature(feature) {
    const coordinates = feature.geometry && feature.geometry.coordinates;
    const properties = feature.properties || {};
    if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
    return {
        address: properties.label || properties.name || "",
        lat: Number(coordinates[1]),
        lng: Number(coordinates[0]),
        placeId: `ban:${properties.id || properties.banId || properties.label || ""}`,
        score: Number(properties.score) || 0
    };
}

async function searchFrenchAddress(input, limit = 6) {
    const normalizedInput = String(input || "").trim();
    if (!normalizedInput) return [];
    const cacheKey = `ban:search:${limit}:${normalizedInput.toLowerCase()}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
        q: normalizedInput,
        limit: String(limit),
        autocomplete: "1",
        lat: String(RESTAURANT.lat),
        lon: String(RESTAURANT.lng)
    });
    const data = await jsonFetch(`${FRENCH_ADDRESS_BASE_URL}/search/?${params}`);
    const places = (data.features || [])
        .map(normalizeFrenchAddressFeature)
        .filter((place) => place && place.address && isUsableLocation(place));
    return cacheSet(cacheKey, places);
}

async function searchAddress(input, limit = 6) {
    const frenchPlaces = await searchFrenchAddress(input, limit).catch(() => []);
    if (frenchPlaces.length) return frenchPlaces;
    return searchOsmAddress(input, limit);
}

async function geocodeOsmAddress({ address, placeId }) {
    if (placeId && placeId.includes(":")) {
        const cachedPlaces = [...cache.values()]
            .map((entry) => entry.value)
            .filter(Array.isArray)
            .flat();
        const found = cachedPlaces.find((place) => place.placeId === placeId);
        if (found) return found;
    }
    const places = await searchAddress(address, 1);
    return places[0] || null;
}

async function computeOsmRoute(destination) {
    const cacheKey = `osrm:route:${destination.lat},${destination.lng}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const coordinates = [
        `${RESTAURANT.lng},${RESTAURANT.lat}`,
        `${destination.lng},${destination.lat}`
    ].join(";");
    const params = new URLSearchParams({
        overview: "false",
        alternatives: "false",
        steps: "false"
    });
    const data = await osmFetch(`${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${params}`);
    const route = data.routes && data.routes[0];
    if (!route || !Number.isFinite(Number(route.distance))) return null;
    return cacheSet(cacheKey, {
        distanceMeters: Number(route.distance),
        durationMinutes: Number.isFinite(Number(route.duration))
            ? Math.max(1, Math.round(Number(route.duration) / 60))
            : null
    });
}

function parseGoogleDuration(duration) {
    const seconds = Number(String(duration || "").replace("s", ""));
    return Number.isFinite(seconds) ? Math.max(1, Math.round(seconds / 60)) : null;
}

async function geocodeAddress({ address, placeId }) {
    const params = new URLSearchParams({
        key: GOOGLE_MAPS_API_KEY,
        language: "fr",
        region: "fr"
    });
    if (placeId) params.set("place_id", placeId);
    else params.set("address", address);

    const data = await googleFetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
    if (data.status !== "OK" || !data.results?.length) {
        return null;
    }

    const result = data.results[0];
    const location = result.geometry?.location;
    if (!location) return null;
    return {
        address: result.formatted_address,
        lat: location.lat,
        lng: location.lng,
        placeId: result.place_id || placeId || ""
    };
}

async function computeRoute(destination) {
    const data = await googleFetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
        },
        body: JSON.stringify({
            origin: {
                location: {
                    latLng: {
                        latitude: RESTAURANT.lat,
                        longitude: RESTAURANT.lng
                    }
                }
            },
            destination: {
                location: {
                    latLng: {
                        latitude: destination.lat,
                        longitude: destination.lng
                    }
                }
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE"
        })
    });

    const route = data.routes?.[0];
    if (!route || !Number.isFinite(Number(route.distanceMeters))) return null;
    return {
        distanceMeters: Number(route.distanceMeters),
        durationMinutes: parseGoogleDuration(route.duration)
    };
}

async function handleAutocomplete(req, res) {
    const body = await readBody(req);
    const input = String(body.input || "").trim();
    if (input.length < 3) {
        sendJson(res, 200, { suggestions: [] });
        return;
    }

    if (MAP_PROVIDER !== "google" || !GOOGLE_MAPS_API_KEY) {
        const places = await searchAddress(input, 6);
        sendJson(res, 200, {
            provider: "osm",
            suggestions: places.map((place) => ({
                placeId: place.placeId,
                text: place.address
            }))
        });
        return;
    }

    if (!requireGoogleKey(res)) return;
    const data = await googleFetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
            "X-Goog-FieldMask": "suggestions.placePrediction.placeId,suggestions.placePrediction.text"
        },
        body: JSON.stringify({
            input,
            languageCode: "fr",
            regionCode: "FR",
            locationBias: {
                circle: {
                    center: {
                        latitude: RESTAURANT.lat,
                        longitude: RESTAURANT.lng
                    },
                    radius: 18000
                }
            }
        })
    });

    const suggestions = (data.suggestions || [])
        .map((suggestion) => suggestion.placePrediction)
        .filter(Boolean)
        .map((prediction) => ({
            placeId: prediction.placeId,
            text: prediction.text?.text || ""
        }))
        .filter((prediction) => prediction.placeId && prediction.text)
        .slice(0, 6);

    sendJson(res, 200, { provider: "google", suggestions });
}

async function handleDeliveryEstimate(req, res) {
    const body = await readBody(req);
    const address = String(body.address || "").trim();
    const placeId = String(body.placeId || "").trim();

    if (!address && !placeId) {
        sendJson(res, 400, { error: "Adresse livraison manquante." });
        return;
    }

    const useGoogle = MAP_PROVIDER === "google" && GOOGLE_MAPS_API_KEY;
    if (MAP_PROVIDER === "google" && !GOOGLE_MAPS_API_KEY && !useGoogle) {
        sendJson(res, 500, { error: "GOOGLE_MAPS_API_KEY is missing on the server." });
        return;
    }

    const geocoded = useGoogle
        ? await geocodeAddress({ address, placeId })
        : await geocodeOsmAddress({ address, placeId });
    if (!geocoded) {
        sendJson(res, 200, {
            available: false,
            provider: useGoogle ? "google" : "osm",
            message: "Adresse introuvable. Veuillez choisir une adresse valide."
        });
        return;
    }

    const route = useGoogle
        ? await computeRoute(geocoded)
        : await computeOsmRoute(geocoded);
    if (!route) {
        sendJson(res, 200, {
            available: false,
            address: geocoded.address,
            provider: useGoogle ? "google" : "osm",
            message: "Zone non desservie actuellement."
        });
        return;
    }

    const distanceKm = route.distanceMeters / 1000;
    const zone = zoneForDistance(distanceKm);
    if (!zone) {
        sendJson(res, 200, {
            available: false,
            address: geocoded.address,
            distance: Number(distanceKm.toFixed(2)),
            provider: useGoogle ? "google" : "osm",
            message: "Zone non desservie actuellement."
        });
        return;
    }

    sendJson(res, 200, {
        available: true,
        provider: useGoogle ? "google" : "osm",
        address: geocoded.address,
        placeId: geocoded.placeId,
        distance: Number(distanceKm.toFixed(2)),
        distanceMeters: route.distanceMeters,
        fee: zone.fee,
        minimum: zone.minimum,
        etaMinutes: route.durationMinutes,
        eta: route.durationMinutes ? `${route.durationMinutes} min` : "A confirmer",
        mapUrl: buildGoogleMapsDirectionsUrl(geocoded.address)
    });
}

function buildGoogleMapsDirectionsUrl(destination) {
    const params = new URLSearchParams({
        api: "1",
        origin: RESTAURANT.address,
        destination,
        travelmode: "driving"
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function serveStatic(req, res, pathname) {
    const safePath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname)
        .replace(/^[/\\]+/, "");
    const filePath = path.resolve(ROOT, safePath);
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    fs.stat(filePath, (error, stat) => {
        if (error || !stat.isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            res.end("Not found");
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const isHtml = ext === ".html";
        const isCacheableAsset = [".css", ".js", ".jpg", ".jpeg", ".png", ".webp", ".svg", ".ico"].includes(ext);
        res.writeHead(200, {
            "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
            "Content-Length": stat.size,
            "Cache-Control": isHtml
                ? "no-cache"
                : isCacheableAsset
                    ? "public, max-age=86400"
                    : "public, max-age=3600"
        });
        if (req.method === "HEAD") {
            res.end();
            return;
        }
        fs.createReadStream(filePath).pipe(res);
    });
}

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/healthz") {
            sendHealthCheck(res);
            return;
        }
        if (req.method === "POST" && url.pathname === "/api/places/autocomplete") {
            await handleAutocomplete(req, res);
            return;
        }
        if (req.method === "POST" && url.pathname === "/api/delivery/estimate") {
            await handleDeliveryEstimate(req, res);
            return;
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
            sendJson(res, 405, { error: "Method not allowed" });
            return;
        }
        serveStatic(req, res, url.pathname);
    } catch (error) {
        sendJson(res, 500, { error: error.message || "Server error" });
    }
});

server.listen(PORT, () => {
    console.log(`Zen Sushi Wok running at http://localhost:${PORT}`);
});
