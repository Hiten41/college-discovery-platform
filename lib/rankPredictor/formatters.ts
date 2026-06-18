export function formatRankPredictorFees(value: number | null): string {
  if (value === null) return "Not available";

  const lakhs = value / 100000;
  const formatted = Number.isInteger(lakhs)
    ? lakhs.toFixed(0)
    : lakhs.toFixed(1).replace(/\.0$/, "");

  return `₹${formatted} Lakhs`;
}
