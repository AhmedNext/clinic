"use client";

import React, { useState } from "react";
import { Patient, calculateDebt, formatIQD, getWhatsAppUrl } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import {
  Calendar,
  Clock,
  Trash2,
  FileText,
  Pencil,
  History,
  Phone,
  Check,
} from "lucide-react";
import { formatStaticDate } from "@/utils/date";
import { CircleClockPickerModal } from "./ui/CircleClockPickerModal";
import { BetterDatePickerModal } from "./ui/BetterDatePickerModal";
import { useLanguage } from "@/context/LanguageContext";

interface PatientCardProps {
  patient: Patient;
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onOpenDentalChart: (patient: Patient) => void;
  onSettleDebt?: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
}

export const PatientCard = React.memo(function PatientCard({
  patient,
  onDeletePatient,
  onEditPatient,
  onViewHistory,
  onOpenDentalChart,
  onSettleDebt,
  onUpdatePatient,
}: PatientCardProps) {
  const { t } = useLanguage();
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const isMale = patient.gender === "male";
  const debt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
  const paid = patient.paidAmount ?? 0;

  const sortedHistory = [...(patient.history || [])].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );
  const visitsCount = sortedHistory.length;

  const handleSaveTime = (newTime: string) => {
    if (onUpdatePatient) {
      onUpdatePatient({
        ...patient,
        time: newTime || undefined,
      });
    }
  };

  const handleSaveDate = (newDate: string) => {
    if (onUpdatePatient && newDate) {
      onUpdatePatient({
        ...patient,
        date: newDate,
      });
    }
  };

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-2xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* ── TOP COLOUR BAR ── */}
      <div
        className={`h-1.5 w-full ${
          isMale
            ? "bg-gradient-to-r from-sky-400 via-indigo-500 to-indigo-600"
            : "bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600"
        }`}
      />

      {/* ── MAIN BODY ── */}
      <div className="p-4 flex flex-col gap-3">
        {/* Row 1: Avatar + Info + Action icons */}
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + name + badges */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <PatientAvatar gender={patient.gender} size="lg" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {patient.name}
              </h3>
              {/* Badges row */}
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isMale
                      ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  }`}
                >
                  <span>{isMale ? "♂" : "♀"}</span>
                  <span className="capitalize">{isMale ? t.male : t.female}</span>
                </span>

                {patient.age && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {patient.age}y
                  </span>
                )}

                <span
                  onClick={() => onViewHistory(patient)}
                  title="Click to view visit history"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                    visitsCount > 0
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <History className="w-3 h-3 text-indigo-500" />
                  <span>
                    {visitsCount} {visitsCount === 1 ? t.visit : t.visits}
                  </span>
                </span>

                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                  #{patient.id.slice(0, 6)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick action icons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => onViewHistory(patient)}
              title="History timeline"
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all cursor-pointer active:scale-90"
            >
              <History className="w-4 h-4" />
              {(patient.history?.length ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center rounded-full bg-indigo-600 text-white">
                  {patient.history!.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onEditPatient(patient)}
              title="Edit patient"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeletePatient(patient.id)}
              title="Delete patient"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer active:scale-90"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── ROW 2: INTERACTIVE DATE & CIRCLE CLOCK TIME BUTTONS (Tap on phone) ── */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200/70 dark:border-slate-800/60">
          {/* Better Date Picker Trigger */}
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            title="Tap to change visit date"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left rtl:text-right transition-all cursor-pointer active:scale-95 shadow-2xs group/date"
          >
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 group-hover/date:bg-indigo-600 group-hover/date:text-white transition-colors">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                {t.date}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                {formatStaticDate(patient.date)}
              </span>
            </div>
          </button>

          {/* Circle Clock Picker Trigger */}
          <button
            type="button"
            onClick={() => setIsClockPickerOpen(true)}
            title="Tap to choose time with circle clock"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 text-left rtl:text-right transition-all cursor-pointer active:scale-95 shadow-2xs group/time"
          >
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 group-hover/time:bg-indigo-600 group-hover/time:text-white transition-colors">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-none">
                {t.time}
              </span>
              <span
                className={`text-xs font-bold truncate block mt-0.5 ${
                  patient.time
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 italic font-medium"
                }`}
              >
                {patient.time || t.setTime}
              </span>
            </div>
          </button>
        </div>

        {/* Row 3: Payment status strip */}
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
            debt > 0
              ? "bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40"
              : "bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40"
          }`}
        >
          <span className="text-slate-500 dark:text-slate-400">
            {t.paidLabel}:{" "}
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">
              {formatIQD(paid)}
            </strong>
          </span>
          {debt > 0 ? (
            <div className="flex items-center gap-2">
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {t.owesLabel} {formatIQD(debt)}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSettleDebt?.(patient);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                title="Click to mark debt as paid"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t.markDebtPaid}</span>
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <span>✓</span>
              <span>{t.fullyPaid}</span>
            </span>
          )}
        </div>

        {/* Row 4: Contact buttons */}
        {patient.phone && (
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${patient.phone}`}
              title={`${t.call} ${patient.phone}`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 dark:hover:bg-sky-950/40 dark:hover:text-sky-300 active:scale-95 transition-all text-xs font-semibold"
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500 dark:text-slate-400" />
              <span className="font-mono truncate">{patient.phone}</span>
            </a>
            <a
              href={getWhatsAppUrl(patient.phone, patient.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${t.whatsApp} ${patient.name}`}
              className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xs hover:shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all text-xs font-bold cursor-pointer"
            >
              <span className="text-sm leading-none">💬</span>
              <span>{t.whatsApp}</span>
            </a>
          </div>
        )}

        {/* Row 5: Dental chart button */}
        <button
          type="button"
          onClick={() => onOpenDentalChart(patient)}
          className="group/dent w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-50/90 via-slate-50 to-violet-50/90 dark:from-indigo-950/40 dark:via-slate-900 dark:to-violet-950/40 hover:from-indigo-100 hover:to-violet-100 dark:hover:from-indigo-900/60 dark:hover:to-violet-900/60 border border-indigo-200/80 dark:border-indigo-800/70 text-indigo-900 dark:text-indigo-200 transition-all cursor-pointer active:scale-[0.98] shadow-2xs"
        >
          <span className="inline-flex items-center gap-2">
            <span className="text-base group-hover/dent:scale-110 transition-transform inline-block">
              🦷
            </span>
            <span className="tracking-tight">{t.dentalChartBtn}</span>
          </span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
              (patient.teeth?.length ?? 0) > 0
                ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                : "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
            }`}
          >
            {patient.teeth?.length ?? 0} {t.teethCount}
          </span>
        </button>

        {/* Row 6: Latest Treatment / History Snippet */}
        {sortedHistory.length > 0 && (
          <button
            type="button"
            onClick={() => onViewHistory(patient)}
            className="w-full text-left rtl:text-right p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group/hist"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 truncate">
                <History className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="truncate">{t.latest}: {sortedHistory[0].title}</span>
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0 ml-1 rtl:ml-0 rtl:mr-1">
                {visitsCount} {visitsCount === 1 ? t.visit : t.visits} →
              </span>
            </div>
            {sortedHistory[0].notes ? (
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1">
                {sortedHistory[0].notes}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-mono">
                {formatStaticDate(sortedHistory[0].date)}
              </p>
            )}
          </button>
        )}
      </div>

      {/* ── FOOTER: Clinical Notes & History link ── */}
      <div className="px-4 pb-4 pt-0 space-y-2">
        {patient.notes ? (
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400" />
            <p className="line-clamp-2 leading-relaxed">{patient.notes}</p>
          </div>
        ) : (
          <p className="text-[11px] italic text-slate-300 dark:text-slate-700">No notes</p>
        )}
      </div>

      {/* Circle Clock Picker Modal (Analog Clock Dial) */}
      <CircleClockPickerModal
        isOpen={isClockPickerOpen}
        initialTime={patient.time}
        patientName={patient.name}
        onClose={() => setIsClockPickerOpen(false)}
        onSaveTime={handleSaveTime}
      />

      {/* Better Interactive Calendar Date Picker Modal */}
      <BetterDatePickerModal
        isOpen={isDatePickerOpen}
        initialDate={patient.date}
        patientName={patient.name}
        onClose={() => setIsDatePickerOpen(false)}
        onSaveDate={handleSaveDate}
      />
    </div>
  );
});
