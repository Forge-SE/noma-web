/**
 * Format an amount in minor units (e.g. pesewas, cents) to a human-readable currency string.
 * @param amount  Integer amount in the smallest currency unit
 * @param currency  ISO 4217 currency code, defaults to 'GHS'
 */
export function formatMoney(amount: number, currency = 'GHS'): string {
  const major = amount / 100;
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major);
}
