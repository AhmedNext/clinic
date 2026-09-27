import { createClient } from "@/utils/supabase/client";
import { Patient } from "@/types/patient";
import { Appointment } from "@/types/appointment";
import { ClinicMaterial, DEFAULT_CLINIC_MATERIALS } from "@/types/material";

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

// ================= MATERIAL & EXPENSES API =================
export function mapRowToMaterial(row: any): ClinicMaterial {
  return {
    id: row.id,
    name: row.name,
    category: row.category || "General",
    unit: row.unit || "pcs",
    quantity: row.quantity !== null && row.quantity !== undefined ? Number(row.quantity) : 0,
    minQuantity: row.min_quantity !== null && row.min_quantity !== undefined ? Number(row.min_quantity) : 1,
    costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : 0,
    patientPrice: row.patient_price !== null && row.patient_price !== undefined ? Number(row.patient_price) : 0,
    supplier: row.supplier ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    expiryDate: row.expiry_date ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at ? Number(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

export function mapMaterialToRow(mat: ClinicMaterial): any {
  return {
    id: mat.id,
    name: mat.name,
    category: mat.category,
    unit: mat.unit,
    quantity: mat.quantity,
    min_quantity: mat.minQuantity,
    cost_price: mat.costPrice,
    patient_price: mat.patientPrice,
    supplier: mat.supplier ?? null,
    purchase_date: mat.purchaseDate ?? null,
    expiry_date: mat.expiryDate ?? null,
    notes: mat.notes ?? null,
    created_at: mat.createdAt ?? Date.now(),
    updated_at: new Date().toISOString(),
  };
}

const LOCAL_STORAGE_MATERIALS_KEY = "dr_qayssar_materials_cache";

export async function fetchMaterialsFromDB(): Promise<ClinicMaterial[]> {
  try {
    const { data, error } = await getSupabase()
      .from("clinic_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const parsed = data
        .map(mapRowToMaterial)
        .filter((m) => !["mat-1", "mat-2", "mat-3", "mat-4", "mat-5", "mat-6"].includes(m.id));

      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_MATERIALS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Supabase clinic_materials not available, using fallback:", err);
  }

  // Fallback to localStorage or empty array
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_MATERIALS_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Filter out any legacy dummy seed items
          const cleaned = parsed.filter(
            (m) => !["mat-1", "mat-2", "mat-3", "mat-4", "mat-5", "mat-6"].includes(m.id)
          );
          localStorage.setItem(LOCAL_STORAGE_MATERIALS_KEY, JSON.stringify(cleaned));
          return cleaned;
        }
      } catch (e) {
        // ignore
      }
    }
    localStorage.setItem(LOCAL_STORAGE_MATERIALS_KEY, JSON.stringify([]));
  }
  return [];
}

export async function upsertMaterialToDB(mat: ClinicMaterial): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_MATERIALS_KEY);
    let list: ClinicMaterial[] = cached ? JSON.parse(cached) : [];
    const idx = list.findIndex((m) => m.id === mat.id);
    if (idx >= 0) {
      list[idx] = mat;
    } else {
      list.unshift(mat);
    }
    localStorage.setItem(LOCAL_STORAGE_MATERIALS_KEY, JSON.stringify(list));
  }

  try {
    const row = mapMaterialToRow(mat);
    await getSupabase().from("clinic_materials").upsert(row);
  } catch (e) {
    console.warn("Could not sync material to Supabase (using local cache):", e);
  }
}

export async function deleteMaterialFromDB(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_MATERIALS_KEY);
    if (cached) {
      try {
        const list: ClinicMaterial[] = JSON.parse(cached);
        localStorage.setItem(
          LOCAL_STORAGE_MATERIALS_KEY,
          JSON.stringify(list.filter((m) => m.id !== id))
        );
      } catch (e) {
        // ignore
      }
    }
  }

  try {
    await getSupabase().from("clinic_materials").delete().eq("id", id);
  } catch (e) {
    console.warn("Could not delete material from Supabase:", e);
  }
}
