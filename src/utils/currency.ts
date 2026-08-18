/**
 * Format an amount in minor units (e.g. pesewas) to a GHS currency string.
 * @param amount  Integer amount in the smallest currency unit
 */
export function formatMoney(amount: number): string {
  const major = amount / 100;
  return `GHS ${new Intl.NumberFormat('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(major)}`;
}
