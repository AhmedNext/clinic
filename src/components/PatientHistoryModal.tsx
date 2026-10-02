"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Printer,
  Phone,
  MessageCircle,
} from "lucide-react";
import {
  Patient,
  PatientHistoryEntry,
  calculateDebt,
  formatIQD,
  formatNumberWithCommas,
  parseCleanNumber,
  QUICK_IQD_CHIPS,
  getWhatsAppUrl,
} from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { formatStaticDate } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Extracts and normalizes dental tooth tags (e.g. "Tooth #21" or "Teeth #13-15") from text
 */
function extractToothTags(text?: string): string[] {
  if (!text) return [];
  const tags: string[] = [];
  const regex = /\b(teeth|tooth)\s*(?:#|:)?\s*([0-9]{1,2}(?:\s*(?:-|–|,|\/)\s*[0-9]{1,2})*)\b/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const isPlural = /teeth/i.test(match[1]);
    const num = match[2].trim().replace(/\s*([-,])\s*/g, "$1 ");
    tags.push(`${isPlural ? "Teeth" : "Tooth"} #${num}`);
  }
  return Array.from(new Set(tags));
}

interface PatientHistoryModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onAddHistoryEntry: (
    patientId: string,
    entry: Omit<PatientHistoryEntry, "id" | "createdAt">
  ) => void;
  onUpdateHistoryEntry: (
    patientId: string,
    entryId: string,
    entry: Omit<PatientHistoryEntry, "id" | "createdAt">
  ) => void;
  onDeleteHistoryEntry: (patientId: string, entryId: string) => void;
  onPrintReceipt?: (patient: Patient) => void;
  onPrintPrescription?: (patient: Patient) => void;
}

export function PatientHistoryModal({
  isOpen,
  patient,
  onClose,
  onAddHistoryEntry,
  onUpdateHistoryEntry,
  onDeleteHistoryEntry,
  onPrintReceipt,
  onPrintPrescription,
}: PatientHistoryModalProps) {
  const { t, language } = useLanguage();

  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(getTodayString());
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPaid, setNewPaid] = useState("0");
  const [newDebt, setNewDebt] = useState("0");
  const [addError, setAddError] = useState<string | null>(null);

  // Edit form state
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editPaid, setEditPaid] = useState("0");
  const [editDebt, setEditDebt] = useState("0");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShowAddForm(false);
      setEditingEntryId(null);
      setNewDate(getTodayString());
      setNewTitle("");
      setNewNotes("");
      setNewPaid("0");
      setNewDebt("0");
      setAddError(null);
      setEditError(null);
    }
  }, [isOpen, patient?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const formatDate = (dateString: string) => formatStaticDate(dateString, language);

  // Start editing an entry
  const startEditing = (entry: PatientHistoryEntry) => {
    setEditingEntryId(entry.id);
    setEditDate(entry.date || getTodayString());
    setEditTitle(entry.title || "");
    setEditNotes(entry.notes || "");
    setEditPaid(entry.paid ? entry.paid.toLocaleString("en-US") : "0");
    setEditDebt(entry.debt ? entry.debt.toLocaleString("en-US") : "0");
    setEditError(null);
    setShowAddForm(false);
  };

  const cancelEditing = () => {
    setEditingEntryId(null);
    setEditError(null);
  };

  // Submit edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntryId) return;
    if (!editTitle.trim()) {
      setEditError("Please enter a title or procedure.");
      return;
    }

    onUpdateHistoryEntry(patient.id, editingEntryId, {
      date: editDate,
      title: editTitle.trim(),
      notes: editNotes.trim(),
      fee: 0,
      paid: parseCleanNumber(editPaid),
      debt: parseCleanNumber(editDebt),
    });

    setEditingEntryId(null);
    setEditError(null);
  };

  // Submit add
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setAddError("Please enter a visit title or reason.");
      return;
    }
    onAddHistoryEntry(patient.id, {
      date: newDate,
      title: newTitle.trim(),
      notes: newNotes.trim(),
      fee: 0,
      paid: parseCleanNumber(newPaid),
      debt: parseCleanNumber(newDebt),
    });
    setNewTitle("");
    setNewNotes("");
    setNewPaid("0");
    setNewDebt("0");
    setShowAddForm(false);
    setAddError(null);
  };

  const historyEntries = [...(patient.history || [])].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );

  const totalDebt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
  const totalCalculatedFee =
    patient.totalAmount && patient.totalAmount > 0
      ? patient.totalAmount
      : (patient.paidAmount ?? 0) + totalDebt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-[90vh] border-0 sm:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 overflow-hidden">
        {/* ── 1. PATIENT HEADER & QUICK ACTIONS ── */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900">
          <div className="flex items-start sm:items-center justify-between gap-4">
            {/* Left: Patient Avatar & Identity */}
            <div className="flex items-center gap-3.5 min-w-0">
              <PatientAvatar gender={patient.gender} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2
                    id="history-modal-title"
                    className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight truncate leading-tight"
                  >
                    {patient.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
                      patient.gender === "male"
                        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                    }`}
                  >
                    {patient.gender === "male" ? t.male : t.female}
                  </span>
                  {patient.age && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      • {patient.age} yrs
                    </span>
                  )}
                </div>

                {patient.phone && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {patient.phone}
                    </span>
                    <a
                      href={`tel:${patient.phone}`}
                      className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={getWhatsAppUrl({ phone: patient.phone, patientName: patient.name })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Buttons (Ghost / Outline) & Close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {onPrintReceipt && (
                <button
                  type="button"
                  onClick={() => onPrintReceipt(patient)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-2xs transition-all cursor-pointer active:scale-98"
                  title={t.printReceipt}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">{t.printReceipt}</span>
                </button>
              )}

              {onPrintPrescription && (
                <button
                  type="button"
                  onClick={() => onPrintPrescription(patient)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium shadow-2xs transition-all cursor-pointer active:scale-98"
                  title={t.prescription}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span className="hidden sm:inline">{t.prescription}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── 2. FINANCIAL SUMMARY BANNER (KPI STRIP) ── */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="grid grid-cols-3 gap-3 items-center">
            {/* Total Fee */}
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t.totalPrice}
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                {formatIQD(totalCalculatedFee)}
              </span>
            </div>

            {/* Paid Amount */}
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {t.paidLabel}
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatIQD(patient.paidAmount ?? 0)}
              </span>
            </div>

            {/* Balance Due / All Settled Status */}
            <div className="text-right rtl:text-left">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-0.5">
                {totalDebt > 0 ? t.owesLabel : "Status"}
              </span>
              {totalDebt > 0 ? (
                <span className="inline-flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                  {formatIQD(totalDebt)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ring-1 ring-emerald-600/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.allSettled}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Medical history alert if present */}
        {patient.medicalHistory && (
          <div className="mx-5 sm:mx-6 mt-3.5 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{t.medicalAlert}: </span>
              <span>{patient.medicalHistory}</span>
            </div>
          </div>
        )}

        {/* ── 3. TREATMENT TIMELINE & CARDS ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Header Row: Title + Add Entry */}
          <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t.patientHistoryAndTreatments}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {historyEntries.length} {historyEntries.length === 1 ? t.visit : t.visits}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddForm((v) => !v);
                setEditingEntryId(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                showAddForm
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? t.cancel : t.addEntry}</span>
            </button>
          </div>

          {/* Add Visit Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="mx-5 sm:mx-6 mb-5 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {t.newVisitRecord}
                </p>
                <span className="text-[11px] text-slate-400 font-medium">{t.savesToSupabase}</span>
              </div>

              {addError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-3 py-2">
                  {addError}
                </p>
              )}

              {/* Date + Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.visitDate}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {t.procedureTitle}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t.procedurePlaceholder}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
              </div>

              {/* Paid & Debt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    {t.paidIQD}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={newPaid}
                    onChange={(e) => setNewPaid(formatNumberWithCommas(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-1">
                    {t.debtIQD}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={newDebt}
                    onChange={(e) => setNewDebt(formatNumberWithCommas(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/30 font-mono"
                  />
                </div>
              </div>

              {/* Quick-Pick Chips */}
              <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    ⚡ {t.quickPickFees}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {t.paidLabel} (1-tap)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUICK_IQD_CHIPS.map((chipVal) => (
                    <button
                      key={chipVal}
                      type="button"
                      onClick={() => setNewPaid(chipVal.toLocaleString("en-US"))}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        parseCleanNumber(newPaid) === chipVal
                          ? "bg-emerald-600 text-white shadow-xs scale-105"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:text-emerald-600"
                      }`}
                    >
                      {chipVal.toLocaleString()}
                    </button>
                  ))}
                  {newPaid !== "0" && newPaid !== "" && (
                    <button
                      type="button"
                      onClick={() => setNewPaid("0")}
                      className="px-1.5 py-0.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="0 IQD"
                    >
                      0
                    </button>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t.clinicalNotesAndDetails}
                </label>
                <textarea
                  rows={2}
                  placeholder={t.clinicalNotesPlaceholder}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400/20 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveVisitRecord}</span>
              </button>
            </form>
          )}

          {/* Timeline Cards Container */}
          {historyEntries.length === 0 ? (
            <div className="mx-5 sm:mx-6 my-6 py-12 flex flex-col items-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20">
              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {t.noTreatmentHistory}
              </p>
            </div>
          ) : (
            <div className="px-5 sm:px-6 pb-6">
              <div className="relative pl-6 sm:pl-7">
                {/* Continuous Vertical Timeline Line */}
                <div className="absolute left-[9px] sm:left-[11px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-4">
                  {historyEntries.map((entry, idx) => {
                    const entryDebt = entry.debt ?? 0;
                    const entryPaid = entry.paid ?? 0;
                    const isFirst = idx === 0;
                    const isEditingThis = editingEntryId === entry.id;
                    const isZeroCost = entryPaid === 0 && entryDebt === 0;
                    const toothBadges = extractToothTags(`${entry.title} ${entry.notes || ""}`);

                    return (
                      <div key={entry.id} className="relative group">
                        {/* Smooth Timeline Indicator Dot */}
                        <div
                          className={`absolute -left-6 sm:-left-7 top-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center bg-white dark:bg-slate-900 border-2 transition-all ${
                            isFirst
                              ? "border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-950/60"
                              : "border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <div
                            className={`rounded-full ${
                              isFirst
                                ? "w-2 h-2 bg-indigo-600 dark:bg-indigo-500"
                                : "w-1.5 h-1.5 bg-slate-400 dark:bg-slate-600"
                            }`}
                          />
                        </div>

                        {/* Card or Inline Edit Form */}
                        {isEditingThis ? (
                          /* Inline Edit Form */
                          <form
                            onSubmit={handleEditSubmit}
                            className="rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 p-4 sm:p-5 space-y-3.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                                <Pencil className="w-3.5 h-3.5" />
                                {t.editVisitRecord}
                              </span>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {editError && (
                              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-2.5 py-1.5">
                                {editError}
                              </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  {t.visitDate}
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-400"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                  {t.procedureTitle}
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-400"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                                  {t.paidIQD}
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={editPaid}
                                  onChange={(e) => setEditPaid(formatNumberWithCommas(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-400 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                                  {t.debtIQD}
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={editDebt}
                                  onChange={(e) => setEditDebt(formatNumberWithCommas(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs font-semibold text-rose-600 dark:text-rose-400 focus:ring-2 focus:ring-rose-400 font-mono"
                                />
                              </div>
                            </div>

                            {/* Quick chips */}
                            <div className="pt-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {QUICK_IQD_CHIPS.map((chipVal) => (
                                  <button
                                    key={chipVal}
                                    type="button"
                                    onClick={() => setEditPaid(chipVal.toLocaleString("en-US"))}
                                    className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                      parseCleanNumber(editPaid) === chipVal
                                        ? "bg-emerald-600 text-white shadow-xs scale-105"
                                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:text-emerald-600"
                                    }`}
                                  >
                                    {chipVal.toLocaleString()}
                                  </button>
                                ))}
                                {editPaid !== "0" && editPaid !== "" && (
                                  <button
                                    type="button"
                                    onClick={() => setEditPaid("0")}
                                    className="px-1.5 py-0.5 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-rose-500 cursor-pointer"
                                    title="0 IQD"
                                  >
                                    0
                                  </button>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                {t.clinicalNotesAndDetails}
                              </label>
                              <textarea
                                rows={2}
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-400 resize-none"
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="submit"
                                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs cursor-pointer"
                              >
                                {t.updateVisitRecord}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                              >
                                {t.cancel}
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* Modern Linear-style Treatment Card */
                          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all p-4 sm:p-5">
                            {/* Card Header Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{formatDate(entry.date)}</span>
                                  </span>

                                  {isFirst && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 ring-1 ring-indigo-500/20">
                                      {t.latest}
                                    </span>
                                  )}

                                  {/* Tooth Badges */}
                                  {toothBadges.map((badge) => (
                                    <span
                                      key={badge}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 ring-1 ring-sky-600/20"
                                    >
                                      <span>🦷</span>
                                      <span>{badge}</span>
                                    </span>
                                  ))}
                                </div>

                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  {entry.title}
                                </h4>
                              </div>

                              {/* Subtle Actions (Pencil & Trash) */}
                              <div className="flex items-center gap-1 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => startEditing(entry)}
                                  title={t.edit}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`${t.deleteVisitConfirm} "${entry.title}"?`)) {
                                      onDeleteHistoryEntry(patient.id, entry.id);
                                    }
                                  }}
                                  title={t.delete}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Flattened Notes (Clean readable text with subtle accent border) */}
                            {entry.notes && (
                              <div className="mt-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-normal">
                                {entry.notes}
                              </div>
                            )}

                            {/* Card Financial Row */}
                            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                              {isZeroCost ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  Free / Included
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    {t.paidLabel}:{" "}
                                    <strong className="text-slate-800 dark:text-slate-200 font-mono font-bold">
                                      {formatIQD(entryPaid)}
                                    </strong>
                                  </span>
                                </div>
                              )}

                              {!isZeroCost && (
                                entryDebt > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 ring-1 ring-rose-600/20">
                                    {t.owesLabel}: {formatIQD(entryDebt)}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{t.paid}</span>
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── 4. MODAL FOOTER ── */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          {/* Subtle Sync Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer active:scale-98"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
