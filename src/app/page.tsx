"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Patient, Gender, calculateDebt, PatientHistoryEntry } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { Appointment, AppointmentStatus } from "@/types/appointment";

import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { PatientTable } from "@/components/PatientTable";
import { PatientCard } from "@/components/PatientCard";
import { AddPatientModal } from "@/components/AddPatientModal";
import { EditPatientModal } from "@/components/EditPatientModal";
import { PatientHistoryModal } from "@/components/PatientHistoryModal";
import { DentalChartModal } from "@/components/dental/DentalChartModal";
import { AppointmentsView } from "@/components/appointments/AppointmentsView";
import { MonthlyReportView } from "@/components/MonthlyReportView";
import {
  Search,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  UserPlus,
  Filter,
  Calendar,
} from "lucide-react";

import {
  fetchPatientsFromDB,
  upsertPatientToDB,
  deletePatientFromDB,
  fetchAppointmentsFromDB,
  upsertAppointmentToDB,
  deleteAppointmentFromDB,
} from "@/utils/supabase/db";
import { createClient } from "@/utils/supabase/client";
import { LoginScreen } from "@/components/LoginScreen";



export default function DashboardPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<"patients" | "appointments" | "reports">("patients");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [dentalPatient, setDentalPatient] = useState<Patient | null>(null);

  // Patients filters
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | Gender>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "debt">("all");
  const [monthFilter, setMonthFilter] = useState<string>("all"); // 'all' or 'YYYY-MM'
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // 'desc' = newest first
  const [notification, setNotification] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  // Check persistent session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(Boolean(session));
      setSessionChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Load from Supabase when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const [dbPatients, dbApts] = await Promise.all([
          fetchPatientsFromDB(),
          fetchAppointmentsFromDB(),
        ]);
        setPatients(dbPatients);
        setAppointments(dbApts);
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  // Seed dummy data for demo / testing
  const seedDummyData = async () => {
    const dummyPatients: Omit<Patient, "id">[] = [
      {
        name: "Zainab Ali",
        gender: "female" as const,
        age: 32,
        phone: "07701234567",
        date: "2026-09-15",
        totalAmount: 75000,
        paidAmount: 75000,
        debtAmount: 0,
        notes: "Composite filling on upper molar",
        history: [
          { id: "dh1", date: "2026-09-15", title: "Composite Filling", notes: "Upper right molar #16", fee: 0, paid: 75000, debt: 0, createdAt: Date.now() },
        ],
      },
      {
        name: "Omar Hassan",
        gender: "male" as const,
        age: 45,
        phone: "07809876543",
        date: "2026-09-20",
        totalAmount: 250000,
        paidAmount: 150000,
        debtAmount: 100000,
        notes: "Root canal treatment, 2 sessions remaining",
        history: [
          { id: "dh2", date: "2026-09-20", title: "Root Canal Session 1", notes: "Lower left molar #36 — pulp removal", fee: 0, paid: 150000, debt: 100000, createdAt: Date.now() },
        ],
      },
      {
        name: "Sara Mohammed",
        gender: "female" as const,
        age: 28,
        phone: "07501112233",
        date: "2026-08-10",
        totalAmount: 50000,
        paidAmount: 50000,
        debtAmount: 0,
        notes: "Routine scaling and polishing",
        history: [
          { id: "dh3", date: "2026-08-10", title: "Scaling & Polishing", notes: "Full mouth cleaning", fee: 0, paid: 50000, debt: 0, createdAt: Date.now() },
        ],
      },
      {
        name: "Ali Karim",
        gender: "male" as const,
        age: 55,
        phone: "07711223344",
        date: "2026-08-25",
        totalAmount: 500000,
        paidAmount: 300000,
        debtAmount: 200000,
        notes: "Full upper denture",
        history: [
          { id: "dh4a", date: "2026-08-05", title: "Impression & Measurements", notes: "Upper jaw impression taken", fee: 0, paid: 100000, debt: 0, createdAt: Date.now() },
          { id: "dh4b", date: "2026-08-25", title: "Denture Fitting", notes: "Full upper denture delivered — minor adjustments", fee: 0, paid: 200000, debt: 200000, createdAt: Date.now() },
        ],
      },
      {
        name: "Fatima Nouri",
        gender: "female" as const,
        age: 38,
        phone: "07601234500",
        date: "2026-07-18",
        totalAmount: 120000,
        paidAmount: 120000,
        debtAmount: 0,
        notes: "Extraction + post-op",
        history: [
          { id: "dh5", date: "2026-07-18", title: "Wisdom Tooth Extraction", notes: "Lower right #48, surgical extraction under local anaesthesia", fee: 0, paid: 120000, debt: 0, createdAt: Date.now() },
        ],
      },
      {
        name: "Hussein Saleh",
        gender: "male" as const,
        age: 22,
        phone: "07901234567",
        date: "2026-07-05",
        totalAmount: 35000,
        paidAmount: 25000,
        debtAmount: 10000,
        notes: "Checkup + small filling",
        history: [
          { id: "dh6", date: "2026-07-05", title: "Checkup & Small Filling", notes: "Upper premolar #25", fee: 0, paid: 25000, debt: 10000, createdAt: Date.now() },
        ],
      },
    ];

    for (const data of dummyPatients) {
      await handleAddPatient(data);
    }
    showToast(`Seeded ${dummyPatients.length} demo patients across 3 months`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  // Patient CRUD
  const handleAddPatient = async (data: Omit<Patient, "id">) => {
    const now = Date.now();
    const patientId = `pat-${now}-${Math.random().toString(36).substring(2, 6)}`;

    // Auto-create an initial history entry from the patient's first visit data
    const initialEntry: PatientHistoryEntry = {
      id: `hist-${now}-${Math.random().toString(36).substring(2, 6)}`,
      date: data.date,
      title: "Initial Visit",
      notes: data.notes || "",
      fee: 0,
      paid: data.paidAmount ?? 0,
      debt: data.debtAmount ?? 0,
      createdAt: now,
    };

    const newPatient: Patient = {
      ...data,
      id: patientId,
      history: [initialEntry, ...(data.history || [])],
      createdAt: now,
    };
    setPatients((prev) => [newPatient, ...prev]);
    showToast(`Added case for "${newPatient.name}"`);

    try {
      await upsertPatientToDB(newPatient);
    } catch (e) {
      console.error("Failed to save patient to Supabase:", e);
      showToast("⚠️ Failed to save to cloud");
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === updatedPatient.id ? updatedPatient : p))
    );
    showToast(`Updated case for "${updatedPatient.name}"`);
    setEditingPatient(null);

    try {
      await upsertPatientToDB(updatedPatient);
    } catch (e) {
      console.error("Failed to update patient in Supabase:", e);
      showToast("⚠️ Failed to save to cloud");
    }
  };

  const handleDeletePatient = async (id: string) => {
    const target = patients.find((p) => p.id === id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    if (target) {
      showToast(`Removed case for "${target.name}"`);
    }

    try {
      await deletePatientFromDB(id);
    } catch (e) {
      console.error("Failed to delete patient from Supabase:", e);
      showToast("⚠️ Failed to delete from cloud");
    }
  };

  const handleAddHistoryEntry = async (
    patientId: string,
    entry: Omit<PatientHistoryEntry, "id" | "createdAt">
  ) => {
    const newEntry: PatientHistoryEntry = {
      ...entry,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    let targetUpdatedPatient: Patient | null = null;
    const updated = patients.map((p) => {
      if (p.id !== patientId) return p;
      const history = [newEntry, ...(p.history || [])];
      const paidAmount = (p.paidAmount ?? 0) + (entry.paid ?? 0);
      const debtAmount = (p.debtAmount ?? 0) + (entry.debt ?? 0);
      const totalAmount = paidAmount + debtAmount;
      const isNewer = !p.date || entry.date >= p.date;

      const updatedPatient: Patient = {
        ...p,
        date: isNewer ? entry.date : p.date,
        totalAmount,
        paidAmount,
        debtAmount,
        history,
      };
      targetUpdatedPatient = updatedPatient;
      setHistoryPatient(updatedPatient);
      return updatedPatient;
    });

    setPatients(updated);
    showToast("Logged new consultation in patient history");

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.error("Failed to save history to Supabase:", e);
        showToast("⚠️ Failed to save to cloud");
      }
    }
  };

  const handleDeleteHistoryEntry = async (patientId: string, entryId: string) => {
    let targetUpdatedPatient: Patient | null = null;
    const updated = patients.map((p) => {
      if (p.id !== patientId) return p;
      const history = (p.history || []).filter((h) => h.id !== entryId);
      const updatedPatient: Patient = { ...p, history };
      targetUpdatedPatient = updatedPatient;
      setHistoryPatient(updatedPatient);
      return updatedPatient;
    });

    setPatients(updated);
    showToast("Removed history record");

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.error("Failed to delete history from Supabase:", e);
        showToast("⚠️ Failed to save to cloud");
      }
    }
  };

  const handleUpdateHistoryEntry = async (
    patientId: string,
    entryId: string,
    entryData: Omit<PatientHistoryEntry, "id" | "createdAt">
  ) => {
    let targetUpdatedPatient: Patient | null = null;
    const updated = patients.map((p) => {
      if (p.id !== patientId) return p;
      const history = (p.history || []).map((h) => {
        if (h.id !== entryId) return h;
        return {
          ...h,
          ...entryData,
        };
      });

      // Recalculate totals across all history items
      const historyPaid = history.reduce((sum, h) => sum + (h.paid || 0), 0);
      const historyDebt = history.reduce((sum, h) => sum + (h.debt || 0), 0);

      // Keep latest date if exists
      const sortedHistory = [...history].sort((a, b) =>
        (b.date || "").localeCompare(a.date || "")
      );
      const latestDate = sortedHistory[0]?.date || p.date;

      const updatedPatient: Patient = {
        ...p,
        date: latestDate,
        paidAmount: historyPaid > 0 ? historyPaid : p.paidAmount,
        debtAmount: historyDebt > 0 ? historyDebt : p.debtAmount,
        totalAmount: (historyPaid > 0 ? historyPaid : (p.paidAmount ?? 0)) + (historyDebt > 0 ? historyDebt : (p.debtAmount ?? 0)),
        history,
      };

      targetUpdatedPatient = updatedPatient;
      setHistoryPatient(updatedPatient);
      return updatedPatient;
    });

    setPatients(updated);
    showToast("Updated visit record in Supabase");

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.error("Failed to update history in Supabase:", e);
        showToast("⚠️ Failed to save to cloud");
      }
    }
  };

  const handleSaveTeeth = async (patientId: string, teeth: ToothRecord[]) => {
    let targetUpdatedPatient: Patient | null = null;
    const updated = patients.map((p) => {
      if (p.id === patientId) {
        targetUpdatedPatient = { ...p, teeth };
        return targetUpdatedPatient;
      }
      return p;
    });

    setPatients(updated);
    setDentalPatient((prev) => (prev && prev.id === patientId ? { ...prev, teeth } : prev));

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.error("Failed to save dental chart to Supabase:", e);
        showToast("⚠️ Failed to save to cloud");
      }
    }
  };

  // Appointment CRUD
  const handleAddAppointment = async (data: Omit<Appointment, "id" | "createdAt">) => {
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    showToast(`Booked appointment for "${newApt.patientName}"`);

    try {
      await upsertAppointmentToDB(newApt);
    } catch (e) {
      console.error("Failed to save appointment to Supabase:", e);
      showToast("⚠️ Failed to save to cloud");
    }
  };

  const handleToggleAppointmentStatus = async (
    id: string,
    newStatus: AppointmentStatus
  ) => {
    let targetApt: Appointment | null = null;
    const updated = appointments.map((a) => {
      if (a.id === id) {
        targetApt = { ...a, status: newStatus };
        return targetApt;
      }
      return a;
    });
    setAppointments(updated);
    showToast("Appointment status updated");

    if (targetApt) {
      try {
        await upsertAppointmentToDB(targetApt);
      } catch (e) {
        console.error("Failed to update appointment in Supabase:", e);
        showToast("⚠️ Failed to save to cloud");
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const target = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    if (target) {
      showToast(`Removed appointment for "${target.patientName}"`);
    }

    try {
      await deleteAppointmentFromDB(id);
    } catch (e) {
      console.error("Failed to delete appointment from Supabase:", e);
      showToast("⚠️ Failed to delete from cloud");
    }
  };

  // Extract available months from patient dates and history entries
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    patients.forEach((p) => {
      if (p.date && p.date.length >= 7) {
        set.add(p.date.substring(0, 7)); // 'YYYY-MM'
      }
      p.history?.forEach((h) => {
        if (h.date && h.date.length >= 7) {
          set.add(h.date.substring(0, 7));
        }
      });
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [patients]);

  const formatMonthName = (yearMonth: string) => {
    try {
      const [year, month] = yearMonth.split("-");
      const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      return yearMonth;
    }
  };

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    return patients
      .filter((patient) => {
        const matchesSearch =
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (patient.notes &&
            patient.notes.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesGender =
          genderFilter === "all" || patient.gender === genderFilter;

        const debt = calculateDebt(
          patient.totalAmount,
          patient.paidAmount,
          patient.debtAmount
        );
        const matchesPayment =
          paymentFilter === "all" ||
          (paymentFilter === "paid" && debt === 0) ||
          (paymentFilter === "debt" && debt > 0);

        // Filter by month: matches if patient date starts with selected YYYY-MM
        // or if patient has any history/bill entry in that month
        const matchesMonth =
          monthFilter === "all" ||
          (patient.date && patient.date.startsWith(monthFilter)) ||
          patient.history?.some((h) => h.date && h.date.startsWith(monthFilter));

        return matchesSearch && matchesGender && matchesPayment && matchesMonth;
      })
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (sortOrder === "desc") {
          return dateB.localeCompare(dateA);
        } else {
          return dateA.localeCompare(dateB);
        }
      });
  }, [patients, searchQuery, genderFilter, paymentFilter, monthFilter, sortOrder]);

  // Show loading splash while checking local stored session
  if (!sessionChecked) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl shadow-xl shadow-indigo-600/30 animate-pulse mb-3">
          🦷
        </div>
        <p className="text-xs text-slate-400 font-medium">Verifying clinic session...</p>
      </div>
    );
  }

  // If not logged in, show Dr. Qayssar Login Screen
  if (!isAuthenticated) {
    return <LoginScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Sleek Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={() => setIsModalOpen(true)}
        patientCount={patients.length}
        appointmentCount={appointments.length}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 w-full px-3 sm:px-6 xl:px-10 py-4 sm:py-8">
        {activeTab === "appointments" ? (
          /* ================= APPOINTMENTS FULL MONTH TAB ================= */
          <AppointmentsView
            appointments={appointments}
            patients={patients}
            onAddAppointment={handleAddAppointment}
            onToggleStatus={handleToggleAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
          />
        ) : activeTab === "reports" ? (
          /* ================= MONTHLY REPORTS TAB ================= */
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Monthly Financial Reports</h2>
              {patients.length === 0 && (
                <button
                  onClick={seedDummyData}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm cursor-pointer transition-colors"
                >
                  + Load Demo Data
                </button>
              )}
            </div>
            <MonthlyReportView
              patients={patients}
              onViewHistory={(patient) => setHistoryPatient(patient)}
            />
          </>
        ) : (
          /* ================= PATIENTS CASES TAB ================= */
          <>
            {/* Quick Stats Overview (updates when month is filtered to show monthly collection & debts) */}
            <StatsOverview
              patients={monthFilter === "all" ? patients : filteredAndSortedPatients}
              monthSubtitle={monthFilter === "all" ? undefined : formatMonthName(monthFilter)}
            />

            {/* Filter and Control Toolbar (Mobile-first) */}
            <div className="mb-4 sm:mb-6 flex flex-col md:flex-row gap-2.5 sm:gap-3 md:items-center md:justify-between">
              {/* Left: Search input */}
              <div className="relative flex-1 max-w-full md:max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search patient name, phone, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-base sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs transition-all"
                />
              </div>

              {/* Right: Horizontally swipeable filter chips on mobile */}
              <div className="overflow-x-auto no-scrollbar flex items-center gap-2 pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
                {/* Gender Filters */}
                <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900 shadow-xs flex-shrink-0">
                  <button
                    onClick={() => setGenderFilter("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      genderFilter === "all"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setGenderFilter("male")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      genderFilter === "male"
                        ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>♂</span>
                    <span>Male</span>
                  </button>
                  <button
                    onClick={() => setGenderFilter("female")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      genderFilter === "female"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>♀</span>
                    <span>Female</span>
                  </button>
                </div>

                {/* Payment & Debt Filter */}
                <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900 shadow-xs flex-shrink-0">
                  <button
                    onClick={() => setPaymentFilter("all")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      paymentFilter === "all"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    All Fees
                  </button>
                  <button
                    onClick={() => setPaymentFilter("paid")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      paymentFilter === "paid"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>✓</span>
                    <span>Paid</span>
                  </button>
                  <button
                    onClick={() => setPaymentFilter("debt")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      paymentFilter === "debt"
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>Debts</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold">
                      {
                        patients.filter(
                          (p) =>
                            calculateDebt(
                              p.totalAmount,
                              p.paidAmount,
                              p.debtAmount
                            ) > 0
                        ).length
                      }
                    </span>
                  </button>
                </div>

                {/* Month / Billing Month Filter */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <label htmlFor="month-select" className="sr-only">Filter by Month</label>
                  <select
                    id="month-select"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all">All Months</option>
                    {availableMonths.map((ym) => (
                      <option key={ym} value={ym} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
                        {formatMonthName(ym)}
                      </option>
                    ))}
                  </select>
                  {monthFilter !== "all" && (
                    <button
                      onClick={() => setMonthFilter("all")}
                      title="Clear month filter"
                      className="ml-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold leading-none cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Sort toggle */}
                <button
                  onClick={() =>
                    setSortOrder((curr) => (curr === "desc" ? "asc" : "desc"))
                  }
                  title={`Sorted: ${
                    sortOrder === "desc" ? "Newest First" : "Oldest First"
                  }`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-xs transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {sortOrder === "desc" ? "Newest" : "Oldest"}
                  </span>
                </button>

                {/* Table / Grid view switcher (desktop only) */}
                <div className="hidden sm:inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900 shadow-xs flex-shrink-0">
                  <button
                    onClick={() => setViewMode("table")}
                    aria-label="Table view"
                    title="Table view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "table"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                    title="Card grid view"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Patients Content Section */}
            {filteredAndSortedPatients.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  No matching patient cases
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                  {searchQuery || genderFilter !== "all" || paymentFilter !== "all" || monthFilter !== "all"
                    ? "Try clearing your filters or changing your search terms to see other patients."
                    : "No patient cases have been added yet. Click below to create your first patient case file."}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {searchQuery || genderFilter !== "all" || paymentFilter !== "all" || monthFilter !== "all" ? (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setGenderFilter("all");
                        setPaymentFilter("all");
                        setMonthFilter("all");
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Add Patient</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                {viewMode === "table" ? (
                  <div className="hidden sm:block">
                    <PatientTable
                      patients={filteredAndSortedPatients}
                      onDeletePatient={handleDeletePatient}
                      onEditPatient={(patient) => setEditingPatient(patient)}
                      onViewHistory={(patient) => setHistoryPatient(patient)}
                      onOpenDentalChart={(patient) => setDentalPatient(patient)}
                    />
                  </div>
                ) : null}

                {/* Grid / Card View */}
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
                    viewMode === "table" ? "sm:hidden" : ""
                  }`}
                >
                  {filteredAndSortedPatients.map((patient) => (
                    <PatientCard
                      key={patient.id}
                      patient={patient}
                      onDeletePatient={handleDeletePatient}
                      onEditPatient={(patient) => setEditingPatient(patient)}
                      onViewHistory={(patient) => setHistoryPatient(patient)}
                      onOpenDentalChart={(patient) => setDentalPatient(patient)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {filteredAndSortedPatients.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {patients.length}
                </span>{" "}
                patient cases (sorted newest first)
              </div>
            </footer>
          </>
        )}

        {/* Mobile Floating Action Button (FAB) for Adding Patient */}
        {activeTab === "patients" && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="sm:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-600/35 active:scale-95 transition-all cursor-pointer"
            aria-label="Add new patient"
          >
            <UserPlus className="w-5 h-5 stroke-[2.2]" />
            <span className="text-xs font-bold">Add Patient</span>
          </button>
        )}
      </main>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddPatient={handleAddPatient}
      />

      {/* Edit Patient Modal */}
      <EditPatientModal
        isOpen={Boolean(editingPatient)}
        patient={editingPatient}
        onClose={() => setEditingPatient(null)}
        onUpdatePatient={handleUpdatePatient}
      />

      {/* Patient History Modal */}
      <PatientHistoryModal
        isOpen={Boolean(historyPatient)}
        patient={historyPatient}
        onClose={() => setHistoryPatient(null)}
        onAddHistoryEntry={handleAddHistoryEntry}
        onUpdateHistoryEntry={handleUpdateHistoryEntry}
        onDeleteHistoryEntry={handleDeleteHistoryEntry}
      />

      {/* 3D Dental Chart Modal */}
      <DentalChartModal
        isOpen={Boolean(dentalPatient)}
        patient={dentalPatient}
        onClose={() => setDentalPatient(null)}
        onSaveTeeth={handleSaveTeeth}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-2xl border border-slate-700 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}
    </div>
  );
}
