export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
export function formatNumber(value, digits = 0) {
  return Number(value).toFixed(digits);
}
