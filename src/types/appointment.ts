export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  treatment?: string; // e.g. "Routine Checkup", "Root Canal Session 2", "Composite Filling"
  notes?: string;
  status: AppointmentStatus;
  createdAt: number;
}
