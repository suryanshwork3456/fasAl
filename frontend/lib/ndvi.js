export function getNdviStatus(value) {
  if (value >= 0.8) return "dark_green";
  if (value >= 0.55) return "light_green";
  if (value > 0.45) return "light_yellow";
  if (value >= 0.35) return "dark_yellow";
  if (value >= 0.2) return "moderate_red";
  if (value >= 0) return "red";
  return "unusable"; // Below 0: black (land is not for farming)
}

export const STATUS_COLOR = {
  dark_green: "#14532d",
  light_green: "#166534",
  light_yellow: "#854d0e",
  dark_yellow: "#713f12",
  moderate_red: "#991b1b",
  red: "#7f1d1d",
  unusable: "#6B7280",
};

// Solid, high-contrast fill colors for the map grid matching your exact ranges
export const STATUS_FILL = {
  dark_green: "#15803d",    // Value >= 0.8
  light_green: "#22c55e",   // 0.6 to < 0.8
  light_yellow: "#fef08a",  // 0.45 to < 0.6 (Light yellow)
  dark_yellow: "#eab308",   // 0.35 to 0.45 (Dark yellow)
  moderate_red: "#f87171",  // 0.2 to < 0.35 (Moderate red)
  red: "#ef4444",           // 0 to < 0.2 (Red)
  unusable: "#6B7280",      // Below 0 (Gray - land not for farming)
};

// Updated NDVI-style ramp: Black (unusable) -> Red -> Yellow -> Green shades
export const NDVI_RAMP = [
  "#000000", // < 0 (Black)
  "#ef4444", // Red
  "#f87171", // Moderate Red
  "#eab308", // Dark Yellow
  "#fef08a", // Light Yellow
  "#22c55e", // Light Green
  "#15803d"  // Dark Green
];

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