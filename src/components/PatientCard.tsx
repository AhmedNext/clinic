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
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 shadow-2xs hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-200 p-3.5 sm:p-4 gap-3 overflow-hidden">
      {/* Sleek top gender accent line */}
      <div
        className={`absolute top-0 inset-x-0 h-1 ${
          isMale
            ? "bg-gradient-to-r from-sky-400 via-indigo-500 to-indigo-600"
            : "bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600"
        }`}
      />

      {/* Top Header: Avatar + Name + Badges + Quick Actions */}
      <div className="flex items-start justify-between gap-2.5 pt-0.5">
        <div className="flex items-center gap-3 min-w-0">
          <PatientAvatar gender={patient.gender} size="md" />
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {patient.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              <span
                className={`font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] ${
                  isMale
                    ? "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60"
                    : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60"
                }`}
              >
                <span>{isMale ? "♂" : "♀"}</span>
                <span>{isMale ? t.male : t.female}</span>
              </span>

              {patient.age && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  • {patient.age}y
                </span>
              )}

              {visitsCount > 0 && (
                <button
                  type="button"
                  onClick={() => onViewHistory(patient)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer ml-0.5"
                  title="View visit history"
                >
                  <History className="w-3 h-3" />
                  <span>
                    {visitsCount} {visitsCount === 1 ? t.visit : t.visits}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-0.5 flex-shrink-0 -mr-1">
          <button
            onClick={() => onViewHistory(patient)}
            title="History timeline"
            aria-label="View history"
            className="relative p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all cursor-pointer active:scale-90"
          >
            <History className="w-4 h-4" />
            {visitsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center rounded-full bg-indigo-600 text-white">
                {visitsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onEditPatient(patient)}
            title="Edit patient"
            aria-label="Edit patient"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-90"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeletePatient(patient.id)}
            title="Delete patient"
            aria-label="Delete patient"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer active:scale-90"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle: Interactive Date/Time Pill + Payment Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Date & Time unified capsule */}
        <div className="inline-flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-0.5 text-xs text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            title="Tap to change date"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer active:scale-95 font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold">{formatStaticDate(patient.date)}</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700 select-none px-0.5">|</span>
          <button
            type="button"
            onClick={() => setIsClockPickerOpen(true)}
            title="Tap to change time"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer active:scale-95 font-medium"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span
              className={`text-[11px] font-semibold ${
                patient.time
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 italic"
              }`}
            >
              {patient.time || t.setTime}
            </span>
          </button>
        </div>

        {/* Financial Status */}
        <div>
          {debt > 0 ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
              <span className="text-[11px] font-bold">
                {t.owesLabel} {formatIQD(debt)}
              </span>
              {onSettleDebt && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSettleDebt(patient);
                  }}
                  className="ml-0.5 px-1.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs cursor-pointer active:scale-90 transition-all text-[10px] font-bold inline-flex items-center gap-0.5"
                  title={t.markDebtPaid}
                >
                  <Check className="w-3 h-3" />
                  <span>{t.markDebtPaid}</span>
                </button>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span>✓</span>
              <span className="text-[11px] font-bold">{t.fullyPaid}</span>
              <span className="text-[10px] opacity-75 font-mono">({formatIQD(paid)})</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Row: Dental Chart + Phone / WhatsApp Contact */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {/* 3D Dental Chart Trigger */}
        <button
          type="button"
          onClick={() => onOpenDentalChart(patient)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/80 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/70 dark:border-slate-700/80 transition-all cursor-pointer active:scale-95"
        >
          <span>🦷</span>
          <span className="text-[11px]">
            {(patient.teeth?.length ?? 0) > 0
              ? `${patient.teeth!.length} ${t.teethCount}`
              : t.dentalChartBtn}
          </span>
        </button>

        {/* Phone & WhatsApp Contact buttons */}
        {patient.phone ? (
          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${patient.phone}`}
              title={`${t.call} ${patient.phone}`}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono text-[11px] hidden xs:inline">{patient.phone}</span>
            </a>
            <a
              href={getWhatsAppUrl(patient.phone, patient.name)}
              target="_blank"
              rel="noopener noreferrer"
              title={`${t.whatsApp} ${patient.name}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-xs">💬</span>
              <span className="text-[11px]">{t.whatsApp}</span>
            </a>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No phone</span>
        )}
      </div>

      {/* Notes / Latest History Snippet (Clean, subtle single-line preview) */}
      {patient.notes ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="line-clamp-1 text-[11px]">{patient.notes}</span>
        </div>
      ) : sortedHistory.length > 0 && sortedHistory[0].title ? (
        <button
          type="button"
          onClick={() => onViewHistory(patient)}
          className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg border border-indigo-100/80 dark:border-indigo-900/40 hover:bg-indigo-50 text-left rtl:text-right transition-colors cursor-pointer"
        >
          <span className="truncate">
            {t.latest}: {sortedHistory[0].title}
          </span>
          <span className="text-[10px] font-bold ml-1 rtl:ml-0 rtl:mr-1">→</span>
        </button>
      ) : null}

      {/* Circle Clock Picker Modal */}
      <CircleClockPickerModal
        isOpen={isClockPickerOpen}
        initialTime={patient.time}
        patientName={patient.name}
        onClose={() => setIsClockPickerOpen(false)}
        onSaveTime={handleSaveTime}
      />

      {/* Interactive Calendar Date Picker Modal */}
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
