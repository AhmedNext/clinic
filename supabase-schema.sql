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
-- 3. ENABLE ROW LEVEL SECURITY & OPEN READ/WRITE FOR ANON
-- ========================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow public read/write with anon key
DROP POLICY IF EXISTS "Public access to patients" ON public.patients;
CREATE POLICY "Public access to patients" ON public.patients
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to appointments" ON public.appointments;
CREATE POLICY "Public access to appointments" ON public.appointments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ========================================================
-- 4. CLINIC MATERIALS & INVENTORY TABLE
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

ALTER TABLE public.clinic_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to clinic_materials" ON public.clinic_materials;
CREATE POLICY "Public access to clinic_materials" ON public.clinic_materials
  FOR ALL
  USING (true)
  WITH CHECK (true);
