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
export function mapPatientToRow(patient: Patient, userId?: string | null): any {
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

  const row: any = {
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

  if (userId) {
    row.user_id = userId;
  }

  return row;
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
export function mapAppointmentToRow(apt: Appointment, userId?: string | null): any {
  const row: any = {
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

  if (userId) {
    row.user_id = userId;
  }

  return row;
}

// Helper to generate strictly isolated cache keys per clinic / doctor
function getCacheKey(baseKey: string, userId?: string | null): string {
  if (userId) return `${baseKey}_${userId}`;
  return baseKey;
}

export function clearAllClinicCache() {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        (k.startsWith("clinic_") ||
          k.startsWith("dr_qayssar_") ||
          k.includes("patients_cache") ||
          k.includes("appointments_cache") ||
          k.includes("materials_cache") ||
          k.includes("settings") ||
          k.includes("staff"))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {
    console.error("Failed to clear clinic cache:", e);
  }
}

export function getCachedPatients(userId?: string | null): Patient[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCacheKey("clinic_patients_cache", userId);
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function setCachedPatients(patients: Patient[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = getCacheKey("clinic_patients_cache", userId);
    localStorage.setItem(key, JSON.stringify(patients));
  } catch {}
}

export function getCachedAppointments(userId?: string | null): Appointment[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCacheKey("clinic_appointments_cache", userId);
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export function setCachedAppointments(apts: Appointment[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = getCacheKey("clinic_appointments_cache", userId);
    localStorage.setItem(key, JSON.stringify(apts));
  } catch {}
}

export function getCachedMaterials(userId?: string | null): ClinicMaterial[] {
  if (typeof window === "undefined") return [];
  try {
    const key = getCacheKey("clinic_materials_cache", userId);
    const cached = localStorage.getItem(key);
    if (!cached) return [];
    const parsed = JSON.parse(cached);
    return Array.isArray(parsed)
      ? parsed.filter((m) => !["mat-1", "mat-2", "mat-3", "mat-4", "mat-5", "mat-6"].includes(m.id))
      : [];
  } catch {
    return [];
  }
}

export function setCachedMaterials(materials: ClinicMaterial[], userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = getCacheKey("clinic_materials_cache", userId);
    localStorage.setItem(key, JSON.stringify(materials));
  } catch {}
}

// ================= PATIENT API =================
export async function fetchPatientsFromDB(userId?: string | null): Promise<Patient[]> {
  try {
    let query = getSupabase()
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (!error && data) {
      const parsed = data.map(mapRowToPatient);
      setCachedPatients(parsed, userId);
      return parsed;
    }
  } catch (err) {
    console.warn("Error fetching patients from Supabase, using cache:", err);
  }
  return getCachedPatients(userId);
}

export async function upsertPatientToDB(patient: Patient, userId?: string | null): Promise<void> {
  // Update isolated local cache immediately for 0ms UI response
  if (typeof window !== "undefined") {
    const cached = getCachedPatients(userId);
    const idx = cached.findIndex((p) => p.id === patient.id);
    if (idx >= 0) {
      cached[idx] = patient;
    } else {
      cached.unshift(patient);
    }
    setCachedPatients(cached, userId);
  }

  const row = mapPatientToRow(patient, userId);
  const { error } = await getSupabase().from("patients").upsert(row);
  if (error) {
    console.error("Error saving patient to Supabase:", error);
    throw error;
  }
}

export async function deletePatientFromDB(id: string, userId?: string | null): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedPatients(userId);
    setCachedPatients(cached.filter((p) => p.id !== id), userId);
  }

  const { error } = await getSupabase().from("patients").delete().eq("id", id);
  if (error) {
    console.error("Error deleting patient from Supabase:", error);
    throw error;
  }
}

// ================= APPOINTMENT API =================
export async function fetchAppointmentsFromDB(userId?: string | null): Promise<Appointment[]> {
  try {
    let query = getSupabase()
      .from("appointments")
      .select("*")
      .order("date", { ascending: true });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (!error && data) {
      const parsed = data.map(mapRowToAppointment);
      setCachedAppointments(parsed, userId);
      return parsed;
    }
  } catch (err) {
    console.warn("Error fetching appointments from Supabase, using cache:", err);
  }
  return getCachedAppointments(userId);
}

export async function upsertAppointmentToDB(apt: Appointment, userId?: string | null): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedAppointments(userId);
    const idx = cached.findIndex((a) => a.id === apt.id);
    if (idx >= 0) {
      cached[idx] = apt;
    } else {
      cached.push(apt);
    }
    setCachedAppointments(cached, userId);
  }

  const row = mapAppointmentToRow(apt, userId);
  const { error } = await getSupabase().from("appointments").upsert(row);
  if (error) {
    console.error("Error saving appointment to Supabase:", error);
    throw error;
  }
}

export async function deleteAppointmentFromDB(id: string, userId?: string | null): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedAppointments(userId);
    setCachedAppointments(cached.filter((a) => a.id !== id), userId);
  }

  const { error } = await getSupabase().from("appointments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting appointment from Supabase:", error);
    throw error;
  }
}

// ================= MATERIAL & EXPENSES API =================
export function mapRowToMaterial(row: any): ClinicMaterial {
  const supplier = row.supplier || row.name || "Clinic Expense";
  let cat: string = "materials";
  if (row.category) {
    const c = String(row.category).toLowerCase().trim();
    if (c === "rent") cat = "rent";
    else if (c === "utilities" || c.includes("util") || c.includes("bill") || c.includes("electric")) cat = "utilities";
    else if (c === "lab" || c.includes("lab")) cat = "lab";
    else if (c === "other") cat = "other";
    else cat = "materials";
  }
  return {
    id: row.id,
    date: row.purchase_date || (row.date ? row.date : new Date().toISOString().substring(0, 10)),
    supplier,
    name: supplier,
    costPrice: row.cost_price !== null && row.cost_price !== undefined ? Number(row.cost_price) : 0,
    category: cat,
    patientPrice: row.patient_price ? Number(row.patient_price) : 0,
    notes: row.notes ?? undefined,
    createdAt: row.created_at ? Number(row.created_at) : Date.now(),
    updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : undefined,
  };
}

export function mapMaterialToRow(mat: ClinicMaterial, userId?: string | null): any {
  const row: any = {
    id: mat.id,
    name: mat.supplier,
    supplier: mat.supplier,
    category: mat.category || "materials",
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

  if (userId) {
    row.user_id = userId;
  }

  return row;
}

export async function fetchMaterialsFromDB(userId?: string | null): Promise<ClinicMaterial[]> {
  try {
    let query = getSupabase()
      .from("clinic_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (!error && data) {
      const parsed = data
        .map(mapRowToMaterial)
        .filter((m) => !["mat-1", "mat-2", "mat-3", "mat-4", "mat-5", "mat-6"].includes(m.id));

      setCachedMaterials(parsed, userId);
      return parsed;
    }
  } catch (err) {
    console.warn("Supabase clinic_materials not available, using fallback:", err);
  }

  return getCachedMaterials(userId);
}

export async function upsertMaterialToDB(mat: ClinicMaterial, userId?: string | null): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedMaterials(userId);
    const idx = cached.findIndex((m) => m.id === mat.id);
    let list: ClinicMaterial[];
    if (idx >= 0) {
      list = [...cached];
      list[idx] = mat;
    } else {
      list = [mat, ...cached];
    }
    setCachedMaterials(list, userId);
  }

  try {
    const row = mapMaterialToRow(mat, userId);
    await getSupabase().from("clinic_materials").upsert(row);
  } catch (e) {
    console.warn("Could not sync material to Supabase (using local cache):", e);
  }
}

export async function deleteMaterialFromDB(id: string, userId?: string | null): Promise<void> {
  if (typeof window !== "undefined") {
    const cached = getCachedMaterials(userId);
    setCachedMaterials(cached.filter((m) => m.id !== id), userId);
  }

  try {
    await getSupabase().from("clinic_materials").delete().eq("id", id);
  } catch (e) {
    console.warn("Could not delete material from Supabase:", e);
  }
}

// ================= CLINIC MONTHLY RENT API =================
export async function fetchRentFromDB(userId?: string | null): Promise<Record<string, number>> {
  try {
    let query = getSupabase()
      .from("clinic_materials")
      .select("*")
      .eq("category", "Rent");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (!error && data) {
      const rentMap: Record<string, number> = {};
      data.forEach((row: any) => {
        const ym = (row.purchase_date || row.name || "").substring(0, 7);
        if (ym) {
          rentMap[ym] = Number(row.cost_price) || 0;
        }
      });
      if (typeof window !== "undefined") {
        const key = getCacheKey("clinic_rent_cache", userId);
        localStorage.setItem(key, JSON.stringify(rentMap));
      }
      return rentMap;
    }
  } catch (err) {
    console.warn("Error fetching rent from Supabase, using cache:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const key = getCacheKey("clinic_rent_cache", userId);
      const cached = localStorage.getItem(key);
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  return {};
}

export async function saveRentToDB(month: string, amount: number, userId?: string | null): Promise<void> {
  const rentId = userId ? `rent-${userId}-${month}` : `rent-${month}`;
  if (typeof window !== "undefined") {
    try {
      const key = getCacheKey("clinic_rent_cache", userId);
      const cached = localStorage.getItem(key);
      const map: Record<string, number> = cached ? JSON.parse(cached) : {};
      if (amount <= 0) {
        delete map[month];
      } else {
        map[month] = amount;
      }
      localStorage.setItem(key, JSON.stringify(map));
    } catch {}
  }

  try {
    if (amount <= 0) {
      await getSupabase().from("clinic_materials").delete().eq("id", rentId);
    } else {
      const row: any = {
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
      };
      if (userId) {
        row.user_id = userId;
      }
      await getSupabase().from("clinic_materials").upsert(row);
    }
  } catch (e) {
    console.warn("Could not save rent to Supabase:", e);
  }
}

