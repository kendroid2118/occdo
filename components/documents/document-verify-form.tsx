import { verifyDocumentFormAction, type CooperativeDocumentRecord } from "@/lib/actions/documents";
import { DOCUMENT_VERIFICATION_STATUS } from "@/lib/documents/verification-status";
import { Button } from "@/components/ui/button";

type DocumentVerifyFormProps = {
  record: CooperativeDocumentRecord;
};

export function DocumentVerifyForm({ record }: DocumentVerifyFormProps) {
  if (record.verificationStatus === DOCUMENT_VERIFICATION_STATUS.VERIFIED) {
    return (
      <p className="text-sm text-slate-600">
        Verified
        {record.verifiedBy?.name ? ` by ${record.verifiedBy.name}` : ""}.
      </p>
    );
  }

  return (
    <form action={verifyDocumentFormAction}>
      <input name="id" type="hidden" value={record.id} />
      <input name="cooperativeId" type="hidden" value={record.cooperativeId} />
      <Button type="submit">Verify document</Button>
    </form>
  );
}
