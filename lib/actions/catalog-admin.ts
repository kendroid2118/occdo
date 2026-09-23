"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import {
  CatalogAdminConflictError,
  CatalogAdminNotFoundError,
  createCatalogAdminItem,
  getCatalogAdminItem,
  listCatalogAdminItems,
  updateCatalogAdminItem,
  type CatalogAdminRecord,
} from "@/lib/dal/catalog-admin";
import { CATALOG_KIND_META, REFERENCE_ADMIN_ROLES, type CatalogKind } from "@/lib/settings/access";
import {
  createCatalogAdminItemSchema,
  getCatalogItemSchema,
  listCatalogItemsSchema,
  updateCatalogAdminItemSchema,
} from "@/lib/validation/catalog-admin";

export type { CatalogAdminRecord };

export type CatalogActionErrorCode = ActionErrorCode | "NOT_FOUND" | "CONFLICT";

export type CatalogActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: CatalogActionErrorCode };

async function mapCatalogAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<CatalogActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof CatalogAdminNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof CatalogAdminConflictError) {
      return { ok: false, code: "CONFLICT" };
    }
    throw error;
  }
}

const listInner = roleActionClient({
  schema: listCatalogItemsSchema,
  roles: REFERENCE_ADMIN_ROLES,
  handler: async ({ input }) => listCatalogAdminItems(input.kind),
});

const getInner = roleActionClient({
  schema: getCatalogItemSchema,
  roles: REFERENCE_ADMIN_ROLES,
  handler: async ({ input }) => {
    const row = await getCatalogAdminItem(input.kind, input.id);
    if (!row) {
      throw new CatalogAdminNotFoundError();
    }
    return row;
  },
});

const createInner = roleActionClient({
  schema: createCatalogAdminItemSchema,
  roles: REFERENCE_ADMIN_ROLES,
  handler: async ({ user, input }) => createCatalogAdminItem({ actorId: user.id, input }),
});

const updateInner = roleActionClient({
  schema: updateCatalogAdminItemSchema,
  roles: REFERENCE_ADMIN_ROLES,
  handler: async ({ user, input }) => updateCatalogAdminItem({ actorId: user.id, input }),
});

export async function listCatalogAdminItemsAction(
  input: unknown,
): Promise<CatalogActionResult<CatalogAdminRecord[]>> {
  return mapCatalogAction(() => listInner(input));
}

export async function getCatalogAdminItemAction(
  input: unknown,
): Promise<CatalogActionResult<CatalogAdminRecord>> {
  return mapCatalogAction(() => getInner(input));
}

export async function createCatalogAdminItemAction(
  input: unknown,
): Promise<CatalogActionResult<CatalogAdminRecord>> {
  return mapCatalogAction(() => createInner(input));
}

export async function updateCatalogAdminItemAction(
  input: unknown,
): Promise<CatalogActionResult<CatalogAdminRecord>> {
  return mapCatalogAction(() => updateInner(input));
}

function catalogFormValues(formData: FormData) {
  return {
    kind: formData.get("kind"),
    id: formData.get("id"),
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    frequency: formData.get("frequency"),
    isActive: formData.get("isActive") === "true",
  };
}

function catalogListPath(kind: CatalogKind): string {
  return `/settings/reference?catalog=${CATALOG_KIND_META[kind].slug}`;
}

export async function createCatalogAdminItemFormAction(
  _previous: CatalogActionResult<CatalogAdminRecord> | null,
  formData: FormData,
): Promise<CatalogActionResult<CatalogAdminRecord>> {
  const values = catalogFormValues(formData);
  const result = await createCatalogAdminItemAction(values);
  if (result.ok) {
    const kind = values.kind;
    if (typeof kind === "string" && kind in CATALOG_KIND_META) {
      redirect(catalogListPath(kind as CatalogKind));
    }
  }
  return result;
}

export async function updateCatalogAdminItemFormAction(
  _previous: CatalogActionResult<CatalogAdminRecord> | null,
  formData: FormData,
): Promise<CatalogActionResult<CatalogAdminRecord>> {
  const values = catalogFormValues(formData);
  const result = await updateCatalogAdminItemAction(values);
  if (result.ok) {
    const kind = values.kind;
    if (typeof kind === "string" && kind in CATALOG_KIND_META) {
      redirect(catalogListPath(kind as CatalogKind));
    }
  }
  return result;
}
