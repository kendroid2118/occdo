import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogTable } from "@/components/settings/catalog-table";
import { listCatalogAdminItemsAction } from "@/lib/actions/catalog-admin";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import {
  CATALOG_KIND_META,
  CATALOG_KINDS,
  canAdministerReferenceData,
  catalogKindFromSlug,
} from "@/lib/settings/access";
import { CATALOG_ACTION_ERROR_MESSAGE } from "@/lib/settings/form-errors";

export const metadata: Metadata = {
  title: "Reference data",
};

type ReferencePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SettingsReferencePage({ searchParams }: ReferencePageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerReferenceData(sessionUser.role)) {
    notFound();
  }

  const params = await searchParams;
  const kind = catalogKindFromSlug(firstParam(params.catalog) ?? "sector") ?? "sector";
  const meta = CATALOG_KIND_META[kind];
  const result = await listCatalogAdminItemsAction({ kind });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Reference data</h2>
          <p className="mt-1 text-sm text-slate-600">
            Maintainable catalogs stored in PostgreSQL. Deactivate referenced values; do not delete
            them.
          </p>
        </div>
        <Link
          className="inline-flex h-9 items-center rounded-md bg-occdo-700 px-3 text-sm font-medium text-white hover:bg-occdo-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
          href={`/settings/reference/${meta.slug}/new`}
        >
          Add {meta.singular.toLowerCase()}
        </Link>
      </div>

      <nav aria-label="Catalogs" className="flex flex-wrap gap-2">
        {CATALOG_KINDS.map((entry) => {
          const item = CATALOG_KIND_META[entry];
          const selected = entry === kind;
          return (
            <Link
              className={
                selected
                  ? "rounded-md bg-occdo-700 px-3 py-1.5 text-sm font-medium text-white"
                  : "rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
              }
              href={`/settings/reference?catalog=${item.slug}`}
              key={entry}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!result.ok ? (
        <p className="text-sm text-red-700" role="alert">
          {CATALOG_ACTION_ERROR_MESSAGE[result.code]}
        </p>
      ) : (
        <CatalogTable items={result.data} kind={kind} />
      )}
    </div>
  );
}
