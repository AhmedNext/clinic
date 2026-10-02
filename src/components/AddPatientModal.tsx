"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText, CheckCircle2, Banknote, Phone, Calculator } from "lucide-react";
import { Gender, Patient, formatIQD, formatNumberWithCommas, parseCleanNumber, QUICK_IQD_CHIPS } from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { DentalChart } from "./dental/DentalChart";
import { PatientAvatar } from "./PatientAvatar";
import { CircleClockPickerModal } from "./ui/CircleClockPickerModal";
import { BetterDatePickerModal } from "./ui/BetterDatePickerModal";
import { useLanguage } from "@/context/LanguageContext";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (
    patient: Omit<Patient, "id">,
    options?: { autoBookAppointment?: boolean }
  ) => void;
  initialDate?: string;
}

export function AddPatientModal({
  isOpen,
  onClose,
  onAddPatient,
  initialDate,
}: AddPatientModalProps) {
  const { t } = useLanguage();
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [date, setDate] = useState(initialDate || getTodayString());
  const [time, setTime] = useState("");
  const [autoBookAppointment, setAutoBookAppointment] = useState(false);
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setGender("male");
      setAge("");
      setPhone("");
      setDate(initialDate || getTodayString());
      setTime("");
      setAutoBookAppointment(false);
      setPaidAmount("0");
      setDebtAmount("0");
      setNotes("");
      setMedicalHistory("");
      setTeeth([]);
      setShowTeethChart(false);
      setError(null);
    }
  }, [isOpen, initialDate]);

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

  if (!isOpen) return null;

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

    const parsedPaid = parseCleanNumber(paidAmount);
    const parsedDebt = parseCleanNumber(debtAmount);

    onAddPatient(
      {
        name: name.trim(),
        gender,
        age: age ? parseInt(age, 10) : undefined,
        phone: phone.trim() || undefined,
        date,
        time: time.trim() || undefined,
        totalAmount: parsedPaid + parsedDebt,
        paidAmount: parsedPaid,
        debtAmount: parsedDebt,
        notes: notes.trim() || undefined,
        medicalHistory: medicalHistory.trim() || undefined,
        teeth: teeth.length > 0 ? teeth : undefined,
      },
      { autoBookAppointment }
    );
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
      aria-labelledby="modal-title"
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
              id="modal-title"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              {t.addPatient}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.recordPaidAndDebt}
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
              {t.gender} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left rtl:text-right ${
                  gender === "male"
                    ? "border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 ring-2 ring-sky-500/20 text-slate-900 dark:text-slate-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                }`}
              >
                <PatientAvatar gender="male" size="md" showBadge={false} />
                <div className="flex-1">
                  <div className="text-sm font-semibold flex items-center justify-between">
                    <span>{t.male}</span>
                    <span className="text-sky-600 dark:text-sky-400 text-xs font-bold">♂</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.patientCase}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left rtl:text-right ${
                  gender === "female"
                    ? "border-rose-500 bg-rose-50/80 dark:bg-rose-950/40 ring-2 ring-rose-500/20 text-slate-900 dark:text-slate-100"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                }`}
              >
                <PatientAvatar gender="female" size="md" showBadge={false} />
                <div className="flex-1">
                  <div className="text-sm font-semibold flex items-center justify-between">
                    <span>{t.female}</span>
                    <span className="text-rose-500 dark:text-rose-400 text-xs font-bold">♀</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.patientCase}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Patient Name */}
          <div>
            <label
              htmlFor="patient-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              {t.name} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="patient-name"
                type="text"
                autoFocus
                required
                placeholder={t.namePlaceholder}
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
                htmlFor="patient-age"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                {t.age}
              </label>
              <input
                id="patient-age"
                type="number"
                min="1"
                max="120"
                placeholder={t.agePlaceholder}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="patient-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
              >
                {t.phone}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  id="patient-phone"
                  type="tel"
                  placeholder={t.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 rtl:pl-3.5 rtl:pr-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Case Date & Visit Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Consultation Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="patient-date"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {t.date} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {t.betterCalendar}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="patient-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-all"
                />
              </div>
            </div>

            {/* Visit Time */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="patient-time"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {t.time}
                </label>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  id="patient-time"
                  type="text"
                  placeholder={t.timePlaceholder}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full ps-10 pe-20 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsClockPickerOpen(true)}
                  className="absolute end-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-xs font-bold cursor-pointer"
                >
                  {t.clockBtn}
                </button>
              </div>
            </div>
          </div>

          {/* Auto-Schedule in Calendar Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20">
            <label
              htmlFor="auto-book-apt"
              className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-900 dark:text-indigo-200 select-none"
            >
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t.autoBookAppointment}</span>
            </label>
            <input
              id="auto-book-apt"
              type="checkbox"
              checked={autoBookAppointment}
              onChange={(e) => setAutoBookAppointment(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Financial: Paid & Debt */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 space-y-3 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-indigo-500" />
              <span>{t.paidLabel} & {t.remainingDebt}</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              {/* Paid */}
              <div>
                <label
                  htmlFor="patient-paid"
                  className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1"
                >
                  {t.paidLabel} (IQD)
                </label>
                <input
                  id="patient-paid"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(formatNumberWithCommas(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                />
              </div>

              {/* Debt */}
              <div>
                <label
                  htmlFor="patient-debt"
                  className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1"
                >
                  {t.remainingDebt} (IQD)
                </label>
                <input
                  id="patient-debt"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={debtAmount}
                  onChange={(e) => setDebtAmount(formatNumberWithCommas(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* Quick-Pick Chips: [ 10,000 ] [ 15,000 ] [ 25,000 ] [ 50,000 ] [ 100,000 ] */}
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                    onClick={() => setPaidAmount(chipVal.toLocaleString("en-US"))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      parseCleanNumber(paidAmount) === chipVal
                        ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/30 scale-[1.03]"
                        : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    {chipVal.toLocaleString()}
                  </button>
                ))}
                {paidAmount !== "0" && paidAmount !== "" && (
                  <button
                    type="button"
                    onClick={() => setPaidAmount("0")}
                    className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="0 IQD"
                  >
                    0
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes / Current Diagnosis */}
          <div>
            <label
              htmlFor="patient-notes"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              {t.notes}
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 rtl:left-auto rtl:right-3 pointer-events-none text-slate-400">
                <FileText className="w-4 h-4" />
              </div>
              <textarea
                id="patient-notes"
                rows={2}
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm transition-all resize-none"
              />
            </div>
          </div>

          {/* Past Medical History / Pre-existing Conditions */}
          <div>
            <label
              htmlFor="patient-medical-history"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
            >
              {t.medicalHistoryTitle} <span className="text-slate-400 font-normal lowercase">{t.medicalHistoryOptional}</span>
            </label>
            <textarea
              id="patient-medical-history"
              rows={2}
              placeholder={t.medicalHistoryPlaceholder}
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
                      {t.fdiOdontogram}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {teeth.length} {t.workedTeeth}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                    {t.teethChartSubtext}
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
                {showTeethChart ? t.hideTeethChart : teeth.length > 0 ? t.editTeethChart : t.openTeethChart}
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
              {t.cancel}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Circle Clock Time Picker */}
      <CircleClockPickerModal
        isOpen={isClockPickerOpen}
        initialTime={time}
        patientName={name}
        onClose={() => setIsClockPickerOpen(false)}
        onSaveTime={(newTime) => setTime(newTime)}
      />

      {/* Better Calendar Date Picker */}
      <BetterDatePickerModal
        isOpen={isDatePickerOpen}
        initialDate={date}
        patientName={name}
        onClose={() => setIsDatePickerOpen(false)}
        onSaveDate={(newDate) => setDate(newDate)}
      />
    </div>
  );
}
