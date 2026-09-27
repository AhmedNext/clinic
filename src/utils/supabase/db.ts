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
  const history = Array.isArray(row.history) ? row.history : [];
  const latestTime = history[0]?.time || (row.time ?? undefined);

  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    age: row.age ?? undefined,
    phone: row.phone ?? undefined,
    date: row.date,
    time: latestTime,
    totalAmount: row.total_amount ? Number(row.total_amount) : 0,
    paidAmount: row.paid_amount ? Number(row.paid_amount) : 0,
    debtAmount: row.debt_amount ? Number(row.debt_amount) : 0,
    notes: row.notes ?? undefined,
    medicalHistory: row.medical_history ?? undefined,
    history,
    teeth: Array.isArray(row.teeth) ? row.teeth : [],
    createdAt: row.created_at ? Number(row.created_at) : undefined,
  };
}

// Map Patient type to DB row
export function mapPatientToRow(patient: Patient): any {
  // Preserve patient.time in the latest history entry so it saves in JSONB without DB migrations
  const history = [...(patient.history || [])];
  if (patient.time) {
    if (history.length > 0) {
      history[0] = { ...history[0], time: patient.time };
    } else {
      history.push({
        id: `hist-${Date.now()}`,
        date: patient.date,
        time: patient.time,
        title: "Initial Visit",
        notes: "",
        fee: patient.totalAmount ?? 0,
        paid: patient.paidAmount ?? 0,
        debt: patient.debtAmount ?? 0,
        createdAt: Date.now(),
      });
    }
  }

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
    history,
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

// Cache keys for instant 0ms loads
const LOCAL_STORAGE_PATIENTS_KEY = "dr_qayssar_patients_cache";
const LOCAL_STORAGE_APPOINTMENTS_KEY = "dr_qayssar_appointments_cache";
const LOCAL_STORAGE_MATERIALS_KEY = "dr_qayssar_materials_cache";

export function getCachedPatients(): Patient[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function getCachedAppointments(): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_APPOINTMENTS_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function getCachedMaterials(): ClinicMaterial[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_MATERIALS_KEY);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed)
      ? parsed.filter((m) => !["mat-1", "mat-2", "mat-3", "mat-4", "mat-5", "mat-6"].includes(m.id))
      : [];
  } catch {
    return [];
  }
}

// ================= PATIENT API =================
export async function fetchPatientsFromDB(): Promise<Patient[]> {
  try {
    const { data, error } = await getSupabase()
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!error && data) {
      const parsed = data.map(mapRowToPatient);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_PATIENTS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Error fetching patients from Supabase, using cache:", err);
  }
  return getCachedPatients();
}

export async function upsertPatientToDB(patient: Patient): Promise<void> {
  // Update local cache immediately for 0ms UI response
  if (typeof window !== "undefined") {
    const cached = getCachedPatients();
    const idx = cached.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      cached[idx] = patient;
    } else {
      cached.unshift(patient);
    }
    localStorage.setItem(LOCAL_STORAGE_PATIENTS_KEY, JSON.stringify(cached));
  }

  const row = mapPatientToRow(patient);
  const { error } = await getSupabase().from("patients").upsert(row);
  if (error) {
    console.error("Error saving patient to Supabase:", error);
    throw error;
  }
}

export async function deletePatientFromDB(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedPatients();
    localStorage.setItem(
      LOCAL_STORAGE_PATIENTS_KEY,
      JSON.stringify(cached.filter((p) => p.id !== id))
    );
  }

  const { error } = await getSupabase().from("patients").delete().eq("id", id);
  if (error) {
    console.error("Error deleting patient from Supabase:", error);
    throw error;
  }
}

// ================= APPOINTMENT API =================
export async function fetchAppointmentsFromDB(): Promise<Appointment[]> {
  try {
    const { data, error } = await getSupabase()
      .from("appointments")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      const parsed = data.map(mapRowToAppointment);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
  } catch (err) {
    console.warn("Error fetching appointments from Supabase, using cache:", err);
  }
  return getCachedAppointments();
}

export async function upsertAppointmentToDB(apt: Appointment): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedAppointments();
    const idx = cached.findIndex((a) => a.id === apt.id);
    if (idx >= 0) {
      cached[idx] = apt;
    } else {
      cached.push(apt);
    }
    localStorage.setItem(LOCAL_STORAGE_APPOINTMENTS_KEY, JSON.stringify(cached));
  }

  const row = mapAppointmentToRow(apt);
  const { error } = await getSupabase().from("appointments").upsert(row);
  if (error) {
    console.error("Error saving appointment to Supabase:", error);
    throw error;
  }
}

export async function deleteAppointmentFromDB(id: string): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedAppointments();
    localStorage.setItem(
      LOCAL_STORAGE_APPOINTMENTS_KEY,
      JSON.stringify(cached.filter((a) => a.id !== id))
    );
  }

  const { error } = await getSupabase().from("appointments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting appointment from Supabase:", error);
    throw error;
  }
}

// ================= MATERIAL & EXPENSES API =================
export function mapRowToMaterial(row: any): ClinicMaterial {
  const supplier = row.supplier || row.name || "Clinic Supplier";
  return {
    id: row.id,
    date: row.purchase_date || (row.date ? row.date : new Date().toISOString().substring(0, 10)),
    supplier,
    name: supplier,
    costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : 0,
    patientPrice: row.patient_price ? Number(row.patient_price) : 0,
    notes: row.notes ?? undefined,
    createdAt: row.created_at ? Number(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

export function mapMaterialToRow(mat: ClinicMaterial): any {
  return {
    id: mat.id,
    name: mat.supplier,
    supplier: mat.supplier,
    category: "General",
    unit: "Item",
    quantity: 1,
    min_quantity: 0,
    cost_price: mat.costPrice,
    patient_price: 0,
    purchase_date: mat.date,
    notes: mat.notes ?? null,
    created_at: mat.createdAt ?? Date.now(),
    updated_at: new Date().toISOString(),
  };
}

export async function fetchMaterialsFromDB(): Promise<ClinicMaterial[]> {
  try {
    const { data, error } = await getSupabase()
      .from("clinic_materials")
      .select("*")
      .neq("category", "Rent")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const parsed = data
        .filter((row) => row.category !== "Rent")
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

// ================= CLINIC MONTHLY RENT API =================
const LOCAL_STORAGE_RENT_KEY = "dr_qayssar_rent_cache";

export async function fetchRentFromDB(): Promise<Record<string, number>> {
  try {
    const { data, error } = await getSupabase()
      .from("clinic_materials")
      .select("*")
      .eq("category", "Rent");

    if (!error && data) {
      const rentMap: Record<string, number> = {};
      data.forEach((row: any) => {
        const ym = (row.purchase_date || row.name || "").substring(0, 7);
        if (ym) {
          rentMap[ym] = Number(row.cost_price) || 0;
        }
      });
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_RENT_KEY, JSON.stringify(rentMap));
      }
      return rentMap;
    }
  } catch (err) {
    console.warn("Error fetching rent from Supabase, using cache:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_RENT_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  return {};
}

export async function saveRentToDB(month: string, amount: number): Promise<void> {
  const rentId = `rent-${month}`;
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_RENT_KEY);
      const map: Record<string, number> = cached ? JSON.parse(cached) : {};
      if (amount <= 0) {
        delete map[month];
      } else {
        map[month] = amount;
      }
      localStorage.setItem(LOCAL_STORAGE_RENT_KEY, JSON.stringify(map));
    } catch {}
  }

  try {
    if (amount <= 0) {
      await getSupabase().from("clinic_materials").delete().eq("id", rentId);
    } else {
      await getSupabase().from("clinic_materials").upsert({
        id: rentId,
        name: `Rent ${month}`,
        category: "Rent",
        unit: "Month",
        quantity: 1,
        min_quantity: 0,
        cost_price: amount,
        patient_price: 0,
        supplier: "Clinic Rent",
        purchase_date: `${month}-01`,
        created_at: Date.now(),
        updated_at: new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("Could not save rent to Supabase:", e);
  }
}

