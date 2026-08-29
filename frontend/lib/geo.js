


// Turns a drawn field boundary into a real area in hectares.
//
// GeoJSON stores points as [longitude, latitude]. Because degrees of
// longitude get "narrower" as you move away from the equator, we first
// convert each point to flat metres (correcting for latitude) before
// running the standard polygon-area (shoelace) formula. For a single
// farm field (a few hundred metres across) this is accurate to well
// under 1%, which is more than good enough for this use case.

const EARTH_RADIUS_M = 6371000;

function toMeters([lon, lat], originLat) {
  const x = (lon * Math.PI) / 180 * EARTH_RADIUS_M * Math.cos((originLat * Math.PI) / 180);
  const y = (lat * Math.PI) / 180 * EARTH_RADIUS_M;
  return [x, y];
}

// Accepts a GeoJSON Polygon geometry: { type: "Polygon", coordinates: [[[lon,lat], ...]] }
// (this is exactly what Leaflet Draw's `.toGeoJSON().geometry` produces).
// Returns area in hectares, rounded to 2 decimal places. Returns null if
// the boundary is missing or has fewer than 3 points (not a real shape yet).
export function polygonAreaHectares(geometry) {
  const ring = geometry?.coordinates?.[0];
  if (!ring || ring.length < 3) return null;

  const originLat = ring[0][1];
  const points = ring.map((p) => toMeters(p, originLat));

  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  const areaM2 = Math.abs(sum) / 2;
  const hectares = areaM2 / 10000;
  return Math.round(hectares * 100) / 100;
}