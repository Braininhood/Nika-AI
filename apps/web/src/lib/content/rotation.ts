/**
 * Content rotation — shadow-test style pool utilisation.
 * Picks the next item the user has attempted least recently (or never).
 */

export function pickRotatedItem<T extends { id: string }>(
  pool: T[],
  attemptedIds: string[],
  fallbackIndex = 0,
): T {
  if (pool.length === 0) {
    throw new Error("pickRotatedItem: empty pool");
  }
  if (pool.length === 1) return pool[0]!;

  const attemptSet = new Set(attemptedIds);
  const neverAttempted = pool.filter((item) => !attemptSet.has(item.id));
  if (neverAttempted.length > 0) {
    return neverAttempted[0]!;
  }

  // All attempted — pick least recently seen (last in history = most recent)
  for (let i = attemptedIds.length - 1; i >= 0; i -= 1) {
    const id = attemptedIds[i]!;
    const match = pool.find((item) => item.id === id);
    if (match) {
      const idx = pool.indexOf(match);
      const next = pool[(idx + 1) % pool.length]!;
      return next;
    }
  }

  return pool[fallbackIndex % pool.length]!;
}

export function filterPoolByDifficulty<T extends { difficulty: number }>(
  pool: T[],
  maxDifficulty: number,
): T[] {
  const matched = pool.filter((item) => item.difficulty <= maxDifficulty);
  return matched.length > 0 ? matched : pool;
}
