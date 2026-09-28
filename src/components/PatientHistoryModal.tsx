"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Plus,
  Trash2,
  FileText,
  Banknote,
  AlertCircle,
  Activity,
  CheckCircle2,
  Stethoscope,
  Pencil,
  RotateCcw,
  CloudCheck,
  Printer,
} from "lucide-react";
import { Patient, PatientHistoryEntry, calculateDebt, formatIQD } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { formatStaticDate } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";

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
    setEditPaid(String(entry.paid ?? 0));
    setEditDebt(String(entry.debt ?? 0));
    setEditError(null);
    setShowAddForm(false); // close add form if open
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
      paid: parseFloat(editPaid) || 0,
      debt: parseFloat(editDebt) || 0,
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
      paid: parseFloat(newPaid) || 0,
      debt: parseFloat(newDebt) || 0,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[90vh] max-h-[90vh] border-0 sm:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <PatientAvatar gender={patient.gender} size="md" />
            <div className="min-w-0">
              <h2
                id="history-modal-title"
                className="font-bold text-slate-900 dark:text-slate-100 text-base truncate"
              >
                {patient.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                    patient.gender === "male"
                      ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  {patient.gender === "male" ? `♂ ${t.male}` : `♀ ${t.female}`}
                </span>
                {patient.age && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {patient.age}y
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <Activity className="w-2.5 h-2.5 text-indigo-500" />
                  <span>{historyEntries.length} {t.totalVisitsCount}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                  <span>☁️</span>
                  <span>{t.supabaseLive}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Financial summary + Actions + close */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {onPrintReceipt && (
              <button
                type="button"
                onClick={() => onPrintReceipt(patient)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/60 text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title={t.printReceipt}
              >
                <Printer className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden md:inline">{t.printReceipt}</span>
              </button>
            )}

            {onPrintPrescription && (
              <button
                type="button"
                onClick={() => onPrintPrescription(patient)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title={t.printPrescription}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden md:inline">{t.prescription}</span>
              </button>
            )}

            <div className="text-right rtl:text-left text-xs hidden lg:block">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {formatIQD(patient.paidAmount ?? 0)}
              </div>
              {totalDebt > 0 ? (
                <div className="text-rose-600 dark:text-rose-400 font-bold">
                  {t.owesLabel} {formatIQD(totalDebt)}
                </div>
              ) : (
                <div className="text-emerald-600 dark:text-emerald-400 font-medium">{t.allSettled}</div>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Financial summary — mobile only */}
        <div className="sm:hidden flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {t.paidLabel}: <strong className="text-slate-800 dark:text-slate-200">{formatIQD(patient.paidAmount ?? 0)}</strong>
          </span>
          {totalDebt > 0 ? (
            <span className="font-bold text-rose-600 dark:text-rose-400">{t.owesLabel} {formatIQD(totalDebt)}</span>
          ) : (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.allSettled}</span>
          )}
        </div>

        {/* Medical history alert */}
        {patient.medicalHistory && (
          <div className="flex items-start gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
            <span><strong>{t.medicalAlert}:</strong> {patient.medicalHistory}</span>
          </div>
        )}

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Add visit button */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t.patientHistoryAndTreatments}
                <span className="ml-1.5 rtl:ml-0 rtl:mr-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
                  ({historyEntries.length} {historyEntries.length === 1 ? t.entry : t.entries})
                </span>
              </span>
            </div>
            <button
              onClick={() => {
                setShowAddForm((v) => !v);
                setEditingEntryId(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                showAddForm
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? t.cancel : t.addEntry}
            </button>
          </div>

          {/* ── ADD FORM ── */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="mx-4 mb-4 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                  {t.newVisitRecord}
                </p>
                <span className="text-[10px] text-indigo-500 font-medium">{t.savesToSupabase}</span>
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  />
                </div>
              </div>

              {/* Paid & Debt */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    {t.paidIQD}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={newPaid}
                    onChange={(e) => setNewPaid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-1">
                    {t.debtIQD}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="0"
                    value={newDebt}
                    onChange={(e) => setNewDebt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400/30"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t.clinicalNotesAndDetails}
                </label>
                <textarea
                  rows={3}
                  placeholder={t.clinicalNotesPlaceholder}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveVisitRecord}</span>
              </button>
            </form>
          )}

          {/* ── TIMELINE ── */}
          {historyEntries.length === 0 ? (
            <div className="mx-4 mb-4 py-12 flex flex-col items-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <Stethoscope className="w-9 h-9 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t.noTreatmentHistory}</p>
            </div>
          ) : (
            <div className="px-4 pb-4">
              {/* Timeline line + entries */}
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-3 top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-4">
                  {historyEntries.map((entry, idx) => {
                    const entryDebt = entry.debt ?? 0;
                    const entryPaid = entry.paid ?? 0;
                    const isFirst = idx === 0;
                    const isEditingThis = editingEntryId === entry.id;

                    return (
                      <div key={entry.id} className="relative flex gap-4 group">
                        {/* Dot */}
                        <div
                          className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                            isFirst
                              ? "bg-indigo-600 border-indigo-600"
                              : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              isFirst ? "bg-white" : "bg-slate-400 dark:bg-slate-600"
                            }`}
                          />
                        </div>

                        {/* Card or Edit Form */}
                        <div className="flex-1 min-w-0 pb-1">
                          {isEditingThis ? (
                            /* ── INLINE EDIT FORM ── */
                            <form
                              onSubmit={handleEditSubmit}
                              className="rounded-2xl border-2 border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30 p-4 space-y-3 shadow-md"
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
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={editPaid}
                                    onChange={(e) => setEditPaid(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                                    {t.debtIQD}
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={editDebt}
                                    onChange={(e) => setEditDebt(e.target.value)}
                                    className="w-full px-2.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs font-semibold text-rose-600 dark:text-rose-400 focus:ring-2 focus:ring-rose-400"
                                  />
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
                            /* ── DISPLAY CARD ── */
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                              {/* Card header */}
                              <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2.5">
                                <div className="min-w-0">
                                  {/* Date */}
                                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                                    <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                      {formatDate(entry.date)}
                                    </span>
                                    {isFirst && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                        {t.latest}
                                      </span>
                                    )}
                                  </div>
                                  {/* Title */}
                                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                    {entry.title}
                                  </p>
                                </div>

                                {/* Actions: Edit + Delete */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    onClick={() => startEditing(entry)}
                                    title={t.edit}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`${t.deleteVisitConfirm} "${entry.title}"?`)) {
                                        onDeleteHistoryEntry(patient.id, entry.id);
                                      }
                                    }}
                                    title={t.delete}
                                    className="p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Notes */}
                              {entry.notes && (
                                <div className="px-4 pb-3">
                                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                      {entry.notes}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Financial row */}
                              {(entry.fee !== undefined || entry.paid !== undefined || entry.debt !== undefined) && (
                                <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                                  <div className="flex items-center gap-1.5">
                                    <Banknote className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                      {t.paidLabel}:{" "}
                                      <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                        {formatIQD(entryPaid)}
                                      </strong>
                                    </span>
                                  </div>
                                  {entryDebt > 0 ? (
                                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                      {t.owesLabel}: {formatIQD(entryDebt)}
                                    </span>
                                  ) : (
                                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                      ✓ {t.paid}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span>☁️</span>
            <span>{t.storedInSupabase}</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}
