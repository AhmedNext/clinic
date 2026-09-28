-- ========================================================
-- ROW LEVEL SECURITY: STRICT AUTHENTICATED ACCESS ONLY
-- ========================================================

-- 1. Ensure RLS is enabled on all clinical tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_materials ENABLE ROW LEVEL SECURITY;

-- 2. Drop all insecure public and legacy policies
DROP POLICY IF EXISTS "Public access to patients" ON public.patients;
DROP POLICY IF EXISTS "Public access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public access to clinic_materials" ON public.clinic_materials;

DROP POLICY IF EXISTS "Doctor access to patients" ON public.patients;
DROP POLICY IF EXISTS "Doctor access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctor access to clinic_materials" ON public.clinic_materials;

DROP POLICY IF EXISTS "Authenticated users can SELECT patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can INSERT patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can UPDATE patients" ON public.patients;
DROP POLICY IF EXISTS "Authenticated users can DELETE patients" ON public.patients;

DROP POLICY IF EXISTS "Authenticated users can SELECT appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can INSERT appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can UPDATE appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can DELETE appointments" ON public.appointments;

DROP POLICY IF EXISTS "Authenticated users can SELECT clinic_materials" ON public.clinic_materials;
DROP POLICY IF EXISTS "Authenticated users can INSERT clinic_materials" ON public.clinic_materials;
DROP POLICY IF EXISTS "Authenticated users can UPDATE clinic_materials" ON public.clinic_materials;
DROP POLICY IF EXISTS "Authenticated users can DELETE clinic_materials" ON public.clinic_materials;

DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow authenticated users full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_materials" ON public.clinic_materials;

-- 3. Create strict policies for authenticated users ONLY (logged-in doctor/clinic account)
CREATE POLICY "Allow authenticated users full access to patients"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to clinic_materials"
  ON public.clinic_materials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Explicitly revoke permissions from anon (public) and grant to authenticated
REVOKE ALL ON public.patients FROM anon;
REVOKE ALL ON public.appointments FROM anon;
REVOKE ALL ON public.clinic_materials FROM anon;

GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.clinic_materials TO authenticated;
