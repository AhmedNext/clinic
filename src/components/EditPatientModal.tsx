"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, User, FileText, CheckCircle2, Banknote, Phone } from "lucide-react";
import { Gender, Patient, calculateDebt } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { DentalChart } from "./dental/DentalChart";
import { PatientAvatar } from "./PatientAvatar";

interface EditPatientModalProps {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onUpdatePatient: (updated: Patient) => void;
}

export function EditPatientModal({
  isOpen,
  patient,
  onClose,
  onUpdatePatient,
}: EditPatientModalProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [date, setDate] = useState("");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [debtAmount, setDebtAmount] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [teeth, setTeeth] = useState<ToothRecord[]>([]);
  const [showTeethChart, setShowTeethChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teeth handlers
  const handleUpdateTooth = (record: ToothRecord) => {
    const exists = teeth.some((t) => t.toothNumber === record.toothNumber);
    const updated = exists
      ? teeth.map((t) => (t.toothNumber === record.toothNumber ? record : t))
      : [...teeth, record];
    setTeeth(updated);
  };

  const handleUpdateMultipleTeeth = (records: ToothRecord[]) => {
    const map = new Map<number, ToothRecord>(teeth.map((t) => [t.toothNumber, t]));
    for (const rec of records) {
      map.set(rec.toothNumber, rec);
    }
    setTeeth(Array.from(map.values()));
  };

  const handleRemoveTooth = (toothNumber: number) => {
    setTeeth(teeth.filter((t) => t.toothNumber !== toothNumber));
  };

  const handleRemoveMultipleTeeth = (toothNumbers: number[]) => {
    const set = new Set(toothNumbers);
    setTeeth(teeth.filter((t) => !set.has(t.toothNumber)));
  };

  // Synchronize form values with selected patient when modal opens
  useEffect(() => {
    if (isOpen && patient) {
      setName(patient.name);
      setGender(patient.gender);
      setAge(patient.age ? patient.age.toString() : "");
      setPhone(patient.phone || "");
      setDate(patient.date);
      const paid = patient.paidAmount ?? 0;
      const debt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
      setPaidAmount(paid.toString());
      setDebtAmount(debt.toString());
      setNotes(patient.notes || "");
      setMedicalHistory(patient.medicalHistory || "");
      setTeeth(patient.teeth || []);
      setShowTeethChart(false);
      setError(null);
    }
  }, [isOpen, patient]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const handlePaidChange = (val: string) => {
    setPaidAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter the patient's full name");
      return;
    }
    if (!date) {
      setError("Please select a valid consultation date");
      return;
    }

    const parsedPaid = parseFloat(paidAmount) || 0;
    const parsedDebt = parseFloat(debtAmount) || 0;

    onUpdatePatient({
      ...patient,
      name: name.trim(),
      gender,
      age: age ? parseInt(age, 10) : undefined,
      phone: phone.trim() || undefined,
      date,
      totalAmount: parsedPaid + parsedDebt,
      paidAmount: parsedPaid,
      debtAmount: parsedDebt,
      notes: notes.trim() || undefined,
      medicalHistory: medicalHistory.trim() || undefined,
      teeth,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div
        className={`w-full ${
          showTeethChart ? "max-w-5xl" : "max-w-xl"
        } bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90dvh] sm:h-auto sm:max-h-[92vh] animate-in slide-in-from-bottom-5 sm:zoom-in-95 transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70">
          <div>
            <h2
              id="edit-modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Edit Patient Case
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Modify consultation details, paid amounts & debts
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Gender Selector with distinct SVG previews */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Gender Identification *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  gender === "male"
                    ? "border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-sky-500/20 text-slate-900 dark:text-slate-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                }`}
              >
                <PatientAvatar gender="male" size="md" showBadge={false} />
                <div className="flex-1">
                  <div className="text-sm font-semibold flex items-center justify-between">
                    <span>Male</span>
                    <span className="text-sky-600 dark:text-sky-400 text-xs font-bold">♂</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient case</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left ${
                  gender === "female"
                    ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-500/20 text-slate-900 dark:text-slate-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                }`}
              >
                <PatientAvatar gender="female" size="md" showBadge={false} />
                <div className="flex-1">
                  <div className="text-sm font-semibold flex items-center justify-between">
                    <span>Female</span>
                    <span className="text-rose-500 dark:text-rose-400 text-xs font-bold">♀</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Patient case</p>
                </div>
              </button>
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label
              htmlFor="edit-patient-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              Patient Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="edit-patient-name"
                type="text"
                required
                placeholder="e.g. John Doe, Sarah Jenkins"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-all"
              />
            </div>
          </div>

          {/* Age & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="edit-patient-age"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                Age (Years)
              </label>
              <input
                id="edit-patient-age"
                type="number"
                min="1"
                max="120"
                placeholder="e.g. 32"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="edit-patient-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                Phone (WhatsApp / Call)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  id="edit-patient-phone"
                  type="tel"
                  placeholder="e.g. 0770 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Consultation Date */}
          <div>
            <label
              htmlFor="edit-patient-date"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              Case / Visit Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="edit-patient-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-all"
              />
            </div>
          </div>

          {/* Payment: Paid & Debt */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-indigo-500" />
              <span>Payment (IQD)</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Amount Paid */}
              <div>
                <label
                  htmlFor="edit-patient-paid"
                  className="block text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mb-1"
                >
                  Paid (IQD)
                </label>
                <input
                  id="edit-patient-paid"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="25000"
                  value={paidAmount}
                  onChange={(e) => handlePaidChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Remaining Debt */}
              <div>
                <label
                  htmlFor="edit-patient-debt"
                  className="block text-[11px] font-medium text-rose-600 dark:text-rose-400 mb-1"
                >
                  Debt (IQD)
                </label>
                <input
                  id="edit-patient-debt"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>
          </div>

          {/* Notes / Current Case Diagnosis */}
          <div>
            <label
              htmlFor="edit-patient-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              Current Case Notes / Symptoms <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="edit-patient-notes"
                rows={2}
                placeholder="e.g. Routine checkup, ECG normal, prescribed amoxicillin..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-all resize-none"
              />
            </div>
          </div>

          {/* Past Medical History / Pre-existing Conditions */}
          <div>
            <label
              htmlFor="edit-patient-medical-history"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              Past Medical History / Allergies <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="edit-patient-medical-history"
              rows={2}
              placeholder="e.g. Hypertension (Stage 1), Penicillin allergy, Type 2 diabetes..."
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-all resize-none"
            />
          </div>

          {/* FDI Teeth Chart / Odontogram Section */}
          <div className="border border-indigo-100 dark:border-indigo-900/60 rounded-2xl bg-indigo-50/30 dark:bg-indigo-950/20 overflow-hidden shadow-xs transition-all">
            <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl flex-shrink-0">🦷</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      Teeth Chart / FDI Odontogram
                    </h3>
                    <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {teeth.length} Worked
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                    View and update treated teeth, fillings, root canals, or extractions
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTeethChart(!showTeethChart)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 border ${
                  showTeethChart
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600 shadow-sm shadow-indigo-600/20"
                }`}
              >
                {showTeethChart ? "Hide Teeth Chart" : teeth.length > 0 ? "Edit Teeth Chart" : "+ Open Teeth Chart"}
              </button>
            </div>

            {showTeethChart && (
              <div className="p-2 sm:p-4 border-t border-indigo-100 dark:border-indigo-900/50 bg-white/70 dark:bg-slate-900/70">
                <DentalChart
                  teethRecords={teeth}
                  onUpdateTooth={handleUpdateTooth}
                  onUpdateMultipleTeeth={handleUpdateMultipleTeeth}
                  onRemoveTooth={handleRemoveTooth}
                  onRemoveMultipleTeeth={handleRemoveMultipleTeeth}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
