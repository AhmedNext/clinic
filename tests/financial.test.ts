import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDebt,
  getPaymentStatus,
  formatIQD,
  getWhatsAppNumber,
  getWhatsAppUrl,
  getPatientMonthlyStats,
  Patient,
  PatientHistoryEntry,
} from "@/types/patient";

describe("Financial calculations & Debt logic", () => {
  describe("calculateDebt", () => {
    it("calculates basic debt when total > paid", () => {
      assert.equal(calculateDebt(150000, 50000), 100000);
      assert.equal(calculateDebt(50000, 0), 50000);
    });

    it("returns 0 when fully paid or overpaid", () => {
      assert.equal(calculateDebt(100000, 100000), 0);
      assert.equal(calculateDebt(100000, 150000), 0);
    });

    it("handles undefined, null, or NaN gracefully", () => {
      assert.equal(calculateDebt(undefined, undefined), 0);
      assert.equal(calculateDebt(NaN, NaN), 0);
      assert.equal(calculateDebt(50000, undefined), 50000);
      assert.equal(calculateDebt(undefined, 20000), 0);
    });

    it("handles negative values defensively without returning negative debt", () => {
      assert.equal(calculateDebt(-50000, 0), 0);
      assert.equal(calculateDebt(50000, -20000), 50000);
    });

    it("respects explicit debt when provided", () => {
      assert.equal(calculateDebt(100000, 30000, 45000), 45000);
      assert.equal(calculateDebt(100000, 100000, 0), 0);
    });

    it("handles initial total when paid is 0 and explicitDebt is 0", () => {
      // If total amount exists and paid is 0 while explicitDebt is 0, the actual unpaid debt is total
      assert.equal(calculateDebt(80000, 0, 0), 80000);
    });
  });

  describe("getPaymentStatus", () => {
    const basePatient: Patient = {
      id: "pat-1",
      name: "Ali Ahmed",
      gender: "male",
      date: "2026-09-01",
    };

    it("identifies fully paid patients", () => {
      const p: Patient = { ...basePatient, totalAmount: 100000, paidAmount: 100000, debtAmount: 0 };
      assert.equal(getPaymentStatus(p), "paid");
    });

    it("identifies partially paid patients", () => {
      const p: Patient = { ...basePatient, totalAmount: 100000, paidAmount: 40000, debtAmount: 60000 };
      assert.equal(getPaymentStatus(p), "partial");
    });

    it("identifies completely unpaid patients", () => {
      const p: Patient = { ...basePatient, totalAmount: 100000, paidAmount: 0, debtAmount: 100000 };
      assert.equal(getPaymentStatus(p), "unpaid");
    });
  });

  describe("formatIQD", () => {
    it("formats thousands with commas and IQD suffix", () => {
      assert.equal(formatIQD(0), "0 IQD");
      assert.equal(formatIQD(1000), "1,000 IQD");
      assert.equal(formatIQD(250000), "250,000 IQD");
      assert.equal(formatIQD(1500000), "1,500,000 IQD");
    });

    it("rounds decimals properly", () => {
      assert.equal(formatIQD(1250.75), "1,251 IQD");
      assert.equal(formatIQD(1250.2), "1,250 IQD");
    });

    it("handles null / undefined / NaN as 0 IQD", () => {
      assert.equal(formatIQD(undefined), "0 IQD");
      assert.equal(formatIQD(NaN), "0 IQD");
    });
  });

  describe("WhatsApp helpers", () => {
    it("formats local Iraq 07xx numbers to international 9647xx", () => {
      assert.equal(getWhatsAppNumber("0770 123 4567"), "9647701234567");
      assert.equal(getWhatsAppNumber("07501234567"), "9647501234567");
    });

    it("handles numbers already prefixed with 00964 or 964", () => {
      assert.equal(getWhatsAppNumber("009647701234567"), "9647701234567");
      assert.equal(getWhatsAppNumber("9647701234567"), "9647701234567");
    });

    it("generates correct WhatsApp chat link with custom message", () => {
      const url = getWhatsAppUrl("07701234567", "Soran", "IQ Dental");
      assert.ok(url.startsWith("https://wa.me/9647701234567"));
      assert.ok(url.includes("Soran"));
      assert.ok(url.includes("IQ%20Dental"));
    });

    it("returns # when phone is empty", () => {
      assert.equal(getWhatsAppUrl(""), "#");
      assert.equal(getWhatsAppUrl(undefined), "#");
    });
  });

  describe("getPatientMonthlyStats", () => {
    it("calculates stats for patient with single visit in month", () => {
      const p: Patient = {
        id: "p1",
        name: "Sara",
        gender: "female",
        date: "2026-09-15",
        paidAmount: 60000,
        debtAmount: 40000,
        totalAmount: 100000,
        history: [
          {
            id: "h1",
            date: "2026-09-15",
            title: "Initial",
            notes: "",
            paid: 60000,
            debt: 40000,
          },
        ],
      };

      const sepStats = getPatientMonthlyStats(p, "2026-09");
      assert.equal(sepStats.hasActivity, true);
      assert.equal(sepStats.paid, 60000);
      assert.equal(sepStats.debt, 40000);
      assert.equal(sepStats.visits, 1);

      const octStats = getPatientMonthlyStats(p, "2026-10");
      assert.equal(octStats.hasActivity, false);
      assert.equal(octStats.paid, 0);
    });

    it("splits payments across multiple months accurately", () => {
      const p: Patient = {
        id: "p2",
        name: "Karwan",
        gender: "male",
        date: "2026-10-10",
        paidAmount: 120000,
        debtAmount: 0,
        totalAmount: 120000,
        history: [
          {
            id: "h1",
            date: "2026-08-10",
            title: "Visit 1 (Root Canal)",
            notes: "",
            paid: 50000,
            debt: 70000,
          },
          {
            id: "h2",
            date: "2026-09-12",
            title: "Visit 2 (Crown Prep)",
            notes: "",
            paid: 40000,
            debt: 30000,
          },
          {
            id: "h3",
            date: "2026-10-10",
            title: "Visit 3 (Crown Fit)",
            notes: "",
            paid: 30000,
            debt: 0,
          },
        ],
      };

      const aug = getPatientMonthlyStats(p, "2026-08");
      assert.equal(aug.paid, 50000);
      assert.equal(aug.debt, 0); // All settled, should not show lingering unpaid debt
      assert.equal(aug.visits, 1);

      const sep = getPatientMonthlyStats(p, "2026-09");
      assert.equal(sep.paid, 40000);
      assert.equal(sep.debt, 0);
      assert.equal(sep.visits, 1);

      const oct = getPatientMonthlyStats(p, "2026-10");
      assert.equal(oct.paid, 30000);
      assert.equal(oct.debt, 0);
      assert.equal(oct.visits, 1);
    });

    it("reports active debt for patients with outstanding balance", () => {
      const pWithDebt: Patient = {
        id: "p3",
        name: "Shwan",
        gender: "male",
        date: "2026-09-05",
        paidAmount: 50000,
        debtAmount: 70000,
        totalAmount: 120000,
        history: [
          {
            id: "h1",
            date: "2026-09-05",
            title: "Visit 1",
            notes: "",
            paid: 50000,
            debt: 70000,
          },
        ],
      };

      const sep = getPatientMonthlyStats(pWithDebt, "2026-09");
      assert.equal(sep.paid, 50000);
      assert.equal(sep.debt, 70000);
      assert.equal(sep.hasActivity, true);
    });
  });
});
