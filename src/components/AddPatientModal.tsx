"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, FileText, CheckCircle2, Banknote, Phone, Calculator } from "lucide-react";
import { Gender, Patient, formatIQD } from "@/types/patient";
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
  const [autoBookAppointment, setAutoBookAppointment] = useState(true);
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState<string>("0");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [debtAmount, setDebtAmount] = useState<string>("0");
  const [isCustomDebt, setIsCustomDebt] = useState<boolean>(false);
  const [notes, setNotes] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [teeth, setTeeth] = useState<ToothRecord[]>([]);
  const [showTeethChart, setShowTeethChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync pricing when teeth change in dental chart
  const syncTeethWithPricing = (updatedTeeth: ToothRecord[]) => {
    setTeeth(updatedTeeth);
    const chartTotal = updatedTeeth.reduce((s, r) => s + (r.price || 0), 0);
    if (chartTotal > 0) {
      setTotalAmount(String(chartTotal));
      if (!isCustomDebt) {
        const p = parseFloat(paidAmount) || 0;
        setDebtAmount(String(Math.max(0, chartTotal - p)));
      }
    }
  };

  // Teeth handlers
  const handleUpdateTooth = (record: ToothRecord) => {
    const exists = teeth.some((t) => t.toothNumber === record.toothNumber);
    const updated = exists
      ? teeth.map((t) => (t.toothNumber === record.toothNumber ? record : t))
      : [...teeth, record];
    syncTeethWithPricing(updated);
  };

  const handleUpdateMultipleTeeth = (records: ToothRecord[]) => {
    const map = new Map<number, ToothRecord>(teeth.map((t) => [t.toothNumber, t]));
    for (const rec of records) {
      map.set(rec.toothNumber, rec);
    }
    syncTeethWithPricing(Array.from(map.values()));
  };

  const handleRemoveTooth = (toothNumber: number) => {
    const updated = teeth.filter((t) => t.toothNumber !== toothNumber);
    syncTeethWithPricing(updated);
  };

  const handleRemoveMultipleTeeth = (toothNumbers: number[]) => {
    const set = new Set(toothNumbers);
    const updated = teeth.filter((t) => !set.has(t.toothNumber));
    syncTeethWithPricing(updated);
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
      setAutoBookAppointment(true);
      setTotalAmount("0");
      setPaidAmount("0");
      setDebtAmount("0");
      setIsCustomDebt(false);
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

  const handleTotalChange = (val: string) => {
    setTotalAmount(val);
    if (!isCustomDebt) {
      const tot = parseFloat(val) || 0;
      const p = parseFloat(paidAmount) || 0;
      setDebtAmount(String(Math.max(0, tot - p)));
    }
  };

  const handlePaidChange = (val: string) => {
    setPaidAmount(val);
    if (!isCustomDebt) {
      const tot = parseFloat(totalAmount) || 0;
      const p = parseFloat(val) || 0;
      setDebtAmount(String(Math.max(0, tot - p)));
    }
  };

  const handlePaidInFull = () => {
    const tot = parseFloat(totalAmount) || 0;
    setPaidAmount(String(tot));
    setDebtAmount("0");
    setIsCustomDebt(false);
  };

  const handleUnpaid = () => {
    setPaidAmount("0");
    const tot = parseFloat(totalAmount) || 0;
    setDebtAmount(String(tot));
    setIsCustomDebt(false);
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

    const parsedTotal = parseFloat(totalAmount) || 0;
    const parsedPaid = parseFloat(paidAmount) || 0;
    let parsedDebt = isCustomDebt
      ? (parseFloat(debtAmount) || 0)
      : Math.max(0, parsedTotal - parsedPaid);

    const chartTotal = teeth.reduce((s, r) => s + (r.price || 0), 0);
    const effectiveTotal = parsedTotal > 0
      ? parsedTotal
      : (chartTotal > 0 ? chartTotal : parsedPaid + parsedDebt);

    if (!isCustomDebt && parsedTotal === 0 && chartTotal > 0) {
      parsedDebt = Math.max(0, chartTotal - parsedPaid);
    }

    onAddPatient(
      {
        name: name.trim(),
        gender,
        age: age ? parseInt(age, 10) : undefined,
        phone: phone.trim() || undefined,
        date,
        time: time.trim() || undefined,
        totalAmount: effectiveTotal,
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

            {/* Visit Time (Circle Clock) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="patient-time"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                >
                  {t.time}
                </label>
                <button
                  type="button"
                  onClick={() => setIsClockPickerOpen(true)}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {t.circleClock}
                </button>
              </div>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pl-0 rtl:pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  id="patient-time"
                  type="text"
                  placeholder={t.timePlaceholder}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 rtl:pl-20 rtl:pr-10 pr-20 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setIsClockPickerOpen(true)}
                  className="absolute right-1.5 rtl:right-auto rtl:left-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-bold cursor-pointer"
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

          {/* Simplified Financial & Payment Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-slate-100/40 dark:from-slate-950/60 dark:to-slate-900/40 space-y-3 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-indigo-500" />
                <span>{t.totalTreatmentPrice} & {t.paidLabel}</span>
              </span>
              {teeth.reduce((s, r) => s + (r.price || 0), 0) > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                  <span>🦷</span>
                  <span>{t.syncedFromDentalChart}</span>
                </span>
              )}
            </div>

            {/* Step 1 & 2: Total Price and Amount Paid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Total Treatment Fee */}
              <div>
                <label
                  htmlFor="patient-total"
                  className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.totalTreatmentPrice} (IQD)
                </label>
                <input
                  id="patient-total"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="50000"
                  value={totalAmount}
                  onChange={(e) => handleTotalChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Amount Paid Today */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="patient-paid"
                    className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400"
                  >
                    {t.amountPaidToday} (IQD)
                  </label>
                  {/* Quick-action 1-click shortcuts */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePaidInFull}
                      title={t.paidInFullBtn}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 transition-colors cursor-pointer"
                    >
                      {t.paidInFullBtn}
                    </button>
                    <button
                      type="button"
                      onClick={handleUnpaid}
                      title={t.unpaidBtn}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {t.unpaidBtn}
                    </button>
                  </div>
                </div>
                <input
                  id="patient-paid"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) => handlePaidChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Step 3: Auto-Calculated Remaining Balance / Status Badge */}
            <div className="pt-0.5">
              {!isCustomDebt ? (
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    (parseFloat(debtAmount) || 0) === 0 && (parseFloat(totalAmount) || 0) > 0
                      ? "bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
                      : (parseFloat(debtAmount) || 0) > 0
                      ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200"
                      : "bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {(parseFloat(debtAmount) || 0) === 0 && (parseFloat(totalAmount) || 0) > 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Calculator className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{t.remainingDebt}:</span>
                        <span className="font-mono font-bold text-sm">
                          {formatIQD(parseFloat(debtAmount) || 0)}
                        </span>
                        <span className="text-[10px] opacity-75 font-normal">
                          ({t.autoCalculated})
                        </span>
                      </div>
                      <p className="text-[10px] opacity-80">
                        {(parseFloat(debtAmount) || 0) === 0 && (parseFloat(totalAmount) || 0) > 0
                          ? t.noRemainingDebt
                          : `${formatIQD(parseFloat(totalAmount) || 0)} - ${formatIQD(parseFloat(paidAmount) || 0)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomDebt(true)}
                    className="text-[10px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline cursor-pointer"
                  >
                    {t.manualDebtOverride}
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="patient-debt-override"
                      className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1"
                    >
                      <span>{t.remainingDebt} ({t.manualDebtOverride})</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDebt(false);
                        const tot = parseFloat(totalAmount) || 0;
                        const p = parseFloat(paidAmount) || 0;
                        setDebtAmount(String(Math.max(0, tot - p)));
                      }}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      {t.autoCalculated} ↺
                    </button>
                  </div>
                  <input
                    id="patient-debt-override"
                    type="number"
                    min="0"
                    step="1000"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              )}
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
