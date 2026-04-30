export function formatCurrency(amount: number): string {
  const value = amount / 100;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  const sign = value >= 0 ? '+ ' : '- ';
  return `${sign}${formatted} MAD`;
}

export function formatCurrencyNoSign(amount: number): string {
  const value = amount / 100;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  return `${formatted} MAD`;
}
