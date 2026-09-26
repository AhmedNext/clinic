-- ========================================================
-- ROW LEVEL SECURITY: ONLY AUTHENTICATED USERS (DR. QAYSSAR)
-- ========================================================

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Remove old public policies
DROP POLICY IF EXISTS "Public access to patients" ON public.patients;
DROP POLICY IF EXISTS "Public access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Doctor access to patients" ON public.patients;
DROP POLICY IF EXISTS "Doctor access to appointments" ON public.appointments;

-- Allow ONLY authenticated users (logged-in doctor) full CRUD access
CREATE POLICY "Doctor access to patients" ON public.patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Doctor access to appointments" ON public.appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
