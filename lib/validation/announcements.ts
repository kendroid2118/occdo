import { z } from "zod";

import { parseManilaDateTimeInput } from "@/lib/calendar/manila-datetime";
import { nonEmptyStringSchema } from "@/lib/validation/common";

const manilaDateTimeSchema = z.union([
  z.date().refine((value) => !Number.isNaN(value.getTime()), { message: "Invalid date/time" }),
  z
    .string()
    .min(1)
    .refine((value) => parseManilaDateTimeInput(value) !== null, {
      message: "Invalid Asia/Manila date/time",
    })
    .transform((value) => parseManilaDateTimeInput(value) as Date),
]);

const optionalManilaDateTimeSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  return value;
}, manilaDateTimeSchema.optional().nullable());

const publishedAtSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return new Date();
  }
  return value;
}, manilaDateTimeSchema);

const isActiveSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  if (value === true || value === "true" || value === "on" || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === "off" || value === "0") {
    return false;
  }
  return value;
}, z.boolean().default(true));

export const createAnnouncementSchema = z
  .object({
    title: nonEmptyStringSchema.max(255),
    body: nonEmptyStringSchema.max(2000),
    publishedAt: publishedAtSchema,
    expiresAt: optionalManilaDateTimeSchema,
    isActive: isActiveSchema.default(true),
  })
  .superRefine((value, ctx) => {
    if (value.expiresAt && value.expiresAt.getTime() < value.publishedAt.getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expiresAt"],
        message: "expiresAt must be on or after publishedAt",
      });
    }
  });

export const listPublishedAnnouncementsSchema = z.object({
  take: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(50).default(10),
  ),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type ListPublishedAnnouncementsInput = z.infer<typeof listPublishedAnnouncementsSchema>;
