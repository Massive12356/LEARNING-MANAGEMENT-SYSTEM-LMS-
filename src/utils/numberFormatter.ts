

/**
 * Formats a number into a readable format with commas (e.g., 2000000 -> 2,000,000)
 */
export function formatNumber(num: number | string): string {
  if (num === null || num === undefined) return '0';

  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(parsed)) return '0';

  return parsed.toLocaleString('en-US');
}
