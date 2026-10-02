"use client";

import React, { useState, useEffect } from "react";
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
  MessageCircle,
  Banknote,
} from "lucide-react";
import { formatStaticDate } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { useAuth } from "@/context/AuthContext";

interface PatientTableProps {
  patients: Patient[];
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onOpenDentalChart: (patient: Patient) => void;
  onSettleDebt?: (patient: Patient) => void;
  onPrintReceipt?: (patient: Patient) => void;
  onPrintPrescription?: (patient: Patient) => void;
}

export const PatientTable = React.memo(function PatientTable({
  patients,
  onDeletePatient,
  onEditPatient,
  onViewHistory,
  onOpenDentalChart,
  onSettleDebt,
  onPrintReceipt,
  onPrintPrescription,
}: PatientTableProps) {
  const { t, language } = useLanguage();
  const { settings } = useClinicSettings();
  const { isDoctor } = useAuth();
  const [activeMobileMenuId, setActiveMobileMenuId] = useState<string | null>(null);

  const formatDate = (dateString: string) => formatStaticDate(dateString);

  // Close mobile actions menu on outside click
  useEffect(() => {
    function handleClickOutside() {
      setActiveMobileMenuId(null);
    }
    if (activeMobileMenuId) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeMobileMenuId]);

  return (
    <div className="w-full">
      {/* ── MOBILE RESPONSIVE LIST VIEW (Phones / Small screens < md) ── */}
      <div className="md:hidden space-y-3">
        {patients.map((patient) => {
          const isMale = patient.gender === "male";
          const debt = calculateDebt(
            patient.totalAmount,
            patient.paidAmount,
            patient.debtAmount
          );
          const paid = patient.paidAmount ?? 0;
          const visitsCount = patient.history?.length || 0;

          // Suppress raw string dumps of past visits on card face
          const isRawVisitDump = Boolean(
            patient.notes &&
              (/^(\d+\s*visits?:|\[\d{4}-\d{2}-\d{2})/i.test(patient.notes.trim()) ||
                patient.notes.includes("->"))
          );
          const cleanNote = isRawVisitDump ? "" : (patient.notes || "").trim();

          const isMenuOpen = activeMobileMenuId === patient.id;

          return (
            <div
              key={patient.id}
              className="relative p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5 transition-all"
            >
              {/* Top row: Avatar + Name & Age + Mobile '···' Action */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PatientAvatar gender={patient.gender} size="sm" />
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {patient.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold border ${
                          isMale
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/50"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"
                        }`}
                      >
                        {isMale ? `♂ ${t.male}` : `♀ ${t.female}`}
                      </span>

                      {patient.age && <span>• {patient.age}y</span>}

                      {visitsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onViewHistory(patient)}
                          className="font-bold text-sky-700 dark:text-sky-300 hover:underline cursor-pointer"
                        >
                          • {visitsCount} {visitsCount === 1 ? t.visit : t.visits}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Safe '···' Action Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMobileMenuId(isMenuOpen ? null : patient.id);
                    }}
                    aria-label="Patient actions"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Accessible Mobile Dropdown Menu with 44px+ touch targets */}
                  {isMenuOpen && (
                    <div
                      className="absolute right-0 rtl:right-auto rtl:left-0 top-full mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                        {patient.name}
                      </div>

                      {onPrintReceipt && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMobileMenuId(null);
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
                            setActiveMobileMenuId(null);
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
                          setActiveMobileMenuId(null);
                          onViewHistory(patient);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 transition-colors min-h-[44px]"
                      >
                        <History className="w-4 h-4 text-indigo-500" />
                        <span>{t.visit} ({visitsCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMobileMenuId(null);
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
                            setActiveMobileMenuId(null);
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

              {/* Middle row: Date/Time + Payment Status */}
              <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span className="font-medium text-[11px]">{formatDate(patient.date)}</span>
                  {patient.time && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                      <Clock className="w-3 h-3 text-sky-500" />
                      <span>{patient.time}</span>
                    </span>
                  )}
                </div>

                <div>
                  {debt > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/90 dark:border-rose-900/60 shadow-2xs">
                      <span className="text-[11px] font-bold">
                        {t.owesLabel}: {formatIQD(debt)}
                      </span>
                      {onSettleDebt && (
                        <button
                          type="button"
                          onClick={() => onSettleDebt(patient)}
                          className="px-1.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-90 transition-all text-[10px] font-bold inline-flex items-center gap-1"
                          title={t.markDebtPaid}
                        >
                          <Banknote className="w-3 h-3" />
                          <span>{t.markDebtPaid}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20">
                      ✓ {t.fullyPaid}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom row: Dental Chart (Doctor Only) + WhatsApp/Phone */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                {isDoctor ? (
                  <button
                    type="button"
                    onClick={() => onOpenDentalChart(patient)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100/80 hover:bg-sky-50 dark:bg-slate-800/80 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200/70 dark:border-slate-700/80 transition-all cursor-pointer active:scale-95"
                  >
                    <span>🦷</span>
                    <span className="text-[11px]">
                      {patient.teeth && patient.teeth.length > 0
                        ? patient.teeth.length === 1
                          ? `Tooth #${patient.teeth[0].toothNumber}`
                          : `${patient.teeth.length} teeth`
                        : t.dentalChartBtn}
                    </span>
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span>🦷</span>
                    <span>
                      {patient.teeth && patient.teeth.length > 0
                        ? patient.teeth.length === 1
                          ? `Tooth #${patient.teeth[0].toothNumber}`
                          : `${patient.teeth.length} teeth`
                        : ""}
                    </span>
                  </span>
                )}

                {patient.phone ? (
                  <div className="flex items-center gap-1">
                    <a
                      href={`tel:${patient.phone}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-[11px]">{patient.phone}</span>
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
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No phone</span>
                )}
              </div>

              {/* Notes preview if clean note exists */}
              {cleanNote && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="line-clamp-1 text-[11px]">{cleanNote}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP TABLE VIEW (Screens >= md) ── */}
      <div className="hidden md:block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left rtl:text-right text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="py-3 pl-5 pr-3 rtl:pl-3 rtl:pr-5 min-w-[200px]">{t.name}</th>
                <th scope="col" className="py-3 px-3 min-w-[180px]">{t.phone}</th>
                <th scope="col" className="py-3 px-3 min-w-[130px]">{t.date}</th>
                {isDoctor && <th scope="col" className="py-3 px-3 min-w-[130px]">{t.dentalChartBtn}</th>}
                <th scope="col" className="py-3 px-3 min-w-[150px]">{t.paidLabel}</th>
                <th scope="col" className="py-3 px-3">{t.notes}</th>
                <th scope="col" className="py-3 pl-3 pr-5 rtl:pl-5 rtl:pr-3 w-[130px] text-right rtl:text-left">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {patients.map((patient) => {
                const isMale = patient.gender === "male";
                const debt = calculateDebt(
                  patient.totalAmount,
                  patient.paidAmount,
                  patient.debtAmount
                );
                const paid = patient.paidAmount ?? 0;

                // Clean note check
                const isRawVisitDump = Boolean(
                  patient.notes &&
                    (/^(\d+\s*visits?:|\[\d{4}-\d{2}-\d{2})/i.test(patient.notes.trim()) ||
                      patient.notes.includes("->"))
                );
                const cleanNote = isRawVisitDump ? "" : (patient.notes || "").trim();

                return (
                  <tr
                    key={patient.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Name + Compact Demographics (Age & Gender merged) */}
                    <td className="py-3.5 pl-5 pr-3 rtl:pl-3 rtl:pr-5">
                      <div className="flex items-center gap-3">
                        <PatientAvatar gender={patient.gender} size="sm" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                            {patient.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {patient.age ? <span>{patient.age}y</span> : null}
                            {patient.age ? <span>•</span> : null}
                            <span className={isMale ? "text-sky-600 dark:text-sky-400" : "text-rose-500 dark:text-rose-400"}>
                              {isMale ? `♂ ${t.male}` : `♀ ${t.female}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact: Clean Phone + Subtle WhatsApp Icon */}
                    <td className="py-3.5 px-3">
                      {patient.phone ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${patient.phone}`}
                            title={`${t.call} ${patient.phone}`}
                            className="font-mono text-xs text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                          >
                            {patient.phone}
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
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400/70 italic">No phone</span>
                      )}
                    </td>

                    {/* Date & Visits */}
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      <div className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span>{formatDate(patient.date)}</span>
                      </div>
                      {patient.time && (
                        <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900/40">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{patient.time}</span>
                        </div>
                      )}
                      {patient.history && patient.history.length > 0 && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => onViewHistory(patient)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors cursor-pointer"
                          >
                            <History className="w-2.5 h-2.5" />
                            <span>{patient.history.length} {patient.history.length === 1 ? t.visit : t.visits}</span>
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 3D Dental Chart (Doctor Only) */}
                    {isDoctor && (
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => onOpenDentalChart(patient)}
                          title={t.dentalChartBtn}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 hover:bg-sky-50 dark:bg-slate-800/60 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 shadow-2xs whitespace-nowrap"
                        >
                          <span className="text-sm">🦷</span>
                          <span className="text-[11px]">
                            {patient.teeth && patient.teeth.length > 0
                              ? patient.teeth.length === 1
                                ? `Tooth #${patient.teeth[0].toothNumber}`
                                : `${patient.teeth.length} teeth`
                              : t.dentalChartBtn}
                          </span>
                        </button>
                      </td>
                    )}

                    {/* Payment & Debt */}
                    <td className="py-3.5 px-3 text-xs">
                      {debt > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
                              {t.owesLabel}: {formatIQD(debt)}
                            </span>
                            {onSettleDebt && (
                              <button
                                type="button"
                                onClick={() => onSettleDebt(patient)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-all cursor-pointer"
                                title={t.markDebtPaid}
                              >
                                <Check className="w-2.5 h-2.5" />
                                <span>{t.markDebtPaid}</span>
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-1 rtl:pl-0 rtl:pr-1 font-medium whitespace-nowrap">
                            {t.paidLabel}: {formatIQD(paid)}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20 whitespace-nowrap">
                          ✓ {t.fullyPaid}
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-[200px]">
                      {cleanNote ? (
                        <div className="flex items-start gap-1.5" title={cleanNote}>
                          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-px" />
                          <span className="line-clamp-2 leading-relaxed">{cleanNote}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400/60 dark:text-slate-600 italic">No notes</span>
                      )}
                    </td>

                    {/* Desktop Actions */}
                    <td className="py-3.5 pl-3 pr-5 text-right rtl:text-left">
                      <div className="flex items-center justify-end rtl:justify-start gap-1">
                        {onPrintReceipt && (
                          <button
                            onClick={() => onPrintReceipt(patient)}
                            title={t.printReceipt}
                            aria-label={t.printReceipt}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {onPrintPrescription && (
                          <button
                            onClick={() => onPrintPrescription(patient)}
                            title={t.printPrescription}
                            aria-label={t.printPrescription}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEditPatient(patient)}
                          title="Edit"
                          aria-label="Edit"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePatient(patient.id)}
                          title="Delete"
                          aria-label="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});
