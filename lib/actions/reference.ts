"use server";

import { z } from "zod";

import { roleActionClient } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import {
  listActiveAccreditationStatuses,
  listActiveBarangays,
  listActiveCooperativeSectors,
  listActiveCooperativeStatuses,
  listActiveCooperativeTypes,
  listActiveAccreditationCaseStatuses,
  listActiveAccreditationCaseTypes,
  listActiveOfficerPositions,
  type ReferenceRecord,
} from "@/lib/dal/reference";

export type { ReferenceRecord };

const listCooperativeCatalogsSchema = z.object({});

export type CooperativeCatalogs = {
  types: ReferenceRecord[];
  sectors: ReferenceRecord[];
  statuses: ReferenceRecord[];
  accreditationStatuses: ReferenceRecord[];
  barangays: ReferenceRecord[];
  officerPositions: ReferenceRecord[];
  caseTypes: ReferenceRecord[];
  caseStatuses: ReferenceRecord[];
};

export const listCooperativeCatalogsAction = roleActionClient({
  schema: listCooperativeCatalogsSchema,
  roles: AUTH_ROLES,
  handler: async (): Promise<CooperativeCatalogs> => {
    const [
      types,
      sectors,
      statuses,
      accreditationStatuses,
      barangays,
      officerPositions,
      caseTypes,
      caseStatuses,
    ] = await Promise.all([
      listActiveCooperativeTypes(),
      listActiveCooperativeSectors(),
      listActiveCooperativeStatuses(),
      listActiveAccreditationStatuses(),
      listActiveBarangays(),
      listActiveOfficerPositions(),
      listActiveAccreditationCaseTypes(),
      listActiveAccreditationCaseStatuses(),
    ]);

    return {
      types,
      sectors,
      statuses,
      accreditationStatuses,
      barangays,
      officerPositions,
      caseTypes,
      caseStatuses,
    };
  },
});
