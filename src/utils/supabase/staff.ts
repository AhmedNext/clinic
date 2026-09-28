import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { StaffMember } from "@/types/staff";
import { createClient } from "./client";

const LOCAL_STORAGE_STAFF_KEY = "clinic_staff_members_cache";

/**
 * Creates a dedicated non-persisting Supabase client so creating a new
 * staff/secretary account does NOT overwrite the doctor's active session.
 */
function getStaffAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export function getCachedStaff(): StaffMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setCachedStaff(staff: StaffMember[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(staff));
  } catch (e) {
    console.error("Failed to cache staff list:", e);
  }
}

/**
 * Registers a new Secretary account in Supabase Auth with metadata { role: 'secretary' }.
 * Saves to clinic_staff table and local cache.
 */
export async function createSecretaryAccount(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; staffMember?: StaffMember }> {
  try {
    const authClient = getStaffAuthClient();
    const cleanEmail = email.trim().toLowerCase();

    const redirectUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" && window.location.origin.includes("iq-dent")
        ? window.location.origin
        : "https://iq-dent.vercel.app");

    // 1. Sign up user in Supabase Auth with role: 'secretary'
    const { data, error } = await authClient.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          role: "secretary",
          full_name: name.trim(),
          name: name.trim(),
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const newStaffMember: StaffMember = {
      id: data.user?.id || `staff-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: "secretary",
      createdAt: Date.now(),
    };

    // 2. Persist in local cache
    const current = getCachedStaff().filter((s) => s.email !== cleanEmail);
    const updated = [newStaffMember, ...current];
    setCachedStaff(updated);

    // 3. Try to save to Supabase clinic_staff table if created
    try {
      const activeClient = createClient();
      await activeClient.from("clinic_staff").upsert([
        {
          id: newStaffMember.id,
          name: newStaffMember.name,
          email: newStaffMember.email,
          role: newStaffMember.role,
          created_at: newStaffMember.createdAt,
        },
      ]);
    } catch {
      // Table may not exist yet; cached data remains available
    }

    return { success: true, staffMember: newStaffMember };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create secretary account";
    return { success: false, error: message };
  }
}

/**
 * Fetch list of staff from Supabase or fallback to cache.
 */
export async function fetchStaffFromDB(): Promise<StaffMember[]> {
  try {
    const activeClient = createClient();
    const { data, error } = await activeClient
      .from("clinic_staff")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const staff: StaffMember[] = data.map((d) => ({
        id: String(d.id),
        name: String(d.name),
        email: String(d.email),
        role: (d.role as "secretary" | "doctor") || "secretary",
        createdAt: Number(d.created_at) || Date.now(),
      }));
      setCachedStaff(staff);
      return staff;
    }
  } catch {
    // fallback to cache
  }

  return getCachedStaff();
}

/**
 * Delete a staff member record.
 */
export async function deleteStaffFromDB(id: string): Promise<void> {
  const current = getCachedStaff().filter((s) => s.id !== id);
  setCachedStaff(current);

  try {
    const activeClient = createClient();
    await activeClient.from("clinic_staff").delete().eq("id", id);
  } catch {
    // Ignore error
  }
}
