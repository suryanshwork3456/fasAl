// Rule-based assessment + recommendation generator.
//
// This mirrors what the backend is planned to eventually do (see backend
// integration doc, Section 7: "recommendations are planned as a future
// rule-based feature", and the original spec's Section 31 rule-based
// recommendation engine). Keeping the SAME rule shape here means that when
// the real endpoint starts returning `aiAssessment`/`recommendation`
// strings, we just stop calling this function locally — no UI rework.
//
// Deliberately NOT a medicine/treatment engine (see project discussion):
// only ever suggests inspection / irrigation checks / expert verification,
// never a specific treatment or dosage.

import { getNdviStatus } from "@/lib/ndvi";

export function buildAssessment({ ndvi, stressedArea, moisture, tempC }, t = {}) {
  const status = getNdviStatus(ndvi);
  const reasons = [];

  const lowMoisture = moisture != null && moisture < 25;
  const highTemp = tempC != null && tempC >= 30;
  const highStress = stressedArea != null && stressedArea >= 20;

  if (lowMoisture) reasons.push(t.reasonLowMoisture || "low soil moisture");
  if (highTemp) reasons.push(t.reasonHighTemp || "high temperature");
  if (highStress) reasons.push(t.reasonVegStress || "vegetation stress in part of the field");

  let aiAssessment;
  let recommendation;

  if (status === "healthy" && reasons.length === 0) {
    aiAssessment = t.assessmentHealthy || "Vegetation signal across the field looks strong, with no major stress zones detected.";
    recommendation = t.recommendationHealthy || "No action needed right now — continue routine monitoring.";
  } else if (status === "stressed" || highStress) {
    aiAssessment = (t.assessmentStressedPrefix || "Vegetation stress was detected in part of the field.") +
      (reasons.length ? ` ${t.possibleFactors || "Possible contributing factors"}: ${reasons.join(", ")}.` : "");
    recommendation = t.recommendationStressed || "Inspect the affected area and check irrigation. If leaf symptoms are visible, consider expert verification.";
  } else {
    aiAssessment = (t.assessmentModeratePrefix || "Some early signs of stress are visible, though most of the field looks stable.") +
      (reasons.length ? ` ${t.possibleFactors || "Possible contributing factors"}: ${reasons.join(", ")}.` : "");
    recommendation = t.recommendationModerate || "Keep an eye on this field over the next few days and check soil moisture.";
  }

  return {
    measured: { ndvi, stressedArea, moisture, tempC },
    aiAssessment,
    recommendation,
    status,
  };
}