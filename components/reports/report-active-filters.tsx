import { REPORT_TIME_ZONE } from "@/lib/reports/manila-date-range";
import type { ReportCatalogs, ReportCooperativeOption } from "@/lib/actions/reports";
import type { ReportFiltersInput } from "@/lib/validation/reports";

type ReportActiveFiltersProps = {
  catalogs: ReportCatalogs;
  cooperatives: ReportCooperativeOption[];
  values: ReportFiltersInput;
};

function catalogName(
  options: { id: string; name: string }[],
  id: string | undefined,
): string | null {
  if (!id) {
    return null;
  }
  return options.find((option) => option.id === id)?.name ?? id;
}

export function ReportActiveFilters({
  catalogs,
  cooperatives,
  values,
}: ReportActiveFiltersProps) {
  const cooperative = values.cooperativeId
    ? cooperatives.find((row) => row.id === values.cooperativeId)
    : undefined;
  const items = [
    values.dateFrom && values.dateTo
      ? `Report dates ${values.dateFrom} to ${values.dateTo} (${REPORT_TIME_ZONE})`
      : `No date range (${REPORT_TIME_ZONE}; current membership uses live cooperative totals)`,
    cooperative ? `Cooperative ${cooperative.name}` : null,
    catalogName(catalogs.types, values.typeId)
      ? `Type ${catalogName(catalogs.types, values.typeId)}`
      : null,
    catalogName(catalogs.sectors, values.sectorId)
      ? `Sector ${catalogName(catalogs.sectors, values.sectorId)}`
      : null,
    catalogName(catalogs.barangays, values.barangayId)
      ? `Barangay ${catalogName(catalogs.barangays, values.barangayId)}`
      : null,
    catalogName(catalogs.statuses, values.statusId)
      ? `Status ${catalogName(catalogs.statuses, values.statusId)}`
      : null,
    catalogName(catalogs.accreditationStatuses, values.accreditationStatusId)
      ? `Accreditation ${catalogName(catalogs.accreditationStatuses, values.accreditationStatusId)}`
      : null,
    catalogName(catalogs.assistanceTypes, values.assistanceTypeId)
      ? `Assistance type ${catalogName(catalogs.assistanceTypes, values.assistanceTypeId)}`
      : null,
    values.trainingKind ? `Training kind ${values.trainingKind}` : null,
    catalogName(catalogs.programs, values.programId)
      ? `Program ${catalogName(catalogs.programs, values.programId)}`
      : null,
    catalogName(catalogs.serviceTypes, values.serviceTypeId)
      ? `Service type ${catalogName(catalogs.serviceTypes, values.serviceTypeId)}`
      : null,
    catalogName(catalogs.complianceStatuses, values.complianceStatusId)
      ? `Compliance status ${catalogName(catalogs.complianceStatuses, values.complianceStatusId)}`
      : null,
    catalogName(catalogs.complianceRequirements, values.complianceRequirementId)
      ? `Requirement ${catalogName(catalogs.complianceRequirements, values.complianceRequirementId)}`
      : null,
  ].filter((item): item is string => item != null);

  return (
    <p className="text-sm text-slate-600" data-testid="report-active-filters">
      Active filters: {items.join(" · ")}
    </p>
  );
}
