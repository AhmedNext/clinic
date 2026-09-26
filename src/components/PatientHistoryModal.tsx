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
} from "lucide-react";
import { Patient, PatientHistoryEntry, calculateDebt, formatIQD } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { formatStaticDate } from "@/utils/date";

interface PatientHistoryModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onAddHistoryEntry: (
    patientId: string,
    entry: Omit<PatientHistoryEntry, "id" | "createdAt">
  ) => void;
  onDeleteHistoryEntry: (patientId: string, entryId: string) => void;
}

export function PatientHistoryModal({
  isOpen,
  patient,
  onClose,
  onAddHistoryEntry,
  onDeleteHistoryEntry,
}: PatientHistoryModalProps) {
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(getTodayString());
  const [newTitle, setNewTitle] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newPaid, setNewPaid] = useState("0");
  const [newDebt, setNewDebt] = useState("0");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShowAddForm(false);
      setNewDate(getTodayString());
      setNewTitle("");
      setNewNotes("");
      setNewPaid("0");
      setNewDebt("0");
      setError(null);
    }
  }, [isOpen, patient]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const formatDate = (dateString: string) => formatStaticDate(dateString);

  const handlePaidChange = (val: string) => {
    setNewPaid(val);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setError("Please enter a visit title or reason.");
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
    setError(null);
  };

  const historyEntries = [...(patient.history || [])].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );

  const totalDebt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col h-[93dvh] sm:h-auto sm:max-h-[88vh] border-0 sm:border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

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
                  {patient.gender === "male" ? "♂ Male" : "♀ Female"}
                </span>
                {patient.age && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {patient.age}y
                  </span>
                )}
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {patient.id}
                </span>
              </div>
            </div>
          </div>

          {/* Financial summary + close */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right text-xs hidden sm:block">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {formatIQD(patient.paidAmount ?? 0)}
              </div>
              {totalDebt > 0 ? (
                <div className="text-rose-600 dark:text-rose-400 font-bold">
                  Owes {formatIQD(totalDebt)}
                </div>
              ) : (
                <div className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Settled</div>
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
            Total Paid: <strong className="text-slate-800 dark:text-slate-200">{formatIQD(patient.paidAmount ?? 0)}</strong>
          </span>
          {totalDebt > 0 ? (
            <span className="font-bold text-rose-600 dark:text-rose-400">Owes {formatIQD(totalDebt)}</span>
          ) : (
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ Fully Settled</span>
          )}
        </div>

        {/* Medical history alert */}
        {patient.medicalHistory && (
          <div className="flex items-start gap-2.5 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
            <span><strong>Medical Alert:</strong> {patient.medicalHistory}</span>
          </div>
        )}

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Add visit button */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Visit Timeline
                <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-500">
                  ({historyEntries.length} {historyEntries.length === 1 ? "visit" : "visits"})
                </span>
              </span>
            </div>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                showAddForm
                  ? "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddForm ? "Cancel" : "Log Visit"}
            </button>
          </div>

          {/* ── ADD FORM ── */}
          {showAddForm && (
            <form
              onSubmit={handleAddSubmit}
              className="mx-4 mb-4 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                New Visit Record
              </p>

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Date + Title — stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Visit Date *
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
                    Title / Reason *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Root Canal, Filling, Check-up"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  />
                </div>
              </div>

              {/* Paid & Debt — 2 columns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1">
                    Paid (IQD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="25000"
                    value={newPaid}
                    onChange={(e) => handlePaidChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-1">
                    Debt (IQD)
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
                  Clinical Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Symptoms, treatment, prescription, observations..."
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
                Save Visit Record
              </button>
            </form>
          )}

          {/* ── TIMELINE ── */}
          {historyEntries.length === 0 ? (
            <div className="mx-4 mb-4 py-12 flex flex-col items-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
              <Stethoscope className="w-9 h-9 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No visits logged yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[220px]">
                Tap "Log Visit" above to record consultations and treatments.
              </p>
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

                        {/* Card */}
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                            {/* Card header */}
                            <div className="flex items-start justify-between gap-2 px-4 pt-3 pb-2.5">
                              <div className="min-w-0">
                                {/* Date */}
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                    {formatDate(entry.date)}
                                  </span>
                                  {isFirst && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                      Latest
                                    </span>
                                  )}
                                </div>
                                {/* Title */}
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                  {entry.title}
                                </p>
                              </div>

                              {/* Delete */}
                              <button
                                onClick={() => onDeleteHistoryEntry(patient.id, entry.id)}
                                title="Delete this record"
                                className="flex-shrink-0 p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Notes */}
                            {entry.notes && (
                              <div className="px-4 pb-3">
                                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                                  <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {entry.notes}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Financial row */}
                            {(entry.fee !== undefined || entry.paid !== undefined) && (
                              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
                                <div className="flex items-center gap-1.5">
                                  <Banknote className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Paid:{" "}
                                    <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                                      {formatIQD(entryPaid)}
                                    </strong>
                                  </span>
                                </div>
                                {entryDebt > 0 ? (
                                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                                    Debt: {formatIQD(entryDebt)}
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                    ✓ Paid in full
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
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
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Stored on this device
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
