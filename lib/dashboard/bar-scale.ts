export function barShare(count: number, max: number): number {
  if (!Number.isFinite(count) || count <= 0 || !Number.isFinite(max) || max <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((count / max) * 100));
}

export function maxCatalogCount(items: readonly { count: number }[]): number {
  return items.reduce((highest, item) => Math.max(highest, item.count), 0);
}
