import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { SessionUser } from "@/lib/auth/session";

const getCurrentSessionUser = vi.fn();
const getCooperativeReport = vi.fn();
const getMembershipReport = vi.fn();
const getAssistanceReport = vi.fn();
const getTrainingReport = vi.fn();
const getComplianceReport = vi.fn();
const getSummaryReport = vi.fn();

vi.mock("@/lib/auth/current-session", () => ({
  getCurrentSessionUser: () => getCurrentSessionUser(),
}));

vi.mock("@/lib/dal/reports", () => ({
  ReportFilterError: class ReportFilterError extends Error {
    readonly code = "VALIDATION" as const;
  },
  getCooperativeReport: (...args: unknown[]) => getCooperativeReport(...args),
  getMembershipReport: (...args: unknown[]) => getMembershipReport(...args),
  listReportCooperativeOptions: vi.fn(),
}));

vi.mock("@/lib/dal/reports-operational", () => ({
  getAssistanceReport: (...args: unknown[]) => getAssistanceReport(...args),
  getTrainingReport: (...args: unknown[]) => getTrainingReport(...args),
  getComplianceReport: (...args: unknown[]) => getComplianceReport(...args),
  getSummaryReport: (...args: unknown[]) => getSummaryReport(...args),
}));

import {
  getAssistanceReportAction,
  getCooperativeReportAction,
  getMembershipReportAction,
  getSummaryReportAction,
} from "@/lib/actions/reports";
import { resetRateLimitStateForTests } from "@/lib/rate-limit";

const staffUser: SessionUser = {
  id: "occdo-037-user",
  email: "user.037@example.invalid",
  name: "Staff User",
  role: "USER",
  isActive: true,
};

describe("report actions", () => {
  beforeEach(() => {
    resetRateLimitStateForTests();
    getCurrentSessionUser.mockReset();
    getCooperativeReport.mockReset();
    getMembershipReport.mockReset();
    getAssistanceReport.mockReset();
    getTrainingReport.mockReset();
    getComplianceReport.mockReset();
    getSummaryReport.mockReset();
  });

  it("rejects unauthenticated report reads", async () => {
    getCurrentSessionUser.mockResolvedValue(null);

    await expect(getCooperativeReportAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(getMembershipReportAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(getAssistanceReportAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    await expect(getSummaryReportAction({})).resolves.toEqual({
      ok: false,
      code: "UNAUTHORIZED",
    });
    expect(getCooperativeReport).not.toHaveBeenCalled();
    expect(getMembershipReport).not.toHaveBeenCalled();
    expect(getAssistanceReport).not.toHaveBeenCalled();
  });

  it("allows USER to read reports", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);
    getCooperativeReport.mockResolvedValue({ items: [], total: 0 });
    getMembershipReport.mockResolvedValue({ current: { items: [] } });
    getAssistanceReport.mockResolvedValue({ items: [], ledger: { net: "0.00" } });
    getSummaryReport.mockResolvedValue({ cooperatives: 0 });

    await expect(getCooperativeReportAction({})).resolves.toEqual({
      ok: true,
      data: { items: [], total: 0 },
    });
    await expect(getMembershipReportAction({})).resolves.toEqual({
      ok: true,
      data: { current: { items: [] } },
    });
    await expect(getAssistanceReportAction({})).resolves.toEqual({
      ok: true,
      data: { items: [], ledger: { net: "0.00" } },
    });
    await expect(getSummaryReportAction({})).resolves.toEqual({
      ok: true,
      data: { cooperatives: 0 },
    });
  });

  it("returns VALIDATION for an invalid date range", async () => {
    getCurrentSessionUser.mockResolvedValue(staffUser);

    const result = await getCooperativeReportAction({
      dateFrom: "2026-09-30",
      dateTo: "2026-09-01",
    });

    expect(result).toEqual({ ok: false, code: "VALIDATION" });
    expect(getCooperativeReport).not.toHaveBeenCalled();
  });
});
