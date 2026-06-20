/**
 * Content rotation — shadow-test style pool utilisation.
 * Picks the next item the user has attempted least recently (or never).
 */

/** Stable numeric seed from YYYY-MM-DD for daily plan variety. */
export function dailyRotationSeed(dateStr?: string): number {
  const day = dateStr ?? new Date().toISOString().slice(0, 10);
  let h = 2166136261;
  for (let i = 0; i < day.length; i += 1) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickRotatedItem<T extends { id: string }>(
  pool: T[],
  attemptedIds: string[],
  fallbackIndex = 0,
  daySeed = dailyRotationSeed(),
): T {
  if (pool.length === 0) {
    throw new Error("pickRotatedItem: empty pool");
  }
  if (pool.length === 1) return pool[0]!;

  const attemptSet = new Set(attemptedIds);
  const neverAttempted = pool.filter((item) => !attemptSet.has(item.id));
  if (neverAttempted.length > 0) {
    return neverAttempted[daySeed % neverAttempted.length]!;
  }

  // All attempted — pick least recently seen (last in history = most recent)
  for (let i = attemptedIds.length - 1; i >= 0; i -= 1) {
    const id = attemptedIds[i]!;
    const match = pool.find((item) => item.id === id);
    if (match) {
      const idx = pool.indexOf(match);
      const next = pool[(idx + 1 + (daySeed % Math.max(pool.length - 1, 1))) % pool.length]!;
      return next;
    }
  }

  return pool[(fallbackIndex + daySeed) % pool.length]!;
}

export function filterPoolByDifficulty<T extends { difficulty: number }>(
  pool: T[],
  maxDifficulty: number,
): T[] {
  const matched = pool.filter((item) => item.difficulty <= maxDifficulty);
  return matched.length > 0 ? matched : pool;
}
