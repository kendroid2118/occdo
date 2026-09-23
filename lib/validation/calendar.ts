import { z } from "zod";

import { parseManilaDateTimeInput } from "@/lib/calendar/manila-datetime";
import { nonEmptyStringSchema } from "@/lib/validation/common";

export const CALENDAR_ACTIVITY_KINDS = ["ACTIVITY", "TRAINING", "DEADLINE"] as const;

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

const optionalLinkIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional().nullable(),
);

const optionalTextSchema = z
  .string()
  .trim()
  .max(255)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const optionalLongTextSchema = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .nullable()
  .transform((value) => (value ? value : null));

const manilaDateTimeSchema = z
  .union([z.date(), z.string()])
  .transform((value, ctx) => {
    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid date/time" });
        return z.NEVER;
      }
      return value;
    }
    const parsed = parseManilaDateTimeInput(value);
    if (!parsed) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid Asia/Manila date/time" });
      return z.NEVER;
    }
    return parsed;
  });

const optionalManilaDateTimeSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  return value;
}, manilaDateTimeSchema.optional().nullable());

const activityWriteSchema = z
  .object({
    title: nonEmptyStringSchema.max(255),
    kind: z.enum(CALENDAR_ACTIVITY_KINDS),
    startAt: manilaDateTimeSchema,
    endAt: optionalManilaDateTimeSchema,
    location: optionalTextSchema,
    remarks: optionalLongTextSchema,
    cooperativeId: optionalLinkIdSchema,
    trainingEventId: optionalLinkIdSchema,
  })
  .superRefine((value, ctx) => {
    if (value.endAt && value.endAt.getTime() < value.startAt.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endAt"],
        message: "endAt must be on or after startAt",
      });
    }
  });

export const createCalendarActivitySchema = activityWriteSchema;

export const updateCalendarActivitySchema = activityWriteSchema.and(
  z.object({ id: referenceIdSchema }),
);

export const getCalendarActivitySchema = z.object({
  id: referenceIdSchema,
});

export const listCalendarActivitiesSchema = z.object({
  year: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(2000).max(2100).optional(),
  ),
  month: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(12).optional(),
  ),
  kind: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.enum(CALENDAR_ACTIVITY_KINDS).optional(),
  ),
  cooperativeId: optionalFilterIdSchema,
});

export const listUpcomingCalendarActivitiesSchema = z.object({
  take: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(10),
  ),
});

export type CreateCalendarActivityInput = z.infer<typeof createCalendarActivitySchema>;
export type UpdateCalendarActivityInput = z.infer<typeof updateCalendarActivitySchema>;
export type GetCalendarActivityInput = z.infer<typeof getCalendarActivitySchema>;
export type ListCalendarActivitiesInput = z.infer<typeof listCalendarActivitiesSchema>;
export type ListUpcomingCalendarActivitiesInput = z.infer<
  typeof listUpcomingCalendarActivitiesSchema
>;
