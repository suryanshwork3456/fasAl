// One crop-health record per field, keyed by field id (matches mocks/fields.js ids).
export const cropHealthByField = {
  "north-01": {
    score: 92, status: "Healthy", ndvi: 0.78, stressedArea: 4, moisture: 31, tempC: 28,
    trend: [80, 82, 85, 88, 90, 91, 92],
    zones: [{ name: "North-West", value: "Healthy" }, { name: "South-East", value: "Healthy" }],
  },
  "south-02": {
    score: 76, status: "Moderate", ndvi: 0.61, stressedArea: 15, moisture: 24, tempC: 31,
    trend: [70, 71, 73, 74, 75, 76, 76],
    zones: [{ name: "North-West", value: "Healthy" }, { name: "South-East", value: "Water Stress" }],
  },
  "east-03": {
    score: 58, status: "Stressed", ndvi: 0.43, stressedArea: 32, moisture: 18, tempC: 33,
    trend: [64, 62, 60, 59, 58, 57, 58],
    zones: [{ name: "North-West", value: "Water Stress" }, { name: "South-East", value: "Water Stress" }],
  },
};

// Fallback so nothing crashes if an unknown/missing field id is requested.
export const defaultCropHealth = cropHealthByField["north-01"];