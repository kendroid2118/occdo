"use server";

import { redirect } from "next/navigation";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  createAnnouncement,
  listPublishedAnnouncements,
  type AnnouncementRecord,
} from "@/lib/dal/announcements";
import {
  createAnnouncementSchema,
  listPublishedAnnouncementsSchema,
} from "@/lib/validation/announcements";

export type { AnnouncementRecord };

export type AnnouncementActionErrorCode = ActionErrorCode;

export type AnnouncementActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: AnnouncementActionErrorCode };

function combineDateTime(date: FormDataEntryValue | null, time: FormDataEntryValue | null): string {
  const day = typeof date === "string" ? date.trim() : "";
  const clock = typeof time === "string" && time.trim() ? time.trim() : "00:00";
  return day ? `${day}T${clock}` : "";
}

const createInner = roleActionClient({
  schema: createAnnouncementSchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) => createAnnouncement({ input, actorId: user.id }),
});

const listPublishedInner = roleActionClient({
  schema: listPublishedAnnouncementsSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listPublishedAnnouncements({ take: input.take }),
});

export async function createAnnouncementAction(
  input: unknown,
): Promise<AnnouncementActionResult<AnnouncementRecord>> {
  return createInner(input);
}

export async function listPublishedAnnouncementsAction(
  input: unknown,
): Promise<AnnouncementActionResult<AnnouncementRecord[]>> {
  return listPublishedInner(input);
}

function announcementFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    body: formData.get("body"),
    publishedAt: combineDateTime(formData.get("publishedDate"), formData.get("publishedTime")),
    expiresAt: combineDateTime(formData.get("expiresDate"), formData.get("expiresTime")),
    isActive: formData.get("isActive") === "true",
  };
}

export async function createAnnouncementFormAction(
  _previous: AnnouncementActionResult<AnnouncementRecord> | null,
  formData: FormData,
): Promise<AnnouncementActionResult<AnnouncementRecord>> {
  const result = await createAnnouncementAction(announcementFormValues(formData));
  if (result.ok) {
    redirect("/calendar/announcements");
  }
  return result;
}
