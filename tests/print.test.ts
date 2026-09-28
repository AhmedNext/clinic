import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Patient, calculateDebt, formatIQD } from "@/types/patient";

describe("Print Receipts & Dental Prescriptions Data Logic", () => {
  it("formats official receipt numbers and financial breakdowns correctly", () => {
    const patient: Patient = {
      id: "pat-1727500000000-abcd",
      name: "Soran Ali",
      gender: "male",
      date: "2026-09-28",
      totalAmount: 350000,
      paidAmount: 200000,
      debtAmount: 150000,
      history: [
        {
          id: "h1",
          date: "2026-09-20",
          title: "Root Canal Filling (Tooth 16)",
          notes: "Obturation completed",
          paid: 100000,
          debt: 100000,
        },
        {
          id: "h2",
          date: "2026-09-28",
          title: "Porcelain Crown Fit (Tooth 16)",
          notes: "Cemented with resin cement",
          paid: 100000,
          debt: 50000,
        },
      ],
    };

    const digitsOnly = patient.id.replace(/\D/g, "");
    const receiptNumber = `REC-${digitsOnly.slice(-4) || "1001"}-${new Date().getFullYear()}`;
    assert.ok(receiptNumber.startsWith("REC-"));
    assert.ok(receiptNumber.endsWith(String(new Date().getFullYear())));

    const totalPaid = patient.paidAmount ?? 0;
    const totalDebt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
    const totalFee = totalPaid + totalDebt;

    assert.equal(totalPaid, 200000);
    assert.equal(totalDebt, 150000);
    assert.equal(totalFee, 350000);
    assert.equal(formatIQD(totalPaid), "200,000 IQD");
    assert.equal(formatIQD(totalDebt), "150,000 IQD");
  });

  it("validates prescription drug rows and formats instructions", () => {
    const commonDentalPrescriptions = [
      {
        name: "Augmentin 625mg (Amoxicillin / Clavulanate)",
        dosage: "1 tablet",
        frequency: "1x3 (every 8 hrs)",
        duration: "7 days",
        instructions: "Take with or right after food",
      },
      {
        name: "Flagyl 500mg (Metronidazole)",
        dosage: "1 tablet",
        frequency: "1x3 (every 8 hrs)",
        duration: "5 days",
        instructions: "Avoid alcohol completely",
      },
      {
        name: "Ibuprofen 400mg",
        dosage: "1 tablet",
        frequency: "1x3 daily",
        duration: "3-5 days",
        instructions: "Strictly after food",
      },
    ];

    assert.equal(commonDentalPrescriptions.length, 3);
    for (const rx of commonDentalPrescriptions) {
      assert.ok(rx.name.length > 0, "Medication name required");
      assert.ok(rx.dosage.length > 0, "Dosage required");
      assert.ok(rx.frequency.length > 0, "Frequency required");
      assert.ok(rx.duration.length > 0, "Duration required");
    }
  });

  it("generates formatted prescription reference numbers", () => {
    const rxDate = new Date("2026-09-28T12:00:00Z");
    const yyyymmdd = rxDate.toISOString().slice(0, 10).replace(/-/g, "");
    const patientId = "pat-1234";
    const rxNumber = `RX-${yyyymmdd}-${patientId.slice(-4)}`;

    assert.equal(rxNumber, "RX-20260928-1234");
  });
});
