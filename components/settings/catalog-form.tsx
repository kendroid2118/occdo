"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  createCatalogAdminItemFormAction,
  updateCatalogAdminItemFormAction,
  type CatalogAdminRecord,
} from "@/lib/actions/catalog-admin";
import { CATALOG_KIND_META, type CatalogKind } from "@/lib/settings/access";
import { CATALOG_ACTION_ERROR_MESSAGE } from "@/lib/settings/form-errors";

const fieldClass =
  "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700";

type CatalogFormProps = {
  kind: CatalogKind;
  item?: CatalogAdminRecord;
};

export function CatalogForm({ kind, item }: CatalogFormProps) {
  const isEdit = Boolean(item);
  const meta = CATALOG_KIND_META[kind];
  const [state, formAction, pending] = useActionState(
    isEdit ? updateCatalogAdminItemFormAction : createCatalogAdminItemFormAction,
    null,
  );
  const errorMessage = state && state.ok === false ? CATALOG_ACTION_ERROR_MESSAGE[state.code] : null;

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input name="kind" type="hidden" value={kind} />
      {item ? <input name="id" type="hidden" value={item.id} /> : null}

      {errorMessage ? (
        <p className="text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="code">
            Code
          </label>
          <input
            className={fieldClass}
            defaultValue={item?.code ?? ""}
            id="code"
            name="code"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="name">
            Name
          </label>
          <input
            className={fieldClass}
            defaultValue={item?.name ?? ""}
            id="name"
            name="name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-800" htmlFor="sortOrder">
            Sort order
          </label>
          <input
            className={fieldClass}
            defaultValue={item?.sortOrder ?? 0}
            id="sortOrder"
            min={0}
            name="sortOrder"
            type="number"
          />
        </div>
        {kind === "requirement" ? (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-800" htmlFor="frequency">
              Frequency
            </label>
            <input
              className={fieldClass}
              defaultValue={item?.frequency ?? ""}
              id="frequency"
              name="frequency"
            />
          </div>
        ) : null}
        <div className="space-y-1.5 md:col-span-2">
          <label className="block text-sm font-medium text-slate-800" htmlFor="description">
            Description
          </label>
          <textarea
            className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-occdo-700"
            defaultValue={item?.description ?? ""}
            id="description"
            name="description"
          />
        </div>
        <div className="md:col-span-2">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800">
            <input
              defaultChecked={item?.isActive ?? true}
              id="isActive"
              name="isActive"
              type="checkbox"
              value="true"
            />
            Active
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Deactivate referenced rows instead of deleting them so historical records keep this name.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button disabled={pending} type="submit">
          {isEdit ? `Save ${meta.singular.toLowerCase()}` : `Add ${meta.singular.toLowerCase()}`}
        </Button>
        <Button asChild variant="outline">
          <Link href={`/settings/reference?catalog=${meta.slug}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
