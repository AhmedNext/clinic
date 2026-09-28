import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  Patient,
  PatientHistoryEntry,
  calculateDebt,
  getPatientMonthlyStats,
} from "@/types/patient";

describe("Patient Lifecycle & History Synchronization", () => {
  it("initializes a patient with an initial history entry containing initial paid and debt", () => {
    const now = Date.now();
    const data: Omit<Patient, "id"> = {
      name: "Dler Bakr",
      gender: "male",
      date: "2026-09-10",
      totalAmount: 100000,
      paidAmount: 60000,
      debtAmount: 40000,
      notes: "Scaling & Polishing",
    };

    const initialEntry: PatientHistoryEntry = {
      id: `hist-${now}`,
      date: data.date,
      title: "Initial Visit",
      notes: data.notes || "",
      fee: 0,
      paid: data.paidAmount ?? 0,
      debt: data.debtAmount ?? 0,
      createdAt: now,
    };

    const patient: Patient = {
      ...data,
      id: "pat-1",
      history: [initialEntry],
      createdAt: now,
    };

    assert.equal(patient.history!.length, 1);
    assert.equal(patient.history![0].paid, 60000);
    assert.equal(patient.history![0].debt, 40000);
    assert.equal(calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount), 40000);
  });

  it("handles adding a follow-up visit and reflects on patient totals", () => {
    let patient: Patient = {
      id: "pat-1",
      name: "Dler Bakr",
      gender: "male",
      date: "2026-09-10",
      totalAmount: 100000,
      paidAmount: 60000,
      debtAmount: 40000,
      history: [
        {
          id: "hist-1",
          date: "2026-09-10",
          title: "Initial Visit",
          notes: "",
          paid: 60000,
          debt: 40000,
        },
      ],
    };

    // Follow-up visit in October: paid 40000 (settling previous debt)
    const newEntry: PatientHistoryEntry = {
      id: "hist-2",
      date: "2026-10-05",
      title: "Follow-up",
      notes: "Settled previous balance",
      paid: 40000,
      debt: 0,
    };

    // Simulate adding history entry
    const history = [newEntry, ...patient.history!];
    const historyPaid = history.reduce((sum, h) => sum + (h.paid || 0), 0);
    const historyDebt = history.reduce((sum, h) => sum + (h.debt || 0), 0);

    patient = {
      ...patient,
      date: newEntry.date,
      paidAmount: historyPaid,
      debtAmount: historyDebt,
      totalAmount: historyPaid + historyDebt,
      history,
    };

    assert.equal(patient.history!.length, 2);
    assert.equal(patient.paidAmount, 100000);
    assert.equal(patient.date, "2026-10-05");
  });

  it("handles settling debt via handleSettleDebt logic", () => {
    let patient: Patient = {
      id: "pat-2",
      name: "Rebwar",
      gender: "male",
      date: "2026-09-01",
      totalAmount: 200000,
      paidAmount: 120000,
      debtAmount: 80000,
      history: [
        {
          id: "h1",
          date: "2026-09-01",
          title: "Initial",
          notes: "",
          paid: 120000,
          debt: 80000,
        },
      ],
    };

    const curPaid = patient.paidAmount ?? 0;
    const curDebt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
    assert.equal(curDebt, 80000);

    const newPaid = curPaid + curDebt;
    patient = {
      ...patient,
      paidAmount: newPaid,
      debtAmount: 0,
      totalAmount: Math.max(patient.totalAmount ?? 0, newPaid),
      history: [
        ...(patient.history || []),
        {
          id: "h2",
          date: "2026-09-28",
          title: "Debt Settled (Paid in Full)",
          notes: "Paid balance",
          paid: curDebt,
          debt: 0,
        },
      ],
    };

    assert.equal(patient.paidAmount, 200000);
    assert.equal(patient.debtAmount, 0);
    assert.equal(calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount), 0);
    assert.equal(patient.history?.length, 2);
  });

  it("reports consistent monthly stats when patient is edited via EditModal without desyncing history", () => {
    // A patient with 1 history entry edited to paid: 600,000 IQD in September
    const patient: Patient = {
      id: "pat-3",
      name: "Zana Baxtyar",
      gender: "male",
      date: "2026-09-15",
      totalAmount: 600000,
      paidAmount: 600000,
      debtAmount: 0,
      history: [
        {
          id: "h1",
          date: "2026-09-15",
          title: "Initial Consultation",
          notes: "",
          // Notice: in legacy / edited state, h1 might still have had old paid 400000
          paid: 400000,
          debt: 0,
        },
      ],
    };

    // If history has only 1 entry or total history paid does not match patient.paidAmount,
    // let's test what getPatientMonthlyStats returns:
    const stats = getPatientMonthlyStats(patient, "2026-09");
    
    // The user expects the monthly report to reflect what the patient actually paid (600,000)!
    assert.equal(stats.hasActivity, true);
    assert.equal(stats.paid, 600000);
  });

  it("deleting a history entry must correctly update paidAmount and debtAmount", () => {
    const initialPatient: Patient = {
      id: "pat-4",
      name: "Goran",
      gender: "male",
      date: "2026-09-20",
      totalAmount: 150000,
      paidAmount: 150000,
      debtAmount: 0,
      history: [
        { id: "h1", date: "2026-09-10", title: "Visit 1", notes: "", paid: 100000, debt: 0 },
        { id: "h2", date: "2026-09-20", title: "Visit 2 (Accidental)", notes: "", paid: 50000, debt: 0 },
      ],
    };

    // Deleting h2:
    const history = initialPatient.history!.filter((h) => h.id !== "h2");
    const historyPaid = history.reduce((s, h) => s + (h.paid || 0), 0);
    const historyDebt = history.reduce((s, h) => s + (h.debt || 0), 0);

    const updatedPatient: Patient = {
      ...initialPatient,
      paidAmount: historyPaid,
      debtAmount: historyDebt,
      totalAmount: historyPaid + historyDebt,
      history,
    };

    assert.equal(updatedPatient.history!.length, 1);
    assert.equal(updatedPatient.paidAmount, 100000);
    assert.equal(updatedPatient.totalAmount, 100000);
  });
});
