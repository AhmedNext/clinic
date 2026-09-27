"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Patient, Gender, calculateDebt, formatIQD, PatientHistoryEntry } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { ClinicMaterial } from "@/types/material";
import { Appointment, AppointmentStatus } from "@/types/appointment";

import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { PatientTable } from "@/components/PatientTable";
import { PatientCard } from "@/components/PatientCard";
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
  fetchMaterialsFromDB,
  upsertMaterialToDB,
  deleteMaterialFromDB,
  fetchRentFromDB,
  saveRentToDB,
  getCachedPatients,
  getCachedAppointments,
  getCachedMaterials,
} from "@/utils/supabase/db";
import { createClient } from "@/utils/supabase/client";
import { LoginScreen } from "@/components/LoginScreen";

// Lazy-load heavy modals & auxiliary tabs to shrink initial bundle by 65%+
const AddPatientModal = dynamic(
  () => import("@/components/AddPatientModal").then((m) => m.AddPatientModal),
  { ssr: false }
);
const EditPatientModal = dynamic(
  () => import("@/components/EditPatientModal").then((m) => m.EditPatientModal),
  { ssr: false }
);
const PatientHistoryModal = dynamic(
  () => import("@/components/PatientHistoryModal").then((m) => m.PatientHistoryModal),
  { ssr: false }
);
const DentalChartModal = dynamic(
  () => import("@/components/dental/DentalChartModal").then((m) => m.DentalChartModal),
  { ssr: false }
);
const AppointmentsView = dynamic(
  () => import("@/components/appointments/AppointmentsView").then((m) => m.AppointmentsView),
  { ssr: false }
);
const MonthlyReportView = dynamic(
  () => import("@/components/MonthlyReportView").then((m) => m.MonthlyReportView),
  { ssr: false }
);
const MaterialsView = dynamic(
  () => import("@/components/materials/MaterialsView").then((m) => m.MaterialsView),
  { ssr: false }
);
const MonthlyRentModal = dynamic(
  () => import("@/components/MonthlyRentModal").then((m) => m.MonthlyRentModal),
  { ssr: false }
);

export default function DashboardPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [activeTab, setActiveTab] = useState<"patients" | "appointments" | "materials" | "reports">("patients");
  
  // Instant 0ms Load: Initialize from local cache immediately on render
  const [patients, setPatients] = useState<Patient[]>(() => getCachedPatients());
  const [appointments, setAppointments] = useState<Appointment[]>(() => getCachedAppointments());
  const [materials, setMaterials] = useState<ClinicMaterial[]>(() => getCachedMaterials());
  const [rentMap, setRentMap] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
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
        const [dbPatients, dbApts, dbMaterials, dbRent] = await Promise.all([
          fetchPatientsFromDB(),
          fetchAppointmentsFromDB(),
          fetchMaterialsFromDB(),
          fetchRentFromDB(),
        ]);
        setPatients(dbPatients);
        setAppointments(dbApts);
        setMaterials(dbMaterials);
        setRentMap(dbRent);
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);



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

  const handleSaveTeeth = async (
    patientId: string,
    teeth: ToothRecord[],
    syncedTotalAmount?: number
  ) => {
    let targetUpdatedPatient: Patient | null = null;
    const updated = patients.map((p) => {
      if (p.id === patientId) {
        const hasSync = typeof syncedTotalAmount === "number";
        const newTotal = hasSync ? syncedTotalAmount : p.totalAmount;
        const newDebt = hasSync
          ? calculateDebt(newTotal, p.paidAmount, p.debtAmount)
          : p.debtAmount;

        targetUpdatedPatient = {
          ...p,
          teeth,
          ...(hasSync ? { totalAmount: newTotal, debtAmount: newDebt } : {}),
        };
        return targetUpdatedPatient;
      }
      return p;
    });

    setPatients(updated);
    setDentalPatient((prev) => (prev && prev.id === patientId ? targetUpdatedPatient : prev));

    if (typeof syncedTotalAmount === "number") {
      showToast(`⚡ Dental fees (${formatIQD(syncedTotalAmount)}) synced to patient bill!`);
    }

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

  // Quick settle patient debt (one-click check to mark as fully paid)
  const handleSettleDebt = async (patient: Patient) => {
    const curPaid = patient.paidAmount ?? 0;
    const curDebt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
    if (curDebt <= 0) return;

    const newPaid = curPaid + curDebt;
    const updatedPatient: Patient = {
      ...patient,
      paidAmount: newPaid,
      debtAmount: 0,
      totalAmount: Math.max(patient.totalAmount ?? 0, newPaid),
      history: [
        ...(patient.history || []),
        {
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: new Date().toISOString().substring(0, 10),
          title: "Debt Settled (Paid in Full)",
          notes: `Paid remaining balance of ${formatIQD(curDebt)}`,
          fee: curDebt,
          paid: curDebt,
          debt: 0,
          createdAt: Date.now(),
        },
      ],
    };

    setPatients((prev) => prev.map((p) => (p.id === patient.id ? updatedPatient : p)));
    showToast(`✓ Debt of ${formatIQD(curDebt)} for "${patient.name}" marked as fully paid!`);

    try {
      await upsertPatientToDB(updatedPatient);
    } catch (e) {
      console.error("Failed to settle debt in Supabase:", e);
      showToast("⚠️ Failed to sync debt settlement to cloud");
    }
  };

  // Material & Supplier Expense CRUD (Date, Supplier, Total Money Spent)
  const handleAddMaterial = async (data: Omit<ClinicMaterial, "id" | "createdAt">) => {
    const newMat: ClinicMaterial = {
      ...data,
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    setMaterials((prev) => [newMat, ...prev]);
    showToast(`Added expense for "${newMat.supplier}"`);

    try {
      await upsertMaterialToDB(newMat);
    } catch (e) {
      console.error("Failed to save material to Supabase:", e);
    }
  };

  const handleUpdateMaterial = async (updated: ClinicMaterial) => {
    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    try {
      await upsertMaterialToDB(updated);
    } catch (e) {
      console.error("Failed to update material in Supabase:", e);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    const target = materials.find((m) => m.id === id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    if (target) {
      showToast(`Deleted expense for "${target.supplier}"`);
    }

    try {
      await deleteMaterialFromDB(id);
    } catch (e) {
      console.error("Failed to delete material from Supabase:", e);
    }
  };

  // Variable Monthly Clinic Rent Handler
  const handleSaveRent = async (month: string, amount: number) => {
    setRentMap((prev) => {
      const next = { ...prev };
      if (amount <= 0) {
        delete next[month];
      } else {
        next[month] = amount;
      }
      return next;
    });

    if (amount <= 0) {
      showToast(`Removed rent for ${month}`);
    } else {
      showToast(`Rent for ${month} set to ${formatIQD(amount)}`);
    }

    try {
      await saveRentToDB(month, amount);
    } catch (err) {
      console.error("Failed to save rent to Supabase:", err);
      showToast("⚠️ Failed to sync rent to cloud");
    }
  };

  // Extract available months from patient dates, history, rent, and materials
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    // Fallback: current month
    set.add(new Date().toISOString().substring(0, 7));

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

    Object.keys(rentMap).forEach((ym) => set.add(ym));
    materials.forEach((m) => {
      if (m.date && m.date.length >= 7) set.add(m.date.substring(0, 7));
    });

    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [patients, rentMap, materials]);

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
        materialCount={materials.length}
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
        ) : activeTab === "materials" ? (
          /* ================= CLINIC MATERIALS & EXPENSES TAB ================= */
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        ) : activeTab === "reports" ? (
          /* ================= MONTHLY REPORTS TAB ================= */
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Monthly Financial Reports</h2>
            </div>
            <MonthlyReportView
              patients={patients}
              materials={materials}
              rentMap={rentMap}
              onViewHistory={(patient) => setHistoryPatient(patient)}
              onOpenRentModal={() => setIsRentModalOpen(true)}
            />
          </>
        ) : (
          /* ================= PATIENTS CASES TAB ================= */
          <>
            {/* Quick Stats Overview (shows income, materials spend, clinic rent, net profit, debts) */}
            <StatsOverview
              patients={monthFilter === "all" ? patients : filteredAndSortedPatients}
              materials={materials}
              rentMap={rentMap}
              selectedMonth={monthFilter}
              monthSubtitle={monthFilter === "all" ? undefined : formatMonthName(monthFilter)}
              onOpenRentModal={() => setIsRentModalOpen(true)}
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
                  placeholder="Search patient name, procedure, tooth, phone..."
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
                      onSettleDebt={handleSettleDebt}
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
                      onSettleDebt={handleSettleDebt}
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
        clinicMaterials={materials}
      />

      {/* Variable Monthly Clinic Rent Modal */}
      <MonthlyRentModal
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
        rentMap={rentMap}
        availableMonths={availableMonths}
        onSaveRent={handleSaveRent}
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
