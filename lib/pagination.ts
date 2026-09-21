export const MAX_PAGE_SIZE = 100;

/**
 * Converts a URL query value to a bounded positive integer. Invalid values
 * deliberately fall back to the default instead of producing NaN in Mongo's
 * skip/limit calls.
 */
export function parsePositiveInteger(
  value: string | null,
  defaultValue: number,
  maxValue = Number.MAX_SAFE_INTEGER
): number {
  if (!value || !/^\d+$/.test(value)) return defaultValue;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) return defaultValue;

  return Math.min(parsed, maxValue);
}

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit = 10
) {
  return {
    page: parsePositiveInteger(searchParams.get('page'), 1),
    limit: parsePositiveInteger(searchParams.get('limit'), defaultLimit, MAX_PAGE_SIZE),
  };
}

/** Returns a compact, centred set of page numbers for pagination controls. */
export function getVisiblePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): number[] {
  const safeTotal = Math.max(1, totalPages);
  const visibleCount = Math.min(maxVisible, safeTotal);
  const half = Math.floor(visibleCount / 2);
  const safeCurrent = Math.min(Math.max(1, currentPage), safeTotal);
  const start = Math.min(
    Math.max(1, safeCurrent - half),
    safeTotal - visibleCount + 1
  );

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}
