import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapRowToPatient,
  mapPatientToRow,
  mapRowToAppointment,
  mapAppointmentToRow,
  mapRowToMaterial,
  mapMaterialToRow,
} from "@/utils/supabase/db";
import { Patient } from "@/types/patient";
import { Appointment } from "@/types/appointment";
import { ClinicMaterial } from "@/types/material";

describe("Supabase DB Row <-> App Model Mappings", () => {
  describe("Patient Mapping", () => {
    it("converts DB row to Patient with all dental records and history intact", () => {
      const dbRow = {
        id: "pat-123",
        name: "Ahmed Hassan",
        gender: "male",
        age: 32,
        phone: "07701234567",
        date: "2026-09-28",
        time: "10:30 AM",
        total_amount: "250000",
        paid_amount: "150000",
        debt_amount: "100000",
        notes: "Sensitive to cold drinks",
        medical_history: "Penicillin allergy",
        teeth: [{ toothNumber: 16, status: "filling", price: 50000 }],
        history: [
          {
            id: "hist-1",
            date: "2026-09-28",
            time: "10:30 AM",
            title: "Composite Filling",
            notes: "Tooth 16 restored",
            paid: 150000,
            debt: 100000,
          },
        ],
        created_at: 1759000000000,
      };

      const patient = mapRowToPatient(dbRow);
      assert.equal(patient.id, "pat-123");
      assert.equal(patient.name, "Ahmed Hassan");
      assert.equal(patient.gender, "male");
      assert.equal(patient.age, 32);
      assert.equal(patient.phone, "07701234567");
      assert.equal(patient.date, "2026-09-28");
      assert.equal(patient.time, "10:30 AM");
      assert.equal(patient.totalAmount, 250000);
      assert.equal(patient.paidAmount, 150000);
      assert.equal(patient.debtAmount, 100000);
      assert.equal(patient.notes, "Sensitive to cold drinks");
      assert.equal(patient.medicalHistory, "Penicillin allergy");
      assert.equal(patient.teeth?.length, 1);
      assert.equal(patient.teeth?.[0].toothNumber, 16);
      assert.equal(patient.history?.length, 1);
    });

    it("handles null / missing fields safely when mapping from DB", () => {
      const bareRow = {
        id: "pat-999",
        name: "Test",
        gender: "female",
        date: "2026-09-01",
        total_amount: null,
        paid_amount: null,
        debt_amount: null,
        teeth: null,
        history: null,
      };

      const p = mapRowToPatient(bareRow);
      assert.equal(p.totalAmount, 0);
      assert.equal(p.paidAmount, 0);
      assert.equal(p.debtAmount, 0);
      assert.deepEqual(p.teeth, []);
      assert.deepEqual(p.history, []);
      assert.equal(p.age, undefined);
      assert.equal(p.phone, undefined);
    });

    it("converts Patient to DB row with correct snake_case fields", () => {
      const patient: Patient = {
        id: "pat-456",
        name: "Fatima Noor",
        gender: "female",
        age: 26,
        phone: "07501234567",
        date: "2026-09-20",
        time: "11:00 AM",
        totalAmount: 300000,
        paidAmount: 300000,
        debtAmount: 0,
        teeth: [{ toothNumber: 21, status: "whitening" }],
      };

      const row = mapPatientToRow(patient);
      assert.equal(row.id, "pat-456");
      assert.equal(row.name, "Fatima Noor");
      assert.equal(row.total_amount, 300000);
      assert.equal(row.paid_amount, 300000);
      assert.equal(row.debt_amount, 0);
      assert.ok(row.history);
      assert.ok(row.history.length > 0);
      assert.equal(row.history[0].time, "11:00 AM");
    });
  });

  describe("Appointment Mapping", () => {
    it("maps Appointment DB row to Appointment model", () => {
      const row = {
        id: "apt-1",
        patient_name: "Ali",
        phone: "0770",
        date: "2026-09-28",
        time: "02:00 PM",
        treatment: "Checkup",
        status: "scheduled",
        created_at: 1759000000000,
      };

      const apt = mapRowToAppointment(row);
      assert.equal(apt.id, "apt-1");
      assert.equal(apt.patientName, "Ali");
      assert.equal(apt.time, "02:00 PM");
      assert.equal(apt.status, "scheduled");
    });

    it("maps Appointment model to DB row", () => {
      const apt: Appointment = {
        id: "apt-2",
        patientName: "Zana",
        phone: "07501234567",
        date: "2026-09-29",
        time: "03:30 PM",
        status: "completed",
        createdAt: 12345,
      };

      const row = mapAppointmentToRow(apt);
      assert.equal(row.id, "apt-2");
      assert.equal(row.patient_name, "Zana");
      assert.equal(row.status, "completed");
    });
  });

  describe("Material / Expense Mapping", () => {
    it("maps Material DB row to ClinicMaterial model with category", () => {
      const row = {
        id: "mat-1",
        date: "2026-09-15",
        supplier: "Dental Lab",
        cost_price: 150000,
        category: "lab",
        created_at: 1234567,
      };

      const mat = mapRowToMaterial(row);
      assert.equal(mat.id, "mat-1");
      assert.equal(mat.supplier, "Dental Lab");
      assert.equal(mat.costPrice, 150000);
      assert.equal(mat.category, "lab");
    });

    it("maps ClinicMaterial model to DB row with snake_case cost_price", () => {
      const mat: ClinicMaterial = {
        id: "mat-2",
        date: "2026-09-16",
        supplier: "Clinic Rent",
        costPrice: 600000,
        category: "rent",
        createdAt: 999999,
      };

      const row = mapMaterialToRow(mat);
      assert.equal(row.id, "mat-2");
      assert.equal(row.supplier, "Clinic Rent");
      assert.equal(row.cost_price, 600000);
      assert.equal(row.category, "rent");
    });
  });
});
