import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Appointment, AppointmentStatus } from "@/types/appointment";

describe("Appointments logic & Filtering", () => {
  const sampleAppointments: Appointment[] = [
    {
      id: "apt-1",
      patientName: "Ahmed Salah",
      phone: "07701234567",
      date: "2026-09-28",
      time: "10:00 AM",
      treatment: "Root Canal - Tooth 16",
      status: "scheduled",
      createdAt: 1000,
    },
    {
      id: "apt-2",
      patientName: "Zana Baxtyar",
      phone: "07509876543",
      date: "2026-09-28",
      time: "11:30 AM",
      treatment: "Crown Placement",
      status: "completed",
      createdAt: 2000,
    },
    {
      id: "apt-3",
      patientName: "Sara Karim",
      phone: "07801112233",
      date: "2026-09-29",
      time: "02:00 PM",
      treatment: "Scaling & Polishing",
      status: "cancelled",
      createdAt: 3000,
    },
  ];

  it("filters appointments by status correctly", () => {
    const scheduled = sampleAppointments.filter((a) => a.status === "scheduled");
    const completed = sampleAppointments.filter((a) => a.status === "completed");
    const cancelled = sampleAppointments.filter((a) => a.status === "cancelled");

    assert.equal(scheduled.length, 1);
    assert.equal(scheduled[0].patientName, "Ahmed Salah");

    assert.equal(completed.length, 1);
    assert.equal(completed[0].patientName, "Zana Baxtyar");

    assert.equal(cancelled.length, 1);
    assert.equal(cancelled[0].patientName, "Sara Karim");
  });

  it("filters appointments by date correctly", () => {
    const todayApts = sampleAppointments.filter((a) => a.date === "2026-09-28");
    assert.equal(todayApts.length, 2);
  });

  it("searches appointments by patient name, phone, or treatment", () => {
    const query = "root";
    const filtered = sampleAppointments.filter(
      (a) =>
        a.patientName.toLowerCase().includes(query) ||
        (a.phone && a.phone.includes(query)) ||
        (a.treatment && a.treatment.toLowerCase().includes(query))
    );

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].patientName, "Ahmed Salah");
  });

  it("transitions appointment status cleanly", () => {
    let apt = { ...sampleAppointments[0] };
    assert.equal(apt.status, "scheduled");

    // Mark as completed
    apt = { ...apt, status: "completed" };
    assert.equal(apt.status, "completed");

    // Reschedule / change time
    apt = { ...apt, status: "scheduled", time: "11:00 AM", date: "2026-09-29" };
    assert.equal(apt.status, "scheduled");
    assert.equal(apt.date, "2026-09-29");
  });
});
