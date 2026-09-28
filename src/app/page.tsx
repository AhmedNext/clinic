"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { ClinicLogo } from "@/components/ClinicLogo";
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
  CalendarClock,
  Users,
  Package,
  TrendingUp,
  RotateCcw,
  Trash2,
  X,
  Database,
} from "lucide-react";

import {
  fetchPatientsFromDB,
  upsertPatientToDB,
  batchUpsertPatientsToDB,
  deletePatientFromDB,
  fetchAppointmentsFromDB,
  upsertAppointmentToDB,
  deleteAppointmentFromDB,
  fetchMaterialsFromDB,
  upsertMaterialToDB,
  deleteMaterialFromDB,
  getCachedPatients,
  getCachedAppointments,
  getCachedMaterials,
} from "@/utils/supabase/db";
import { createClient } from "@/utils/supabase/client";
import { LoginScreen } from "@/components/LoginScreen";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { formatMonthName as formatStaticMonthName } from "@/utils/date";

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
const StaffModal = dynamic(
  () => import("@/components/StaffModal").then((m) => m.StaffModal),
  { ssr: false }
);
const ClinicSettingsModal = dynamic(
  () => import("@/components/ClinicSettingsModal").then((m) => m.ClinicSettingsModal),
  { ssr: false }
);
const SetPasswordModal = dynamic(
  () => import("@/components/SetPasswordModal").then((m) => m.SetPasswordModal),
  { ssr: false }
);
const PrintReceiptModal = dynamic(
  () => import("@/components/print/PrintReceiptModal").then((m) => m.PrintReceiptModal),
  { ssr: false }
);
const DentalPrescriptionModal = dynamic(
  () => import("@/components/print/DentalPrescriptionModal").then((m) => m.DentalPrescriptionModal),
  { ssr: false }
);
const ImportDatabaseModal = dynamic(
  () => import("@/components/ImportDatabaseModal").then((m) => m.ImportDatabaseModal),
  { ssr: false }
);

export default function DashboardPage() {
  const { t, language } = useLanguage();
  const {
    sessionChecked,
    isAuthenticated,
    isDoctor,
    isSecretary,
    clinicOwnerId,
    signOut,
    isPasswordRecovery,
    setIsPasswordRecovery,
  } = useAuth();
  const { settings: clinicSettings } = useClinicSettings();

  const [activeTab, setActiveTab] = useState<"patients" | "appointments" | "materials" | "reports">("patients");
  
  // Isolated state per account (never preload global caches)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [materials, setMaterials] = useState<ClinicMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [dentalPatient, setDentalPatient] = useState<Patient | null>(null);
  const [receiptPatient, setReceiptPatient] = useState<Patient | null>(null);
  const [prescriptionPatient, setPrescriptionPatient] = useState<Patient | null>(null);

  // Patients filters
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | Gender>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "debt">("all");
  const [monthFilter, setMonthFilter] = useState<string>("all"); // 'all' or 'YYYY-MM'
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc"); // 'desc' = newest first
  const [notification, setNotification] = useState<string | null>(null);
  const [addPatientInitialDate, setAddPatientInitialDate] = useState<string | null>(null);

  // Undo Delete State & Pending Timer
  interface UndoDeletePatientState {
    patient: Patient;
    index: number;
  }
  const [undoPatientState, setUndoPatientState] = useState<UndoDeletePatientState | null>(null);
  const pendingDeleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Flush pending patient deletion if user leaves or refreshes before timer expires
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (undoPatientState && pendingDeleteTimeoutRef.current) {
        clearTimeout(pendingDeleteTimeoutRef.current);
        deletePatientFromDB(undoPatientState.patient.id, clinicOwnerId).catch(console.error);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [undoPatientState, clinicOwnerId]);

  // Role Access Guard: if secretary, restrict activeTab to patients or appointments
  useEffect(() => {
    if (!isDoctor && (activeTab === "materials" || activeTab === "reports")) {
      setActiveTab("patients");
    }
  }, [isDoctor, activeTab]);

  // Load from Supabase when authenticated, strictly scoped to this clinic
  useEffect(() => {
    if (!isAuthenticated || !clinicOwnerId) {
      setPatients([]);
      setAppointments([]);
      setMaterials([]);
      return;
    }

    // 1. Immediately load this specific clinic's cached records
    setPatients(getCachedPatients(clinicOwnerId));
    setAppointments(getCachedAppointments(clinicOwnerId));
    if (isDoctor) {
      setMaterials(getCachedMaterials(clinicOwnerId));
    }

    async function loadData() {
      setIsLoading(true);
      try {
        if (isDoctor) {
          const [dbPatients, dbApts, dbMaterials] = await Promise.all([
            fetchPatientsFromDB(clinicOwnerId),
            fetchAppointmentsFromDB(clinicOwnerId),
            fetchMaterialsFromDB(clinicOwnerId),
          ]);
          setPatients(dbPatients);
          setAppointments(dbApts);
          setMaterials(dbMaterials);
        } else {
          // Secretary only needs patients and appointments
          const [dbPatients, dbApts] = await Promise.all([
            fetchPatientsFromDB(clinicOwnerId),
            fetchAppointmentsFromDB(clinicOwnerId),
          ]);
          setPatients(dbPatients);
          setAppointments(dbApts);
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated, isDoctor, clinicOwnerId]);

  const handleSignOut = async () => {
    await signOut();
  };

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3000);
  };

  // Patient CRUD
  const handleAddPatient = async (
    data: Omit<Patient, "id">,
    options?: { autoBookAppointment?: boolean }
  ) => {
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

    // Auto-schedule appointment in calendar when enabled
    if (options?.autoBookAppointment !== false && data.date) {
      const aptTime = data.time || "10:00 AM";
      const newApt: Appointment = {
        id: `apt-${now}-${Math.random().toString(36).substring(2, 6)}`,
        patientName: data.name,
        phone: data.phone || "",
        date: data.date,
        time: aptTime,
        treatment: data.notes?.trim() ? data.notes.slice(0, 40) : "General Consultation",
        status: "scheduled",
        createdAt: now,
      };
      setAppointments((prev) => [newApt, ...prev]);
      try {
        await upsertAppointmentToDB(newApt, clinicOwnerId);
      } catch (err) {
        console.error("Failed to auto-save appointment:", err);
      }
    }

    try {
      await upsertPatientToDB(newPatient, clinicOwnerId);
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
      await upsertPatientToDB(updatedPatient, clinicOwnerId);
    } catch (e) {
      console.error("Failed to update patient in Supabase:", e);
      showToast("⚠️ Failed to save to cloud");
    }
  };

  const handleImportPatients = async (importedPatients: Patient[]) => {
    try {
      await batchUpsertPatientsToDB(importedPatients, clinicOwnerId);
      setPatients((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = importedPatients.filter((p) => !existingIds.has(p.id));
        return [...filteredNew, ...prev].sort((a, b) =>
          (b.date || "").localeCompare(a.date || "")
        );
      });
      showToast(`✓ ${t.importSuccess} (${importedPatients.length})`);
    } catch (e) {
      console.error("Batch import error:", e);
      showToast("⚠️ Failed to import some patient records to cloud");
      throw e;
    }
  };

  const handleDeletePatient = async (id: string) => {
    // If a previous delete was waiting for undo, commit it immediately
    if (undoPatientState && pendingDeleteTimeoutRef.current) {
      clearTimeout(pendingDeleteTimeoutRef.current);
      pendingDeleteTimeoutRef.current = null;
      deletePatientFromDB(undoPatientState.patient.id, clinicOwnerId).catch(console.error);
    }

    const patientIndex = patients.findIndex((p) => p.id === id);
    const target = patients[patientIndex];
    if (!target) return;

    // Optimistically remove from state immediately
    setPatients((prev) => prev.filter((p) => p.id !== id));

    // Set undo state
    setUndoPatientState({ patient: target, index: patientIndex });

    // Schedule final permanent DB deletion after 7 seconds
    pendingDeleteTimeoutRef.current = setTimeout(async () => {
      try {
        await deletePatientFromDB(id, clinicOwnerId);
      } catch (e) {
        console.error("Failed to delete patient from Supabase:", e);
      }
      setUndoPatientState(null);
      pendingDeleteTimeoutRef.current = null;
    }, 7000);
  };

  const handleUndoDeletePatient = async () => {
    if (!undoPatientState) return;

    if (pendingDeleteTimeoutRef.current) {
      clearTimeout(pendingDeleteTimeoutRef.current);
      pendingDeleteTimeoutRef.current = null;
    }

    const restoredPatient = undoPatientState.patient;
    const insertIndex = Math.min(undoPatientState.index, patients.length);

    setPatients((prev) => {
      const next = [...prev];
      next.splice(insertIndex, 0, restoredPatient);
      return next;
    });

    setUndoPatientState(null);

    // Re-save to local cache and Supabase to guarantee data consistency
    try {
      await upsertPatientToDB(restoredPatient, clinicOwnerId);
      showToast(`✓ ${restoredPatient.name}: ${t.patientRestored}`);
    } catch (e) {
      console.error("Failed to restore patient:", e);
    }
  };

  const handleDismissUndo = async () => {
    if (pendingDeleteTimeoutRef.current) {
      clearTimeout(pendingDeleteTimeoutRef.current);
      pendingDeleteTimeoutRef.current = null;
    }
    if (undoPatientState) {
      const id = undoPatientState.patient.id;
      setUndoPatientState(null);
      try {
        await deletePatientFromDB(id, clinicOwnerId);
      } catch (e) {
        console.error("Failed to delete patient from Supabase:", e);
      }
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
        await upsertPatientToDB(targetUpdatedPatient, clinicOwnerId);
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
      const historyPaid = history.reduce((sum, h) => sum + (h.paid || 0), 0);
      const historyDebt = history.reduce((sum, h) => sum + (h.debt || 0), 0);
      const sortedHistory = [...history].sort((a, b) =>
        (b.date || "").localeCompare(a.date || "")
      );
      const latestDate = sortedHistory[0]?.date || p.date;

      const updatedPatient: Patient = {
        ...p,
        date: latestDate,
        paidAmount: history.length > 0 ? historyPaid : p.paidAmount,
        debtAmount: history.length > 0 ? historyDebt : p.debtAmount,
        totalAmount: history.length > 0 ? historyPaid + historyDebt : p.totalAmount,
        history,
      };
      targetUpdatedPatient = updatedPatient;
      setHistoryPatient(updatedPatient);
      return updatedPatient;
    });

    setPatients(updated);
    showToast("Removed history record");

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient, clinicOwnerId);
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
        paidAmount: historyPaid,
        debtAmount: historyDebt,
        totalAmount: historyPaid + historyDebt,
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
        await upsertPatientToDB(targetUpdatedPatient, clinicOwnerId);
      } catch (e) {
        console.error("Failed to update history in Supabase:", e);
        showToast("⚠️ Failed to save to cloud");
      }
    }
  };

  const handleSaveTeeth = async (
    patientId: string,
    teeth: ToothRecord[]
  ) => {
    let targetUpdatedPatient: Patient | null = null;
    const updated = patients.map((p) => {
      if (p.id === patientId) {
        targetUpdatedPatient = {
          ...p,
          teeth,
        };
        return targetUpdatedPatient;
      }
      return p;
    });

    setPatients(updated);
    setDentalPatient((prev) => (prev && prev.id === patientId ? targetUpdatedPatient : prev));

    if (targetUpdatedPatient) {
      try {
        await upsertPatientToDB(targetUpdatedPatient, clinicOwnerId);
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
      await upsertAppointmentToDB(newApt, clinicOwnerId);
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
        await upsertAppointmentToDB(targetApt, clinicOwnerId);
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
      await deleteAppointmentFromDB(id, clinicOwnerId);
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
      await upsertPatientToDB(updatedPatient, clinicOwnerId);
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
      await upsertMaterialToDB(newMat, clinicOwnerId);
    } catch (e) {
      console.error("Failed to save material to Supabase:", e);
    }
  };

  const handleUpdateMaterial = async (updated: ClinicMaterial) => {
    setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    try {
      await upsertMaterialToDB(updated, clinicOwnerId);
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
      await deleteMaterialFromDB(id, clinicOwnerId);
    } catch (e) {
      console.error("Failed to delete material from Supabase:", e);
    }
  };


  // Extract available months from patient dates, history, and expenses
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

    materials.forEach((m) => {
      if (m.date && m.date.length >= 7) set.add(m.date.substring(0, 7));
    });

    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [patients, materials]);

  const formatMonthName = (yearMonth: string) => {
    return formatStaticMonthName(yearMonth, language);
  };

  // Filter and sort patients
  const filteredAndSortedPatients = useMemo(() => {
    const rawQuery = searchQuery.trim();
    const q = rawQuery.toLowerCase();
    const cleanSearchDigits = rawQuery.replace(/\D/g, "");

    return patients
      .filter((patient) => {
        if (rawQuery) {
          // 1. Match patient name
          const matchName = patient.name.toLowerCase().includes(q);

          // 2. Match patient phone (supports full formatted string or pure digits)
          const patientPhoneClean = (patient.phone || "").replace(/\D/g, "");
          const matchPhone = Boolean(
            (patient.phone && patient.phone.toLowerCase().includes(q)) ||
            (cleanSearchDigits.length >= 2 && patientPhoneClean.includes(cleanSearchDigits))
          );

          // 3. Match patient general notes
          const matchNotes = Boolean(
            patient.notes && patient.notes.toLowerCase().includes(q)
          );

          // 4. Match tooth number or tooth condition/material/procedure
          const matchTeeth = Boolean(
            patient.teeth?.some((t) => {
              const toothNum = String(t.toothNumber);
              return (
                toothNum === q ||
                toothNum.includes(q) ||
                (t.status && t.status.toLowerCase().includes(q)) ||
                (t.procedure && t.procedure.toLowerCase().includes(q)) ||
                (t.material && t.material.toLowerCase().includes(q)) ||
                (t.notes && t.notes.toLowerCase().includes(q))
              );
            })
          );

          // 5. Match treatment history titles or past visit notes
          const matchHistory = Boolean(
            patient.history?.some(
              (h) =>
                (h.title && h.title.toLowerCase().includes(q)) ||
                (h.notes && h.notes.toLowerCase().includes(q))
            )
          );

          const matchesSearch =
            matchName || matchPhone || matchNotes || matchTeeth || matchHistory;

          if (!matchesSearch) return false;
        }
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

        return matchesGender && matchesPayment && matchesMonth;
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 shadow-xl shadow-indigo-500/30 ring-4 ring-white/10 mb-4 animate-pulse">
          <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden relative flex items-center justify-center p-2.5">
            <ClinicLogo className="w-full h-full drop-shadow-md" />
          </div>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight">
          {clinicSettings.clinicName || t.clinicPortalTitle}
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">{t.verifyingSession}</p>
      </div>
    );
  }

  // If not logged in, show Clinic Login Screen (with SetPasswordModal if arrived via invite/recovery)
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onSuccess={() => {}} />
        <SetPasswordModal
          isOpen={isPasswordRecovery}
          onClose={() => setIsPasswordRecovery(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Sleek Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={() => setIsModalOpen(true)}
        patientCount={patients.length}
        appointmentCount={appointments.length}
        materialCount={materials.length}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenClinicSettings={() => setIsSettingsModalOpen(true)}
        onOpenImportDatabase={() => setIsImportModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-full px-3 sm:px-6 xl:px-10 pt-3 sm:pt-6 pb-32 md:pb-12">
        {activeTab === "appointments" ? (
          /* ================= APPOINTMENTS FULL MONTH TAB ================= */
          <AppointmentsView
            appointments={appointments}
            patients={patients}
            onAddAppointment={handleAddAppointment}
            onToggleStatus={handleToggleAppointmentStatus}
            onDeleteAppointment={handleDeleteAppointment}
            onOpenAddPatient={(dateStr) => {
              setAddPatientInitialDate(dateStr);
              setIsModalOpen(true);
            }}
          />
        ) : activeTab === "materials" && isDoctor ? (
          /* ================= CLINIC MATERIALS & EXPENSES TAB ================= */
          <MaterialsView
            materials={materials}
            onAddMaterial={handleAddMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
          />
        ) : activeTab === "reports" && isDoctor ? (
          /* ================= MONTHLY REPORTS TAB ================= */
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">{t.monthlyReports}</h2>
            </div>
            <MonthlyReportView
              patients={patients}
              materials={materials}
              onViewHistory={(patient) => setHistoryPatient(patient)}
            />
          </>
        ) : (
          /* ================= PATIENTS CASES TAB ================= */
          <>
            {/* Quick Stats Overview (shows income, total expenses, net profit, debts) */}
            <StatsOverview
              patients={monthFilter === "all" ? patients : filteredAndSortedPatients}
              materials={materials}
              selectedMonth={monthFilter}
              monthSubtitle={monthFilter === "all" ? undefined : formatMonthName(monthFilter)}
              appointmentCount={appointments.length}
            />

            {/* Filter and Control Toolbar (Mobbin-style segmented controls) */}
            <div className="mb-4 sm:mb-6 flex flex-col md:flex-row gap-2.5 sm:gap-3 md:items-center md:justify-between">
              {/* Left: Search input & Add Patient CTA */}
              <div className="flex items-center gap-2 flex-1 max-w-full md:max-w-lg">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 rtl:pl-9 rtl:pr-10 py-2.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 shadow-2xs transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.addPatient}</span>
                </button>
              </div>

              {/* Right: Horizontally swipeable filter chips on mobile */}
              <div className="overflow-x-auto whitespace-nowrap no-scrollbar flex items-center gap-2 pb-1 -mx-1 px-1 sm:mx-0 sm:px-0 sm:flex-wrap">
                {/* Gender Filters */}
                <div className="inline-flex rounded-2xl border border-slate-200/90 dark:border-slate-800 p-0.5 bg-slate-100/70 dark:bg-slate-900/80 backdrop-blur-md shadow-2xs flex-shrink-0">
                  <button
                    onClick={() => setGenderFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      genderFilter === "all"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {t.all}
                  </button>
                  <button
                    onClick={() => setGenderFilter("male")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      genderFilter === "male"
                        ? "bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>♂</span>
                    <span>{t.male}</span>
                  </button>
                  <button
                    onClick={() => setGenderFilter("female")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      genderFilter === "female"
                        ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>♀</span>
                    <span>{t.female}</span>
                  </button>
                </div>

                {/* Payment & Debt Filter */}
                <div className="inline-flex rounded-2xl border border-slate-200/90 dark:border-slate-800 p-0.5 bg-slate-100/70 dark:bg-slate-900/80 backdrop-blur-md shadow-2xs flex-shrink-0">
                  <button
                    onClick={() => setPaymentFilter("all")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === "all"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {t.allFees}
                  </button>
                  <button
                    onClick={() => setPaymentFilter("paid")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === "paid"
                        ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>✓</span>
                    <span>{t.paid}</span>
                  </button>
                  <button
                    onClick={() => setPaymentFilter("debt")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentFilter === "debt"
                        ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>{t.debts}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 font-black">
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xs flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                  <label htmlFor="month-select" className="sr-only">Filter by Month</label>
                  <select
                    id="month-select"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all">{t.allMonths}</option>
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
                    sortOrder === "desc" ? t.newest : t.oldest
                  }`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-slate-800/60 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" />
                  <span>
                    {sortOrder === "desc" ? t.newest : t.oldest}
                  </span>
                </button>

                {/* Table / Grid view switcher */}
                <div className="inline-flex rounded-2xl border border-slate-200/90 dark:border-slate-800 p-0.5 bg-slate-100/70 dark:bg-slate-900/80 backdrop-blur-md shadow-2xs flex-shrink-0">
                  <button
                    onClick={() => setViewMode("table")}
                    aria-label={t.tableView}
                    title={t.tableView}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label={t.gridView}
                    title={t.gridView}
                    className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
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
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 mx-auto flex items-center justify-center mb-3">
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
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{t.addPatient}</span>
                      </button>
                      {isDoctor && (
                        <button
                          onClick={() => setIsImportModalOpen(true)}
                          className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-xs cursor-pointer"
                        >
                          <Database className="w-4 h-4 text-sky-500" />
                          <span>{t.importDatabase}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Table View */}
                {viewMode === "table" ? (
                  <div className="w-full max-w-full overflow-hidden">
                    <PatientTable
                      patients={filteredAndSortedPatients}
                      onDeletePatient={handleDeletePatient}
                      onEditPatient={(patient) => setEditingPatient(patient)}
                      onViewHistory={(patient) => setHistoryPatient(patient)}
                      onOpenDentalChart={(patient) => setDentalPatient(patient)}
                      onSettleDebt={handleSettleDebt}
                      onPrintReceipt={(patient) => setReceiptPatient(patient)}
                      onPrintPrescription={(patient) => setPrescriptionPatient(patient)}
                    />
                  </div>
                ) : (
                  /* Grid / Card View */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {filteredAndSortedPatients.map((patient) => (
                      <PatientCard
                        key={patient.id}
                        patient={patient}
                        onDeletePatient={handleDeletePatient}
                        onEditPatient={(patient) => setEditingPatient(patient)}
                        onViewHistory={(patient) => setHistoryPatient(patient)}
                        onOpenDentalChart={(patient) => setDentalPatient(patient)}
                        onSettleDebt={handleSettleDebt}
                        onUpdatePatient={handleUpdatePatient}
                        onPrintReceipt={(patient) => setReceiptPatient(patient)}
                        onPrintPrescription={(patient) => setPrescriptionPatient(patient)}
                      />
                    ))}
                  </div>
                )}
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

      </main>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isModalOpen}
        initialDate={
          addPatientInitialDate ||
          (monthFilter !== "all" ? `${monthFilter}-01` : undefined)
        }
        onClose={() => {
          setIsModalOpen(false);
          setAddPatientInitialDate(null);
        }}
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
        onPrintReceipt={(patient) => setReceiptPatient(patient)}
        onPrintPrescription={(patient) => setPrescriptionPatient(patient)}
      />

      {/* 3D Dental Chart Modal */}
      <DentalChartModal
        isOpen={Boolean(dentalPatient && isDoctor)}
        patient={dentalPatient}
        onClose={() => setDentalPatient(null)}
        onSaveTeeth={handleSaveTeeth}
        clinicMaterials={materials}
      />

      {/* Print Receipt / Invoice Modal */}
      <PrintReceiptModal
        isOpen={Boolean(receiptPatient)}
        patient={receiptPatient}
        onClose={() => setReceiptPatient(null)}
      />

      {/* Dental Prescription Modal */}
      <DentalPrescriptionModal
        isOpen={Boolean(prescriptionPatient)}
        patient={prescriptionPatient}
        onClose={() => setPrescriptionPatient(null)}
      />


      {/* Staff & Secretary Management Modal (Doctor Only) */}
      {isDoctor && (
        <StaffModal
          isOpen={isStaffModalOpen}
          onClose={() => setIsStaffModalOpen(false)}
        />
      )}

      {/* Clinic Settings & White-label Customization Modal (Doctor Only) */}
      {isDoctor && (
        <ClinicSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onOpenImportDatabase={() => setIsImportModalOpen(true)}
        />
      )}

      {/* Database Import & Export CSV Modal (Doctor Only) */}
      {isDoctor && (
        <ImportDatabaseModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          existingPatients={patients}
          onImportPatients={handleImportPatients}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-20 sm:bottom-5 right-4 rtl:right-auto rtl:left-4 sm:right-5 sm:rtl:left-5 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-2xl border border-slate-700 dark:border-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {notification}
        </div>
      )}

      {/* Floating Undo Delete Toast */}
      {undoPatientState && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md p-3.5 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-300 truncate">
                    {t.patientDeleted}
                  </p>
                  <p className="text-sm font-bold text-white truncate">
                    {undoPatientState.patient.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={handleUndoDeletePatient}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.undo}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismissUndo}
                  title="Dismiss"
                  aria-label="Dismiss"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Countdown animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-500 animate-shrink-width" />
            </div>
          </div>
        </div>
      )}

      {/* Set Password / Password Recovery Modal */}
      <SetPasswordModal
        isOpen={isPasswordRecovery}
        onClose={() => setIsPasswordRecovery(false)}
      />
    </div>
  );
}
