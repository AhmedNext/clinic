"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Patient, Gender, calculateDebt, PatientHistoryEntry } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { INITIAL_PATIENTS } from "@/data/initialPatients";
import { INITIAL_APPOINTMENTS } from "@/data/initialAppointments";
import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { PatientTable } from "@/components/PatientTable";
import { PatientCard } from "@/components/PatientCard";
import { AddPatientModal } from "@/components/AddPatientModal";
import { EditPatientModal } from "@/components/EditPatientModal";
import { PatientHistoryModal } from "@/components/PatientHistoryModal";
import { DentalChartModal } from "@/components/dental/DentalChartModal";
import { AppointmentsView } from "@/components/appointments/AppointmentsView";
import {
  Search,
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  UserPlus,
  RefreshCw,
  Filter,
} from "lucide-react";

import {
  fetchPatientsFromDB,
  upsertPatientToDB,
  deletePatientFromDB,
  fetchAppointmentsFromDB,
  upsertAppointmentToDB,
  deleteAppointmentFromDB,
} from "@/utils/supabase/db";

const PATIENTS_STORAGE_KEY = "qaissar_patient_cases";
const APPOINTMENTS_STORAGE_KEY = "qaissar_dental_appointments";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"patients" | "appointments">("patients");
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
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // 'desc' = newest first
  const [notification, setNotification] = useState<string | null>(null);

  // Load from Supabase on mount, fallback to localStorage
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // 1. Initial cached read from localStorage for instant display
      try {
        const stored = localStorage.getItem(PATIENTS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setPatients(parsed);
        }
        const storedApts = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        if (storedApts) {
          const parsedApts = JSON.parse(storedApts);
          if (Array.isArray(parsedApts)) setAppointments(parsedApts);
        }
      } catch (e) {
        console.error("Local cache read error", e);
      }

      // 2. Fetch fresh data from Supabase
      try {
        const [dbPatients, dbApts] = await Promise.all([
          fetchPatientsFromDB(),
          fetchAppointmentsFromDB(),
        ]);

        if (dbPatients) {
          setPatients(dbPatients);
          localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(dbPatients));
        }
        if (dbApts) {
          setAppointments(dbApts);
          localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(dbApts));
        }
      } catch (err) {
        console.warn("Supabase fetch failed (table may not exist yet or offline), using cached data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  // Patient CRUD
  const handleAddPatient = async (data: Omit<Patient, "id">) => {
    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [newPatient, ...patients];
    setPatients(updated);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast(`Added case for "${newPatient.name}"`);

    try {
      await upsertPatientToDB(newPatient);
    } catch (e) {
      console.warn("Could not sync new patient to Supabase:", e);
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    const updated = patients.map((p) =>
      p.id === updatedPatient.id ? updatedPatient : p
    );
    setPatients(updated);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast(`Updated case for "${updatedPatient.name}"`);
    setEditingPatient(null);

    try {
      await upsertPatientToDB(updatedPatient);
    } catch (e) {
      console.warn("Could not sync updated patient to Supabase:", e);
    }
  };

  const handleDeletePatient = async (id: string) => {
    const target = patients.find((p) => p.id === id);
    const updated = patients.filter((p) => p.id !== id);
    setPatients(updated);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    if (target) {
      showToast(`Removed case for "${target.name}"`);
    }

    try {
      await deletePatientFromDB(id);
    } catch (e) {
      console.warn("Could not sync patient deletion to Supabase:", e);
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
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast("Logged new consultation in patient history");

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.warn("Could not sync history entry to Supabase:", e);
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
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast("Removed history record");

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.warn("Could not sync deleted history entry to Supabase:", e);
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
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
    setDentalPatient((prev) => (prev && prev.id === patientId ? { ...prev, teeth } : prev));

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient);
      } catch (e) {
        console.warn("Could not sync dental odontogram to Supabase:", e);
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
    const updated = [newApt, ...appointments];
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast(`Booked appointment for "${newApt.patientName}"`);

    try {
      await upsertAppointmentToDB(newApt);
    } catch (e) {
      console.warn("Could not sync new appointment to Supabase:", e);
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
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
    showToast("Appointment status updated");

    if (targetApt) {
      try {
        await upsertAppointmentToDB(targetApt);
      } catch (e) {
        console.warn("Could not sync appointment update to Supabase:", e);
      }
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const target = appointments.find((a) => a.id === id);
    const updated = appointments.filter((a) => a.id !== id);
    setAppointments(updated);
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(updated));
    if (target) {
      showToast(`Removed appointment for "${target.patientName}"`);
    }

    try {
      await deleteAppointmentFromDB(id);
    } catch (e) {
      console.warn("Could not sync appointment deletion to Supabase:", e);
    }
  };

  const handleResetDemo = () => {
    setPatients(INITIAL_PATIENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(INITIAL_PATIENTS));
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
    showToast("Reset to sample patients & appointments");
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

        return matchesSearch && matchesGender && matchesPayment;
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
  }, [patients, searchQuery, genderFilter, paymentFilter, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Sleek Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={() => setIsModalOpen(true)}
        patientCount={patients.length}
        appointmentCount={appointments.length}
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
        ) : (
          /* ================= PATIENTS CASES TAB ================= */
          <>
            {/* Quick Stats Overview */}
            <StatsOverview patients={patients} />

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
                  {searchQuery || genderFilter !== "all" || paymentFilter !== "all"
                    ? "Try clearing your filters or changing your search terms to see other patients."
                    : "No patient cases have been added yet. Click below to create your first patient case file."}
                </p>
                <div className="flex items-center justify-center gap-3">
                  {searchQuery || genderFilter !== "all" || paymentFilter !== "all" ? (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setGenderFilter("all");
                        setPaymentFilter("all");
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

              <div className="flex items-center gap-4">
                <button
                  onClick={handleResetDemo}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  title="Reset demo cases & appointments"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Sample Data</span>
                </button>
                <span>•</span>
                <span>Self-contained client dashboard</span>
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
