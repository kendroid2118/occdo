import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogForm } from "@/components/settings/catalog-form";
import { getCatalogAdminItemAction } from "@/lib/actions/catalog-admin";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import {
  CATALOG_KIND_META,
  canAdministerReferenceData,
  catalogKindFromSlug,
} from "@/lib/settings/access";

export const metadata: Metadata = {
  title: "Edit catalog item",
};

type EditCatalogPageProps = {
  params: Promise<{ kind: string; id: string }>;
};

export default async function EditCatalogItemPage({ params }: EditCatalogPageProps) {
  const sessionUser = await getCurrentSessionUser();
  if (!sessionUser || !canAdministerReferenceData(sessionUser.role)) {
    notFound();
  }

  const { kind: slug, id } = await params;
  const kind = catalogKindFromSlug(slug);
  if (!kind) {
    notFound();
  }

  const result = await getCatalogAdminItemAction({ kind, id });
  if (!result.ok) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Edit {CATALOG_KIND_META[kind].singular.toLowerCase()}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Rename this value or deactivate it. Historical records keep the current name.
        </p>
      </div>
      <CatalogForm item={result.data} kind={kind} />
    </div>
  );
}
