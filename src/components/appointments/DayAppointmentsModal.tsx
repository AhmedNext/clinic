"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Clock,
  Phone,
  User,
  Calendar,
  Trash2,
  CheckCircle2,
  Circle,
  FileText,
  Sparkles,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Patient, getWhatsAppUrl } from "@/types/patient";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { formatStaticDate, WEEKDAY_NAMES } from "@/utils/date";
import { CircleClockPickerModal } from "@/components/ui/CircleClockPickerModal";

interface DayAppointmentsModalProps {
  isOpen: boolean;
  dateString: string; // YYYY-MM-DD
  appointments: Appointment[];
  existingPatients: Patient[];
  onClose: () => void;
  onAddAppointment: (data: Omit<Appointment, "id" | "createdAt">) => void;
  onToggleStatus: (id: string, newStatus: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenAddPatient?: (dateString: string) => void;
}

const COMMON_PROCEDURES = [
  "General Consultation",
  "Routine Dental Cleaning",
  "Composite Filling",
  "Root Canal Therapy",
  "Crown / Bridge Fitting",
  "Tooth Extraction",
  "Orthodontic Adjustment",
  "Emergency Relief",
];

const TIME_PRESETS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

export function DayAppointmentsModal({
  isOpen,
  dateString,
  appointments,
  existingPatients,
  onClose,
  onAddAppointment,
  onToggleStatus,
  onDeleteAppointment,
  onOpenAddPatient,
}: DayAppointmentsModalProps) {
  const { language, t } = useLanguage();
  const { settings } = useClinicSettings();
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [treatment, setTreatment] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(appointments.length === 0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Format date nicely e.g., "Saturday, Sep 26, 2026"
  const formattedDate = (() => {
    try {
      const [y, m, d] = dateString.split("-").map(Number);
      if (y && m && d) {
        const dt = new Date(y, m - 1, d);
        const dayName = WEEKDAY_NAMES[language]?.[dt.getDay()] || "";
        const formatted = formatStaticDate(dateString, language);
        return `${dayName} • ${formatted}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  })();

  const handleSelectPatient = (patient: Patient) => {
    setPatientName(patient.name);
    if (patient.phone) setPhone(patient.phone);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setError("Please enter the patient's name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter the patient's phone number.");
      return;
    }

    onAddAppointment({
      patientName: patientName.trim(),
      phone: phone.trim(),
      date: dateString,
      time: time || "10:00 AM",
      treatment: treatment.trim() || undefined,
      notes: notes.trim() || undefined,
      status: "scheduled",
    });

    // Reset form
    setPatientName("");
    setPhone("");
    setTreatment("");
    setNotes("");
    setError(null);
    setShowAddForm(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-slate-950/80 transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-appointments-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border-0 sm:border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92dvh] sm:h-auto sm:max-h-[90vh] animate-in slide-in-from-bottom-5 sm:zoom-in-95">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="day-appointments-title"
                className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate"
              >
                {formattedDate}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {appointments.length} {t.scheduled}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAddPatient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddPatient(dateString);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-2xs transition-all cursor-pointer"
                title={t.bookPatientCase}
              >
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">{t.bookPatientCase}</span>
              </button>
            )}
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addPatient}</span>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Add Appointment Form */}
          {showAddForm && (
            <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t.addAppointment} ({formattedDate})</span>
                </h3>
                {appointments.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 transition-colors cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.name} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* Autocomplete suggestions from existing patients */}
                  {existingPatients.length > 0 && !patientName && (
                    <div className="mt-2 flex items-center flex-wrap gap-1.5 text-[11px]">
                      <span className="text-slate-400 font-medium">{t.quickSelect}</span>
                      {existingPatients.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPatient(p)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone & Time row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.phone} <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder={t.phonePlaceholder}
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          setError(null);
                        }}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                      <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none text-slate-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder={t.timePlaceholder}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full pl-9 rtl:pl-20 rtl:pr-9 pr-20 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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

                {/* Time presets */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {TIME_PRESETS.map((tPreset) => (
                    <button
                      key={tPreset}
                      type="button"
                      onClick={() => setTime(tPreset)}
                      className={`px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        time === tPreset
                          ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      {tPreset}
                    </button>
                  ))}
                </div>

                {/* Procedure / Treatment */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.procedureTitle}
                  </label>
                  <input
                    type="text"
                    placeholder={t.appointmentReasonPlaceholder}
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  {/* Common procedures chips */}
                  <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                    {[
                      t.commonConsultation,
                      t.commonCleaning,
                      t.commonFilling,
                      t.commonRootCanal,
                    ].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setTreatment(p)}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.notes}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={t.appointmentNotesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  {appointments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t.save}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of existing appointments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{t.scheduled} ({appointments.length})</span>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another</span>
                </button>
              )}
            </h3>

            {appointments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No appointments booked for this day
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Click the button above to schedule a patient visit.
                </p>
              </div>
            ) : (
              appointments.map((apt) => {
                const isDone = apt.status === "completed";

                return (
                  <div
                    key={apt.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDone
                        ? "bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-80"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status toggle button */}
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(
                            apt.id,
                            isDone ? "scheduled" : "completed"
                          )
                        }
                        title={
                          isDone ? "Mark as Scheduled" : "Mark as Completed"
                        }
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-semibold text-sm ${
                              isDone
                                ? "line-through text-slate-500 dark:text-slate-400"
                                : "text-slate-900 dark:text-slate-100"
                            }`}
                          >
                            {apt.patientName}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isDone
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>

                        {/* Phone, WhatsApp & Time Info */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <a
                            href={`tel:${apt.phone}`}
                            className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-sky-500" />
                            <span className="font-mono">{apt.phone}</span>
                          </a>

                          <a
                            href={getWhatsAppUrl({
                              phone: apt.phone,
                              patientName: apt.patientName,
                              clinicName: settings.clinicName,
                              date: apt.date || dateString,
                              time: apt.time,
                              language,
                              gender: existingPatients.find(
                                (p) =>
                                  p.name.toLowerCase() === apt.patientName.toLowerCase() ||
                                  (apt.phone && p.phone === apt.phone)
                              )?.gender,
                            })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 text-[11px] hover:scale-105 active:scale-95 transition-transform"
                          >
                            <span>💬</span>
                            <span>WhatsApp</span>
                          </a>

                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{apt.time}</span>
                          </span>

                          {apt.treatment && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              🦷 {apt.treatment}
                            </span>
                          )}
                        </div>

                        {apt.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                            {apt.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1 sm:self-center">
                      <button
                        type="button"
                        onClick={() => onDeleteAppointment(apt.id)}
                        title="Remove appointment"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {t.done}
          </button>
        </div>
      </div>

      {/* Circle Clock Picker Modal (Analog Clock Dial) */}
      <CircleClockPickerModal
        isOpen={isClockPickerOpen}
        initialTime={time}
        patientName={patientName || "Appointment"}
        onClose={() => setIsClockPickerOpen(false)}
        onSaveTime={(newTime) => setTime(newTime)}
      />
    </div>
  );
}
