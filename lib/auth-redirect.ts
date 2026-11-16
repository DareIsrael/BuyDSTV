/**
 * Return a same-origin relative path for post-login redirects, or the fallback.
 * Rejects external URLs and protocol-relative paths to prevent open redirects.
 * An absolute URL is accepted only when it matches `origin` and is reduced to its path.
 */
export function getSafeCallbackUrl(
  value: string | null | undefined,
  fallback = '/',
  origin?: string
): string {
  if (!value) return fallback;

  if (origin && /^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.origin !== origin) return fallback;
      return `${url.pathname}${url.search}${url.hash}` || fallback;
    } catch {
      return fallback;
    }
  }

  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}

/** Paths that should be returned to directly after login (skipping the product chooser). */
export function isDirectReturnPath(path: string): boolean {
  return /^\/orders\/[^/?#]+\/pay\/?$/.test(path.split(/[?#]/)[0]);
}
