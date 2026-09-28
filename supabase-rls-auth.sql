-- ========================================================
-- ROW LEVEL SECURITY: MULTI-TENANT CLINIC ISOLATION POLICIES
-- Each Doctor/Clinic has strictly private data based on user_id (auth.uid()).
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

-- 1. Ensure RLS is enabled on all clinical tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff ENABLE ROW LEVEL SECURITY;

-- 2. Drop old non-isolated or overly permissive policies
DROP POLICY IF EXISTS "Public access to patients" ON public.patients;
DROP POLICY IF EXISTS "Public access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public access to clinic_materials" ON public.clinic_materials;
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow authenticated users full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_materials" ON public.clinic_materials;
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_settings" ON public.clinic_settings;
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_staff" ON public.clinic_staff;

-- 3. Create strict multi-tenant isolation policies
DROP POLICY IF EXISTS "Clinic isolation for patients" ON public.patients;
CREATE POLICY "Clinic isolation for patients"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

DROP POLICY IF EXISTS "Clinic isolation for appointments" ON public.appointments;
CREATE POLICY "Clinic isolation for appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

DROP POLICY IF EXISTS "Clinic isolation for clinic_materials" ON public.clinic_materials;
CREATE POLICY "Clinic isolation for clinic_materials"
  ON public.clinic_materials
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

DROP POLICY IF EXISTS "Clinic isolation for clinic_settings" ON public.clinic_settings;
CREATE POLICY "Clinic isolation for clinic_settings"
  ON public.clinic_settings
  FOR ALL
  TO authenticated
  USING (user_id = public.get_current_clinic_owner_id())
  WITH CHECK (user_id = public.get_current_clinic_owner_id());

DROP POLICY IF EXISTS "Clinic isolation for clinic_staff" ON public.clinic_staff;
CREATE POLICY "Clinic isolation for clinic_staff"
  ON public.clinic_staff
  FOR ALL
  TO authenticated
  USING (doctor_id = public.get_current_clinic_owner_id())
  WITH CHECK (doctor_id = public.get_current_clinic_owner_id());

-- 4. Explicitly revoke permissions from anon (public) and grant to authenticated
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
