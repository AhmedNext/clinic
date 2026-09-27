import { createClient } from "@/utils/supabase/client";
import { Patient } from "@/types/patient";
import { Appointment } from "@/types/appointment";

// Always get a fresh client so the auth session (JWT) is current.
// A module-level singleton would be created before login, missing the user token.
function getSupabase() {
  return createClient();
}

// Map DB row to Patient type
export function mapRowToPatient(row: any): Patient {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    age: row.age ?? undefined,
    phone: row.phone ?? undefined,
    date: row.date,
    totalAmount: row.total_amount ? Number(row.total_amount) : 0,
    paidAmount: row.paid_amount ? Number(row.paid_amount) : 0,
    debtAmount: row.debt_amount ? Number(row.debt_amount) : 0,
    notes: row.notes ?? undefined,
    medicalHistory: row.medical_history ?? undefined,
    history: Array.isArray(row.history) ? row.history : [],
    teeth: Array.isArray(row.teeth) ? row.teeth : [],
    createdAt: row.created_at ? Number(row.created_at) : undefined,
  };
}

// Map Patient type to DB row
export function mapPatientToRow(patient: Patient): any {
  return {
    id: patient.id,
    name: patient.name,
    gender: patient.gender,
    age: patient.age ?? null,
    phone: patient.phone ?? null,
    date: patient.date,
    total_amount: patient.totalAmount ?? 0,
    paid_amount: patient.paidAmount ?? 0,
    debt_amount: patient.debtAmount ?? 0,
    notes: patient.notes ?? null,
    medical_history: patient.medicalHistory ?? null,
    history: patient.history || [],
    teeth: patient.teeth || [],
    created_at: patient.createdAt ?? Date.now(),
    updated_at: new Date().toISOString(),
  };
}

// Map DB row to Appointment type
export function mapRowToAppointment(row: any): Appointment {
  return {
    id: row.id,
    patientName: row.patient_name,
    phone: row.phone ?? "",
    date: row.date,
    time: row.time,
    treatment: row.treatment ?? undefined,
    notes: row.notes ?? undefined,
    status: row.status,
    createdAt: row.created_at ? Number(row.created_at) : Date.now(),
  };
}

// Map Appointment type to DB row
export function mapAppointmentToRow(apt: Appointment): any {
  return {
    id: apt.id,
    patient_name: apt.patientName,
    phone: apt.phone ?? null,
    date: apt.date,
    time: apt.time,
    treatment: apt.treatment ?? null,
    notes: apt.notes ?? null,
    status: apt.status,
    created_at: apt.createdAt ?? Date.now(),
    updated_at: new Date().toISOString(),
  };
}

// ================= PATIENT API =================
export async function fetchPatientsFromDB(): Promise<Patient[]> {
  const { data, error } = await getSupabase()
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching patients from Supabase:", error);
    throw error;
  }
  return (data || []).map(mapRowToPatient);
}

export async function upsertPatientToDB(patient: Patient): Promise<void> {
  const row = mapPatientToRow(patient);
  const { error } = await getSupabase().from("patients").upsert(row);
  if (error) {
    console.error("Error saving patient to Supabase:", error);
    throw error;
  }
}

export async function deletePatientFromDB(id: string): Promise<void> {
  const { error } = await getSupabase().from("patients").delete().eq("id", id);
  if (error) {
    console.error("Error deleting patient from Supabase:", error);
    throw error;
  }
}

// ================= APPOINTMENT API =================
export async function fetchAppointmentsFromDB(): Promise<Appointment[]> {
  const { data, error } = await getSupabase()
    .from("appointments")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching appointments from Supabase:", error);
    throw error;
  }
  return (data || []).map(mapRowToAppointment);
}

export async function upsertAppointmentToDB(apt: Appointment): Promise<void> {
  const row = mapAppointmentToRow(apt);
  const { error } = await getSupabase().from("appointments").upsert(row);
  if (error) {
    console.error("Error saving appointment to Supabase:", error);
    throw error;
  }
}

export async function deleteAppointmentFromDB(id: string): Promise<void> {
  const { error } = await getSupabase().from("appointments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting appointment from Supabase:", error);
    throw error;
  }
}
