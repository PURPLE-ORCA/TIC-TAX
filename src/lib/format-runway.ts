/**
 * Translates decimal months into a human-readable format (e.g., "1m 12d").
 * Less depressing than raw decimals.
 */
export function formatRunway(decimalMonths: number): string {
  if (decimalMonths === Infinity) return "∞";
  
  const months = Math.floor(decimalMonths);
  const remainingDecimal = decimalMonths - months;
  const days = Math.round(remainingDecimal * 30);
  
  if (months === 0) return `${days} Days`;
  if (days === 0) return `${months} Months`;
  
  return `${months}m ${days}d`;
}
