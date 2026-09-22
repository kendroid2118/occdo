import { COMPLIANCE_STATUS_CODES } from "@/lib/compliance/status-codes";
import { verifyComplianceRecordFormAction } from "@/lib/actions/compliance-records";
import type { ComplianceRecord } from "@/lib/actions/compliance-records";
import { Button } from "@/components/ui/button";

type ComplianceVerifyFormProps = {
  record: ComplianceRecord;
};

export function ComplianceVerifyForm({ record }: ComplianceVerifyFormProps) {
  if (record.status.code === COMPLIANCE_STATUS_CODES.VERIFIED) {
    return (
      <p className="text-sm text-slate-600">
        Verified
        {record.verifiedBy?.name ? ` by ${record.verifiedBy.name}` : ""}.
      </p>
    );
  }

  return (
    <form action={verifyComplianceRecordFormAction}>
      <input name="id" type="hidden" value={record.id} />
      <input name="cooperativeId" type="hidden" value={record.cooperativeId} />
      <Button type="submit">Verify record</Button>
    </form>
  );
}
