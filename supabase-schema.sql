-- ========================================================
-- IQ-DENT CLINIC SYSTEM: MULTI-TENANT DATABASE SCHEMA
-- Each Doctor/Clinic has isolated data based on user_id (auth.uid()).
-- Invited Secretaries access their inviting Doctor's data via
-- auth.jwt()->'user_metadata'->>'doctor_id'.
-- ========================================================

-- Helper function to resolve the current clinic owner
CREATE OR REPLACE FUNCTION public.get_current_clinic_owner_id() RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(
    NULLIF((auth.jwt()->'user_metadata'->>'doctor_id'), '')::uuid,
    (select auth.uid())
  );
$$;

-- ========================================================
-- 1. PATIENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  date TEXT NOT NULL,
  total_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  debt_amount NUMERIC DEFAULT 0,
  notes TEXT,
  medical_history TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  teeth JSONB DEFAULT '[]'::jsonb,
  created_at BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- ========================================================
-- 2. APPOINTMENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  patient_name TEXT NOT NULL,
  phone TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  treatment TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);

-- ========================================================
-- 3. CLINIC MATERIALS & INVENTORY TABLE (Includes Clinic Rent)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.clinic_materials (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  unit TEXT DEFAULT 'pcs',
  quantity NUMERIC DEFAULT 0,
  min_quantity NUMERIC DEFAULT 1,
  cost_price NUMERIC DEFAULT 0,
  patient_price NUMERIC DEFAULT 0,
  supplier TEXT,
  purchase_date TEXT,
  expiry_date TEXT,
  notes TEXT,
  created_at BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinic_materials_user_id ON public.clinic_materials(user_id);

-- ========================================================
-- 4. CLINIC SETTINGS TABLE (White-label Clinic & Doctor profile)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  clinic_name TEXT,
  doctor_name TEXT,
  phone TEXT,
  address TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinic_settings_user_id ON public.clinic_settings(user_id);

-- ========================================================
-- 5. CLINIC STAFF TABLE (Receptionists & Staff members)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.clinic_staff (
  id TEXT PRIMARY KEY,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'secretary',
  created_at BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clinic_staff_doctor_id ON public.clinic_staff(doctor_id);

-- ========================================================
-- 6. ENABLE ROW LEVEL SECURITY & MULTI-TENANT ISOLATION POLICIES
-- ========================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

-- Patients RLS
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.patients;
DROP POLICY IF EXISTS "Clinic isolation for patients" ON public.patients;
CREATE POLICY "Clinic isolation for patients"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

-- Appointments RLS
DROP POLICY IF EXISTS "Allow authenticated users full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clinic isolation for appointments" ON public.appointments;
CREATE POLICY "Clinic isolation for appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

-- Clinic Materials RLS
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_materials" ON public.clinic_materials;
DROP POLICY IF EXISTS "Clinic isolation for clinic_materials" ON public.clinic_materials;
CREATE POLICY "Clinic isolation for clinic_materials"
  ON public.clinic_materials
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

-- Clinic Settings RLS
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Clinic isolation for clinic_settings" ON public.clinic_settings;
CREATE POLICY "Clinic isolation for clinic_settings"
  ON public.clinic_settings
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

-- Clinic Staff RLS
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_staff" ON public.clinic_staff;
DROP POLICY IF EXISTS "Clinic isolation for clinic_staff" ON public.clinic_staff;
CREATE POLICY "Clinic isolation for clinic_staff"
  ON public.clinic_staff
  FOR ALL
  TO authenticated
  USING (doctor_id = public.get_current_clinic_owner_id())
  WITH CHECK (doctor_id = public.get_current_clinic_owner_id());

-- Grant permissions to authenticated role only
REVOKE ALL ON public.patients FROM anon;
REVOKE ALL ON public.appointments FROM anon;
REVOKE ALL ON public.clinic_materials FROM anon;
REVOKE ALL ON public.clinic_settings FROM anon;
REVOKE ALL ON public.clinic_staff FROM anon;

GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.clinic_materials TO authenticated;
GRANT ALL ON public.clinic_settings TO authenticated;
GRANT ALL ON public.clinic_staff TO authenticated;
