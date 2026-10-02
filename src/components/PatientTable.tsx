"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getWhatsAppUrl } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { MobilePatientCard } from "./MobilePatientCard";
import { Button } from "./ui/button";
import {
  Calendar,
  Clock,
  Trash2,
  FileText,
  Pencil,
  History,
  Check,
  Printer,
  Stethoscope,
  MessageCircle,
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

  const formatDate = (dateString: string) => formatStaticDate(dateString);

  return (
    <div className="w-full">
      {/* ── MOBILE RESPONSIVE LIST VIEW (Phones / Small screens < md) ── */}
      <div className="md:hidden space-y-3">
        {patients.map((patient) => (
          <MobilePatientCard
            key={patient.id}
            patient={patient}
            onDeletePatient={onDeletePatient}
            onEditPatient={onEditPatient}
            onViewHistory={onViewHistory}
            onOpenDentalChart={onOpenDentalChart}
            onSettleDebt={onSettleDebt}
            onPrintReceipt={onPrintReceipt}
            onPrintPrescription={onPrintPrescription}
          />
        ))}
      </div>

      {/* ── DESKTOP TABLE VIEW (Screens >= md) ── */}
      <div className="hidden md:block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-start text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="py-3 ps-5 pe-3 min-w-[200px] text-start">{t.name}</th>
                <th scope="col" className="py-3 px-3 min-w-[180px] text-start">{t.phone}</th>
                <th scope="col" className="py-3 px-3 min-w-[130px] text-start">{t.date}</th>
                {isDoctor && <th scope="col" className="py-3 px-3 min-w-[130px] text-start">{t.dentalChartBtn}</th>}
                <th scope="col" className="py-3 px-3 min-w-[150px] text-start">{t.paidLabel}</th>
                <th scope="col" className="py-3 px-3 text-start">{t.notes}</th>
                <th scope="col" className="py-3 ps-3 pe-5 w-[130px] text-end">{t.actions}</th>
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
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>
                          {formatDate(patient.date)}
                          {patient.time ? `, ${patient.time}` : ""}
                        </span>
                      </div>
                      <div className="mt-0.5">
                        <button
                          type="button"
                          onClick={() => onViewHistory(patient)}
                          className="text-xs text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:underline transition-colors cursor-pointer"
                        >
                          {(patient.history?.length ?? 0) > 0 ? patient.history!.length : 1}{" "}
                          {(patient.history?.length ?? 0) === 1 || !patient.history?.length
                            ? t.visit
                            : t.visits}
                        </button>
                      </div>
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
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
                              {t.owesLabel}: {formatIQD(debt)}
                            </span>
                            {onSettleDebt && (
                              <Button
                                size="sm"
                                type="button"
                                onClick={() => onSettleDebt(patient)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-2.5 rounded-lg shadow-2xs font-bold"
                              >
                                Collect
                              </Button>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 ps-1 font-medium font-mono whitespace-nowrap">
                            {t.paidLabel}: {formatIQD(paid)}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium text-xs bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-600/20 whitespace-nowrap">
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
