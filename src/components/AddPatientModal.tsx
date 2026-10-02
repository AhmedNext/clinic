"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Banknote,
  CheckCircle2,
  AlertCircle,
  Check,
} from "lucide-react";
import {
  Gender,
  Patient,
  formatIQD,
  formatNumberWithCommas,
  parseCleanNumber,
  QUICK_IQD_CHIPS,
} from "@/types/patient";
import { ToothRecord } from "@/types/dental";
import { DentalChart } from "./dental/DentalChart";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Column 1 States
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [date, setDate] = useState(initialDate || getTodayString());
  const [time, setTime] = useState("");
  const [autoBookAppointment, setAutoBookAppointment] = useState(false);

  // Column 2 States (Smart Financials & Clinical)
  const [totalPrice, setTotalPrice] = useState<string>("0");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [teeth, setTeeth] = useState<ToothRecord[]>([]);
  const [showTeethChart, setShowTeethChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculated balance due
  const parsedTotal = parseCleanNumber(totalPrice);
  const parsedPaid = parseCleanNumber(paidAmount);
  const balanceDue = Math.max(0, parsedTotal - parsedPaid);

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
      setTotalPrice("0");
      setPaidAmount("0");
      setNotes("");
      setTeeth([]);
      setShowTeethChart(false);
      setError(null);
    }
  }, [isOpen, initialDate]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (showTeethChart) {
          setShowTeethChart(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showTeethChart, onClose]);

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

    onAddPatient(
      {
        name: name.trim(),
        gender,
        age: age ? parseInt(age, 10) : undefined,
        phone: phone.trim() || undefined,
        date,
        time: time.trim() || undefined,
        totalAmount: parsedTotal,
        paidAmount: parsedPaid,
        debtAmount: balanceDue,
        notes: notes.trim() || undefined,
        teeth: teeth.length > 0 ? teeth : undefined,
      },
      { autoBookAppointment }
    );
    onClose();
  };

  // Helper summary text for selected teeth badge
  const teethSummaryBadge =
    teeth.length === 0
      ? null
      : teeth.length === 1
      ? `Tooth #${teeth[0].toothNumber} Selected (Click to edit)`
      : `${teeth.length} Teeth Selected: ${teeth
          .map((t) => `#${t.toothNumber}`)
          .slice(0, 3)
          .join(", ")}${teeth.length > 3 ? "..." : ""} (Click to edit)`;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-patient-title"
      >
        <div
          className={`w-full ${
            showTeethChart ? "hidden sm:flex sm:max-w-5xl" : "max-w-3xl"
          } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200 transition-all`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
            <div>
              <h2
                id="add-patient-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight"
              >
                {t.addPatient}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register new patient and record initial visit details
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body with generous pb-32 so sticky footer never overlaps content */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 sm:pb-32 space-y-4 text-start relative"
          >
            {error && (
              <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Compact 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* ──────── COLUMN 1: PATIENT & APPOINTMENT DETAILS ──────── */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    1. Patient Details
                  </span>
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="patient-name-input"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    {t.name} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="patient-name-input"
                      type="text"
                      autoFocus
                      required
                      placeholder="Patient Full Name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                {/* Gender Segmented Switch */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.gender}
                  </label>
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => setGender("male")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        gender === "male"
                          ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <span>♂</span>
                      <span>{t.male}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("female")}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        gender === "female"
                          ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      }`}
                    >
                      <span>♀</span>
                      <span>{t.female}</span>
                    </button>
                  </div>
                </div>

                {/* Age & Phone Number side-by-side */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="patient-age-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t.age}
                    </label>
                    <input
                      id="patient-age-input"
                      type="number"
                      min="1"
                      max="120"
                      placeholder="e.g. 35"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-medium transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="patient-phone-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t.phone}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-2.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="patient-phone-input"
                        type="tel"
                        placeholder="0770..."
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full ps-8 pe-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-medium transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Consultation Date & Visit Time */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="patient-date-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t.date} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-2.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="patient-date-input"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full ps-8 pe-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="patient-time-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    >
                      {t.time}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 start-0 ps-2.5 flex items-center pointer-events-none text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        id="patient-time-input"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full ps-8 pe-2 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule in Calendar Checkbox */}
                <label
                  htmlFor="auto-schedule-checkbox"
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 cursor-pointer select-none group"
                >
                  <input
                    id="auto-schedule-checkbox"
                    type="checkbox"
                    checked={autoBookAppointment}
                    onChange={(e) => setAutoBookAppointment(e.target.checked)}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                    Schedule in calendar
                  </span>
                </label>
              </div>

              {/* ──────── COLUMN 2: TREATMENT, BILLING & CLINICAL ──────── */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    2. Billing & Clinical
                  </span>
                </div>

                {/* Smart Financials Box */}
                <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Total Fee */}
                    <div>
                      <label
                        htmlFor="patient-total-fee"
                        className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
                      >
                        Total Treatment Fee (IQD)
                      </label>
                      <input
                        id="patient-total-fee"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={totalPrice}
                        onChange={(e) =>
                          setTotalPrice(formatNumberWithCommas(e.target.value))
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                      />
                    </div>

                    {/* Amount Paid */}
                    <div>
                      <label
                        htmlFor="patient-amount-paid"
                        className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1"
                      >
                        Amount Paid (IQD)
                      </label>
                      <input
                        id="patient-amount-paid"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={paidAmount}
                        onChange={(e) =>
                          setPaidAmount(formatNumberWithCommas(e.target.value))
                        }
                        className="w-full px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick-Pick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    {QUICK_IQD_CHIPS.map((chipVal) => (
                      <button
                        key={chipVal}
                        type="button"
                        onClick={() => setPaidAmount(chipVal.toLocaleString("en-US"))}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                          parsedPaid === chipVal
                            ? "bg-emerald-600 text-white shadow-2xs"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:text-emerald-600"
                        }`}
                      >
                        {chipVal >= 1000 ? `${chipVal / 1000}k` : chipVal}
                      </button>
                    ))}
                    {parsedTotal > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaidAmount(parsedTotal.toLocaleString("en-US"))}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        Full
                      </button>
                    )}
                    {parsedPaid > 0 && (
                      <button
                        type="button"
                        onClick={() => setPaidAmount("0")}
                        className="px-1.5 py-0.5 rounded-lg text-[11px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Dynamic Balance Due Banner */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Calculated Status:
                    </span>
                    {balanceDue > 0 ? (
                      <Badge variant="destructive" className="tabular-nums font-mono text-[11px]">
                        Balance Due: {formatIQD(balanceDue)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[11px]">
                        ✓ Fully Settled
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Clinical Notes / Diagnosis (Compact 2-row textarea) */}
                <div>
                  <label
                    htmlFor="patient-notes-input"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    {t.notes}
                  </label>
                  <textarea
                    id="patient-notes-input"
                    rows={2}
                    placeholder={t.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs sm:text-sm font-medium transition-all resize-none"
                  />
                </div>

                {/* Odontogram / Teeth Chart Trigger */}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTeethChart(true)}
                    className="w-full justify-between h-9 rounded-xl border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-400 text-slate-700 dark:text-slate-200"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span>🦷</span>
                      <span>
                        {teeth.length > 0 ? "Edit Treated Teeth" : "Select Treated Teeth"}
                      </span>
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {teeth.length} {t.workedTeeth}
                    </Badge>
                  </Button>

                  {/* Clean Selected Teeth Badge */}
                  {teethSummaryBadge && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowTeethChart(true)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors cursor-pointer text-start"
                      >
                        <span>🦷</span>
                        <span>{teethSummaryBadge}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop-only Inline FDI Teeth Chart */}
            {showTeethChart && (
              <div className="hidden sm:block mt-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {t.fdiOdontogram}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowTeethChart(false)}
                    className="h-7 text-xs font-semibold"
                  >
                    Done
                  </Button>
                </div>
                <DentalChart
                  teethRecords={teeth}
                  onUpdateTooth={handleUpdateTooth}
                  onUpdateMultipleTeeth={handleUpdateMultipleTeeth}
                  onRemoveTooth={handleRemoveTooth}
                  onRemoveMultipleTeeth={handleRemoveMultipleTeeth}
                />
              </div>
            )}
          </form>

          {/* Sticky Modal Footer (Fixed at the bottom of the modal container) */}
          <div className="p-3.5 sm:px-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0 shadow-lg">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t.cancel}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Patient</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── MOBILE FULL-SCREEN TEETH CHART MODAL (< sm breakpoint) ── */}
      {showTeethChart && (
        <div className="sm:hidden fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          {/* Top Bar with Prominent "Done" Button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🦷</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {t.fdiOdontogram}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {teeth.length} {t.workedTeeth}
                </p>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={() => setShowTeethChart(false)}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 h-8 rounded-xl shadow-xs"
            >
              <Check className="w-4 h-4 me-1" />
              <span>Done</span>
            </Button>
          </div>

          {/* Full Screen Chart Canvas */}
          <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 dark:bg-slate-950">
            <DentalChart
              teethRecords={teeth}
              onUpdateTooth={handleUpdateTooth}
              onUpdateMultipleTeeth={handleUpdateMultipleTeeth}
              onRemoveTooth={handleRemoveTooth}
              onRemoveMultipleTeeth={handleRemoveMultipleTeeth}
            />
          </div>
        </div>
      )}
    </>
  );
}
