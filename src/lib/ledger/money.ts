export function toCents(input: string): number {
  const value = input.trim();
  if (!value) return 0;

  const normalized = value.replace(',', '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return 0;
  }

  const [wholePart, decimalPart = ''] = normalized.split('.');
  const whole = Number.parseInt(wholePart, 10);
  if (Number.isNaN(whole)) {
    return 0;
  }

  const paddedDecimal = `${decimalPart}00`.slice(0, 2);
  const cents = Number.parseInt(paddedDecimal, 10);
  return whole * 100 + cents;
}

export function centsToAmount(cents: number): number {
  return cents / 100;
}
