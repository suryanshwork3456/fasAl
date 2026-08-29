// Single source of truth for NDVI/moisture visuals, shared by FieldVisual
// (card previews) and FieldMap (real Leaflet view) so they can never drift
// out of sync with each other or with the backend's own convention.

// Thresholds match the backend contract (see integration guide):
// NDVI >= 0.6 -> healthy, >= 0.3 -> moderate, below -> stressed.
// Keeping this in one function means we never hardcode 0.6 / 0.3 again.
export function getNdviStatus(value) {
  if (value >= 0.6) return "healthy";
  if (value >= 0.3) return "moderate";
  return "stressed";
}

export const STATUS_COLOR = {
  healthy: "#1f7d3a",
  moderate: "#e9c94a",
  stressed: "#c1622b",
};

// NDVI-style ramp: low (stressed, red/brown) -> high (healthy, deep green)
export const NDVI_RAMP = ["#8a3b1d", "#c1622b", "#e0973b", "#e9c94a", "#c7d94a", "#93c94a", "#5fb84a", "#2f9e46", "#1f7d3a"];
// Moisture ramp: dry (tan) -> saturated (deep blue)
export const MOISTURE_RAMP = ["#d8c48a", "#c7b47a", "#a9c48f", "#7db1a8", "#4f97b6", "#3178a8", "#1f5f97", "#173f78"];
// True color: natural earth/crop tones
export const TRUE_RAMP = ["#6b5a3a", "#7c6a3f", "#8a7a3e", "#7a8a3c", "#5f8a3e", "#3f7a3a", "#2f6a35", "#dbc36a"];

export function rampFor(layer) {
  if (layer === "moisture") return MOISTURE_RAMP;
  if (layer === "trueColor") return TRUE_RAMP;
  return NDVI_RAMP;
}

// Pick a ramp color for a 0-1 "bias" position (used for continuous shading).
export function colorForBias(layer, bias) {
  const ramp = rampFor(layer);
  const idx = Math.round(Math.min(1, Math.max(0, bias)) * (ramp.length - 1));
  return ramp[idx];
}

// Deterministic tiny PRNG so the same field/seed always renders the same
// pattern (no flicker between renders, no randomness mismatch client/server).
export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function seedFromString(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
  return h;
}