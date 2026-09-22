import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CooperativeOfficers } from "@/components/cooperatives/cooperative-officers";
import { CooperativeProfile } from "@/components/cooperatives/cooperative-profile";
import { getCooperativeAction } from "@/lib/actions/cooperatives";
import { listOfficersAction } from "@/lib/actions/officers";
import { listCooperativeCatalogsAction } from "@/lib/actions/reference";
import { getCurrentSessionUser } from "@/lib/auth/current-session";
import { canWriteCooperatives } from "@/lib/cooperatives/access";

type CooperativeProfilePageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Cooperative profile",
};

export default async function CooperativeProfilePage({
  params,
}: CooperativeProfilePageProps) {
  const { id } = await params;
  const [result, officersResult, catalogsResult, sessionUser] = await Promise.all([
    getCooperativeAction({ id }),
    listOfficersAction({ cooperativeId: id }),
    listCooperativeCatalogsAction({}),
    getCurrentSessionUser(),
  ]);

  if (!result.ok) {
    if (result.code === "NOT_FOUND" || result.code === "VALIDATION") {
      notFound();
    }
    return (
      <p className="text-sm text-red-700" role="alert">
        Could not load this cooperative.
      </p>
    );
  }

  const canWrite = sessionUser ? canWriteCooperatives(sessionUser.role) : false;
  const officers = officersResult.ok ? officersResult.data : [];
  const positions = catalogsResult.ok ? catalogsResult.data.officerPositions : [];

  return (
    <div className="space-y-6">
      <CooperativeProfile canWrite={canWrite} cooperative={result.data} />
      <CooperativeOfficers
        canWrite={canWrite}
        cooperativeId={result.data.id}
        officers={officers}
        positions={positions}
      />
    </div>
  );
}
