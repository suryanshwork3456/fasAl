// Mock stand-in for POST /api/v1/leaf/scan.
//
// The real backend endpoint exists but is currently broken (integer/UUID
// field_id mismatch causes a 500 — see backend integration doc, Section 8).
// This mock returns data shaped exactly like the INTENDED real response,
// plus a multi-class confidence breakdown (spec Section 11), so the UI can
// be built now and later pointed at the real endpoint with no changes
// beyond swapping this function's implementation for a real fetch().

const MOCK_RESULTS = [
  {
    category: "possible_leaf_spot",
    label: "Possible Leaf Spot",
    confidence: 0.82,
    others: [
      { label: "Nutrient Stress", confidence: 0.11 },
      { label: "Water Stress", confidence: 0.07 },
    ],
  },
  {
    category: "healthy",
    label: "Healthy Leaf",
    confidence: 0.91,
    others: [
      { label: "Early Nutrient Stress", confidence: 0.06 },
      { label: "Possible Leaf Spot", confidence: 0.03 },
    ],
  },
  {
    category: "possible_rust",
    label: "Possible Leaf Rust",
    confidence: 0.74,
    others: [
      { label: "Possible Leaf Spot", confidence: 0.15 },
      { label: "Water Stress", confidence: 0.11 },
    ],
  },
];

export function analyzeLeafImage({ fieldId, zone } = {}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const picked = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
      resolve({
        scan_id: `mock-${Date.now()}`,
        field_id: fieldId || null,
        zone: zone || null,
        status: "complete",
        data_source: "mock",
        result: picked,
        message: "Image analyzed (demo mode — not a real model inference).",
      });
    }, 1400);
  });
}