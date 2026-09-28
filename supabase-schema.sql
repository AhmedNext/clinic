-- ========================================================
-- 1. PATIENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
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

-- ========================================================
-- 2. APPOINTMENTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
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

-- ========================================================
-- 3. CLINIC MATERIALS & INVENTORY TABLE (Includes Clinic Rent)
-- ========================================================
CREATE TABLE IF NOT EXISTS public.clinic_materials (
  id TEXT PRIMARY KEY,
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

-- ========================================================
-- 4. ENABLE ROW LEVEL SECURITY & RESTRICT TO AUTHENTICATED USERS
-- ========================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_materials ENABLE ROW LEVEL SECURITY;

-- Drop legacy/insecure public policies
DROP POLICY IF EXISTS "Public access to patients" ON public.patients;
DROP POLICY IF EXISTS "Public access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public access to clinic_materials" ON public.clinic_materials;

-- Allow ONLY authenticated users (logged-in clinic account) full access
DROP POLICY IF EXISTS "Allow authenticated users full access to patients" ON public.patients;
CREATE POLICY "Allow authenticated users full access to patients"
  ON public.patients
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users full access to appointments" ON public.appointments;
CREATE POLICY "Allow authenticated users full access to appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated users full access to clinic_materials" ON public.clinic_materials;
CREATE POLICY "Allow authenticated users full access to clinic_materials"
  ON public.clinic_materials
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Revoke all permissions from anon role and grant to authenticated
REVOKE ALL ON public.patients FROM anon;
REVOKE ALL ON public.appointments FROM anon;
REVOKE ALL ON public.clinic_materials FROM anon;

GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.appointments TO authenticated;
GRANT ALL ON public.clinic_materials TO authenticated;
