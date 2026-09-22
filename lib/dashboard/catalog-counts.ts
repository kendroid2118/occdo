export type DashboardCatalogCount = {
  id: string;
  code: string;
  name: string;
  count: number;
};

type CatalogRow = {
  id: string;
  code: string;
  name: string;
};

export function mergeCatalogCounts(
  catalog: readonly CatalogRow[],
  grouped: readonly { id: string; count: number }[],
): DashboardCatalogCount[] {
  const countById = new Map<string, number>();
  for (const row of grouped) {
    countById.set(row.id, row.count);
  }

  return catalog.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    count: countById.get(item.id) ?? 0,
  }));
}
