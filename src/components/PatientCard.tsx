"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Printer,
  Stethoscope,
  MoreHorizontal,
  X,
  Banknote,
} from "lucide-react";
import { formatStaticDate } from "@/utils/date";
import { CircleClockPickerModal } from "./ui/CircleClockPickerModal";
import { BetterDatePickerModal } from "./ui/BetterDatePickerModal";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

interface PatientCardProps {
  patient: Patient;
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onOpenDentalChart: (patient: Patient) => void;
  onSettleDebt?: (patient: Patient) => void;
  onUpdatePatient?: (patient: Patient) => void;
  onPrintReceipt?: (patient: Patient) => void;
  onPrintPrescription?: (patient: Patient) => void;
}

export const PatientCard = React.memo(function PatientCard({
  patient,
  onDeletePatient,
  onEditPatient,
  onViewHistory,
  onOpenDentalChart,
  onSettleDebt,
  onUpdatePatient,
  onPrintReceipt,
  onPrintPrescription,
}: PatientCardProps) {
  const { t, language } = useLanguage();
  const { settings } = useClinicSettings();
  const { isDoctor } = useAuth();
  const [isClockPickerOpen, setIsClockPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const isMale = patient.gender === "male";
  const debt = calculateDebt(patient.totalAmount, patient.paidAmount, patient.debtAmount);
  const paid = patient.paidAmount ?? 0;

  const sortedHistory = [...(patient.history || [])].sort((a, b) =>
    (b.date || "").localeCompare(a.date || "")
  );
  const visitsCount = sortedHistory.length;

  // Close mobile actions menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  // Clean note handling: suppress raw string dumps of past visits on the card face
  const isRawVisitDump = Boolean(
    patient.notes &&
      (/^(\d+\s*visits?:|\[\d{4}-\d{2}-\d{2})/i.test(patient.notes.trim()) ||
        patient.notes.includes("->"))
  );
  const cleanNote = isRawVisitDump ? "" : (patient.notes || "").trim();
  const latestProcedure = sortedHistory.length > 0 && sortedHistory[0].title
    ? `${t.latest}: ${sortedHistory[0].title}`
    : "";

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-sky-300 dark:hover:border-sky-700/50 hover:shadow-md transition-all duration-200 p-3.5 sm:p-4 gap-3">
      {/* Top Header: Avatar + Name + Gender/Visits Badges + Quick Actions */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <PatientAvatar gender={patient.gender} size="md" />
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {patient.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
              {/* Soft Subtle Gender Badge */}
              <span
                className={`font-semibold inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                  isMale
                    ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50"
                }`}
              >
                <span>{isMale ? "♂" : "♀"}</span>
                <span>{isMale ? t.male : t.female}</span>
              </span>

              {patient.age && (
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  • {patient.age}y
                </span>
              )}

              {/* Single Clear Visit Counter Badge */}
              {visitsCount > 0 && (
                <button
                  type="button"
                  onClick={() => onViewHistory(patient)}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40 hover:bg-sky-100 transition-colors cursor-pointer"
                  title="View visit history"
                >
                  <History className="w-3 h-3 text-sky-500" />
                  <span>
                    {visitsCount} {visitsCount === 1 ? t.visit : t.visits}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Actions Cluster (screens >= sm) */}
        <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0 -me-1">
          {onPrintReceipt && (
            <button
              onClick={() => onPrintReceipt(patient)}
              title={t.printReceipt}
              aria-label={t.printReceipt}
              className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-all cursor-pointer active:scale-90"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}
          {onPrintPrescription && (
            <button
              onClick={() => onPrintPrescription(patient)}
              title={t.printPrescription}
              aria-label={t.printPrescription}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all cursor-pointer active:scale-90"
            >
              <Stethoscope className="w-4 h-4" />
            </button>
          )}
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

        {/* Mobile Single '···' More Options Button (screens < sm) */}
        <div className="relative sm:hidden flex-shrink-0" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="More actions"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Accessible Thumb-Friendly Bottom/Dropdown Sheet */}
          {isMobileMenuOpen && (
            <div className="absolute end-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                {patient.name}
              </div>

              {onPrintReceipt && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onPrintReceipt(patient);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 transition-colors min-h-[44px]"
                >
                  <Printer className="w-4 h-4 text-sky-500" />
                  <span>{t.printReceipt}</span>
                </button>
              )}

              {onPrintPrescription && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onPrintPrescription(patient);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 transition-colors min-h-[44px]"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-500" />
                  <span>{t.printPrescription}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onViewHistory(patient);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors min-h-[44px]"
              >
                <History className="w-4 h-4 text-indigo-500" />
                <span>
                  {language === "ar"
                    ? `عرض السجل (${visitsCount} ${visitsCount === 1 ? "زيارة" : "زيارات"})`
                    : language === "ku"
                    ? `مێژووی سەردان (${visitsCount} سەردان)`
                    : `View History (${visitsCount} ${visitsCount === 1 ? "visit" : "visits"})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onEditPatient(patient);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px]"
              >
                <Pencil className="w-4 h-4 text-slate-500" />
                <span>{t.editPatient}</span>
              </button>

              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onDeletePatient(patient.id);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>{t.delete}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Middle: Interactive Date/Time Capsule + Financial Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Date & Time unified capsule */}
        <div className="inline-flex items-center rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 p-0.5 text-xs text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            title="Tap to change date"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer active:scale-95 font-medium"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span className="text-[11px] font-semibold">{formatStaticDate(patient.date)}</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700 select-none px-0.5">|</span>
          <button
            type="button"
            onClick={() => setIsClockPickerOpen(true)}
            title="Tap to change time"
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-800 hover:text-sky-600 dark:hover:text-sky-400 transition-all cursor-pointer active:scale-95 font-medium"
          >
            <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span
              className={`text-[11px] font-semibold ${
                patient.time
                  ? "text-sky-600 dark:text-sky-400"
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/90 dark:border-rose-900/60 shadow-2xs">
              <span className="text-[11px] font-bold">
                {t.owesLabel}: {formatIQD(debt)}
              </span>
              {onSettleDebt && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSettleDebt(patient);
                  }}
                  className="px-1.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs cursor-pointer active:scale-90 transition-all text-[10px] font-bold inline-flex items-center gap-1"
                  title={t.markDebtPaid}
                >
                  <Banknote className="w-3 h-3" />
                  <span>{t.markDebtPaid}</span>
                </button>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20">
              <span>✓</span>
              <span className="text-[11px] font-semibold">{t.fullyPaid}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Row: Dental Chart + Phone / WhatsApp Contact */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        {/* 3D Dental Chart Trigger - Doctor Only */}
        {isDoctor ? (
          <button
            type="button"
            onClick={() => onOpenDentalChart(patient)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100/80 hover:bg-sky-50 dark:bg-slate-800/80 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200/70 dark:border-slate-700/80 transition-all cursor-pointer active:scale-95"
          >
            <span>🦷</span>
            <span className="text-[11px]">
              {(patient.teeth?.length ?? 0) > 0
                ? `${patient.teeth!.length} ${t.teethCount}`
                : t.dentalChartBtn}
            </span>
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span>🦷</span>
            <span>{(patient.teeth?.length ?? 0) > 0 ? `${patient.teeth!.length} ${t.teethCount}` : ""}</span>
          </span>
        )}

        {/* Phone & Official WhatsApp Contact Button */}
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
              href={getWhatsAppUrl({
                phone: patient.phone,
                patientName: patient.name,
                clinicName: settings.clinicName,
                date: patient.date,
                time: patient.time,
                language,
                gender: patient.gender,
              })}
              target="_blank"
              rel="noopener noreferrer"
              title={`${t.whatsApp} ${patient.name}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
            >
              <span className="text-xs">💬</span>
              <span className="text-[11px]">{t.whatsApp}</span>
            </a>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">No phone</span>
        )}
      </div>

      {/* Notes / Latest History Procedure (Clean, single-line preview without raw dump) */}
      {cleanNote ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="line-clamp-1 text-[11px]">{cleanNote}</span>
        </div>
      ) : latestProcedure ? (
        <button
          type="button"
          onClick={() => onViewHistory(patient)}
          className="flex items-center justify-between text-[11px] text-sky-700 dark:text-sky-300 bg-sky-50/40 dark:bg-sky-950/30 px-2.5 py-1 rounded-lg border border-sky-100/80 dark:border-sky-900/40 hover:bg-sky-50 text-start transition-colors cursor-pointer"
        >
          <span className="truncate">{latestProcedure}</span>
          <span className="text-[10px] font-bold ms-1">→</span>
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
