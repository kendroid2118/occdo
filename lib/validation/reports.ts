import { z } from "zod";

import { isValidCalendarYmd } from "@/lib/reports/manila-date-range";
import { nonEmptyStringSchema } from "@/lib/validation/common";

const referenceIdSchema = nonEmptyStringSchema.max(64);

const optionalFilterIdSchema = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  referenceIdSchema.optional(),
);

const optionalCalendarDateSchema = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }
  return value;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional());

export const reportFiltersSchema = z
  .object({
    dateFrom: optionalCalendarDateSchema,
    dateTo: optionalCalendarDateSchema,
    cooperativeId: optionalFilterIdSchema,
    typeId: optionalFilterIdSchema,
    sectorId: optionalFilterIdSchema,
    barangayId: optionalFilterIdSchema,
    statusId: optionalFilterIdSchema,
    accreditationStatusId: optionalFilterIdSchema,
    page: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().int().min(1).default(1),
    ),
    pageSize: z.preprocess(
      (value) => (value === "" || value == null ? undefined : value),
      z.coerce.number().int().min(1).max(50).default(20),
    ),
  })
  .superRefine((value, ctx) => {
    if (value.dateFrom && !isValidCalendarYmd(value.dateFrom)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dateFrom"],
        message: "dateFrom must be a real calendar date",
      });
    }
    if (value.dateTo && !isValidCalendarYmd(value.dateTo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dateTo"],
        message: "dateTo must be a real calendar date",
      });
    }
    if ((value.dateFrom && !value.dateTo) || (!value.dateFrom && value.dateTo)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: value.dateFrom ? ["dateTo"] : ["dateFrom"],
        message: "Both dateFrom and dateTo are required",
      });
    }
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dateFrom"],
        message: "dateFrom must be on or before dateTo",
      });
    }
  });

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;
