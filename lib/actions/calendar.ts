"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { roleActionClient, type ActionErrorCode } from "@/lib/auth/action-client";
import { AUTH_ROLES } from "@/lib/auth/roles";
import { COOPERATIVE_WRITE_ROLES } from "@/lib/cooperatives/access";
import {
  CalendarActivityNotFoundError,
  CalendarActivityReferenceError,
  createCalendarActivity,
  getCalendarActivityById,
  listCalendarActivities,
  listCalendarLinkOptions,
  listUpcomingCalendarActivities,
  updateCalendarActivity,
  type CalendarActivityListResult,
  type CalendarActivityRecord,
  type CalendarLinkOptions,
} from "@/lib/dal/calendar";
import {
  createCalendarActivitySchema,
  getCalendarActivitySchema,
  listCalendarActivitiesSchema,
  listUpcomingCalendarActivitiesSchema,
  updateCalendarActivitySchema,
} from "@/lib/validation/calendar";

export type { CalendarActivityListResult, CalendarActivityRecord, CalendarLinkOptions };

export type CalendarActionErrorCode = ActionErrorCode | "NOT_FOUND";

export type CalendarActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: CalendarActionErrorCode };

async function mapCalendarAction<T>(
  run: () => Promise<{ ok: true; data: T } | { ok: false; code: ActionErrorCode }>,
): Promise<CalendarActionResult<T>> {
  try {
    return await run();
  } catch (error: unknown) {
    if (error instanceof CalendarActivityNotFoundError) {
      return { ok: false, code: "NOT_FOUND" };
    }
    if (error instanceof CalendarActivityReferenceError) {
      return { ok: false, code: "VALIDATION" };
    }
    throw error;
  }
}

const createInner = roleActionClient({
  schema: createCalendarActivitySchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) => createCalendarActivity({ input, actorId: user.id }),
});

const updateInner = roleActionClient({
  schema: updateCalendarActivitySchema,
  roles: COOPERATIVE_WRITE_ROLES,
  handler: async ({ user, input }) => updateCalendarActivity({ input, actorId: user.id }),
});

const getInner = roleActionClient({
  schema: getCalendarActivitySchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => {
    const record = await getCalendarActivityById(input.id);
    if (!record) {
      throw new CalendarActivityNotFoundError();
    }
    return record;
  },
});

const listInner = roleActionClient({
  schema: listCalendarActivitiesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listCalendarActivities(input),
});

const upcomingInner = roleActionClient({
  schema: listUpcomingCalendarActivitiesSchema,
  roles: AUTH_ROLES,
  handler: async ({ input }) => listUpcomingCalendarActivities({ take: input.take }),
});

const linkOptionsInner = roleActionClient({
  schema: z.object({}),
  roles: AUTH_ROLES,
  handler: async () => listCalendarLinkOptions(),
});

export async function createCalendarActivityAction(
  input: unknown,
): Promise<CalendarActionResult<CalendarActivityRecord>> {
  return mapCalendarAction(() => createInner(input));
}

export async function updateCalendarActivityAction(
  input: unknown,
): Promise<CalendarActionResult<CalendarActivityRecord>> {
  return mapCalendarAction(() => updateInner(input));
}

export async function getCalendarActivityAction(
  input: unknown,
): Promise<CalendarActionResult<CalendarActivityRecord>> {
  return mapCalendarAction(() => getInner(input));
}

export async function listCalendarActivitiesAction(
  input: unknown,
): Promise<CalendarActionResult<CalendarActivityListResult>> {
  return mapCalendarAction(() => listInner(input));
}

export async function listUpcomingCalendarActivitiesAction(
  input: unknown,
): Promise<CalendarActionResult<CalendarActivityRecord[]>> {
  return mapCalendarAction(() => upcomingInner(input));
}

export async function listCalendarLinkOptionsAction(
  input: unknown,
): Promise<CalendarActionResult<CalendarLinkOptions>> {
  return mapCalendarAction(() => linkOptionsInner(input));
}

function combineDateTime(date: FormDataEntryValue | null, time: FormDataEntryValue | null): string {
  const day = typeof date === "string" ? date.trim() : "";
  const clock = typeof time === "string" && time.trim() ? time.trim() : "00:00";
  return day ? `${day}T${clock}` : "";
}

function activityFormValues(formData: FormData) {
  return {
    id: formData.get("id"),
    title: formData.get("title"),
    kind: formData.get("kind"),
    startAt: combineDateTime(formData.get("startDate"), formData.get("startTime")),
    endAt: combineDateTime(formData.get("endDate"), formData.get("endTime")),
    location: formData.get("location"),
    remarks: formData.get("remarks"),
    cooperativeId: formData.get("cooperativeId"),
    trainingEventId: formData.get("trainingEventId"),
  };
}

export async function createCalendarActivityFormAction(
  _previous: CalendarActionResult<CalendarActivityRecord> | null,
  formData: FormData,
): Promise<CalendarActionResult<CalendarActivityRecord>> {
  const result = await createCalendarActivityAction(activityFormValues(formData));
  if (result.ok) {
    redirect("/calendar");
  }
  return result;
}

export async function updateCalendarActivityFormAction(
  _previous: CalendarActionResult<CalendarActivityRecord> | null,
  formData: FormData,
): Promise<CalendarActionResult<CalendarActivityRecord>> {
  const result = await updateCalendarActivityAction(activityFormValues(formData));
  if (result.ok) {
    redirect("/calendar");
  }
  return result;
}
