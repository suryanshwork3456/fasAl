"use client";

/**
 * FieldVisual — a procedurally generated, seeded "satellite tile" style
 * preview. It is NOT a real satellite photo — it renders a deterministic
 * grid of colored cells (like a simplified NDVI raster) plus a field
 * boundary outline, purely in SVG. This avoids relying on any stock image
 * (so there is nothing to accidentally leave as a designer placeholder)
 * and lets every field / layer look distinct and intentional.
 *
 * layer: "ndvi" | "trueColor" | "moisture"
 * seed: any string/number — same seed always renders the same pattern
 * ndvi/moisture: optional 0-1 / 0-100 values that bias the average color
 */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function seedFromString(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) | 0;
  return h;
}

// NDVI-style ramp: low (stressed, red/brown) -> high (healthy, deep green)
const NDVI_RAMP = ["#8a3b1d", "#c1622b", "#e0973b", "#e9c94a", "#c7d94a", "#93c94a", "#5fb84a", "#2f9e46", "#1f7d3a"];
// Moisture ramp: dry (tan) -> saturated (deep blue)
const MOISTURE_RAMP = ["#d8c48a", "#c7b47a", "#a9c48f", "#7db1a8", "#4f97b6", "#3178a8", "#1f5f97", "#173f78"];
// True color: natural earth/crop tones
const TRUE_RAMP = ["#6b5a3a", "#7c6a3f", "#8a7a3e", "#7a8a3c", "#5f8a3e", "#3f7a3a", "#2f6a35", "#dbc36a"];

function rampFor(layer) {
  if (layer === "moisture") return MOISTURE_RAMP;
  if (layer === "trueColor") return TRUE_RAMP;
  return NDVI_RAMP;
}

export default function FieldVisual({ layer = "ndvi", seed = "field", value, cols = 12, rows = 8, className = "", showLegendDot = true }) {
  const rnd = mulberry32(seedFromString(`${seed}-${layer}`));
  const ramp = rampFor(layer);

  // bias: shift the average index in the ramp based on the field's health value
  let bias = 0.5;
  if (typeof value === "number") {
    bias = layer === "moisture" ? Math.min(1, Math.max(0, value / 100)) : Math.min(1, Math.max(0, value));
  }

  const W = 400, H = Math.round((400 * rows) / cols);
  const cellW = W / cols, cellH = H / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // smooth-ish noise via sin blending so neighboring cells look related
      const n = (Math.sin((r * 12.9898 + c * 78.233 + seedFromString(seed)) * 0.7) + 1) / 2;
      const jitter = (rnd() - 0.5) * 0.35;
      let t = Math.min(1, Math.max(0, bias * 0.65 + n * 0.35 + jitter));
      const idx = Math.round(t * (ramp.length - 1));
      cells.push({ x: c * cellW, y: r * cellH, fill: ramp[idx] });
    }
  }

  // simple field boundary polygon (slightly irregular, deterministic per seed)
  const cx = W / 2, cy = H / 2;
  const points = [
    [cx - W * 0.32, cy - H * 0.3],
    [cx + W * 0.28, cy - H * 0.36],
    [cx + W * 0.34, cy + H * 0.22],
    [cx - W * 0.06, cy + H * 0.34],
    [cx - W * 0.36, cy + H * 0.08],
  ].map(([x, y]) => `${(x + (rnd() - 0.5) * 6).toFixed(1)},${(y + (rnd() - 0.5) * 6).toFixed(1)}`).join(" ");

  const gridId = `fv-clip-${seed}-${layer}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${layer} preview`}>
      <defs>
        <clipPath id={gridId}><rect x="0" y="0" width={W} height={H} rx="0" /></clipPath>
      </defs>
      <g clipPath={`url(#${gridId})`}>
        {cells.map((cell, i) => (
          <rect key={i} x={cell.x} y={cell.y} width={cellW + 0.6} height={cellH + 0.6} fill={cell.fill} />
        ))}
        {/* subtle plot/row lines for a "field" feel */}
        {Array.from({ length: cols + 1 }).map((_, i) => (
          <line key={`v${i}`} x1={i * cellW} y1={0} x2={i * cellW} y2={H} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
        ))}
      </g>
      <polygon points={points} fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
      {showLegendDot && (
        <g>
          <circle cx={W - 18} cy={18} r="9" fill="rgba(255,255,255,0.92)" />
          <circle cx={W - 18} cy={18} r="5" fill={ramp[Math.round(bias * (ramp.length - 1))]} />
        </g>
      )}
    </svg>
  );
}
