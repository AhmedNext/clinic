"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getWhatsAppUrl } from "@/types/patient";
import { PatientAvatar } from "./PatientAvatar";
import { Calendar, Clock, Trash2, FileText, Pencil, History, Phone, Check, Printer, Stethoscope } from "lucide-react";
import { formatStaticDate } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();
  const { isDoctor } = useAuth();
  const formatDate = (dateString: string) => formatStaticDate(dateString);

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

          return (
            <div
              key={patient.id}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-3.5 shadow-2xs space-y-2.5"
            >
              {/* Top row: Avatar + Name/Meta + Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PatientAvatar gender={patient.gender} size="md" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                      {patient.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span
                        className={
                          isMale
                            ? "text-sky-600 dark:text-sky-400 font-semibold text-[11px]"
                            : "text-rose-600 dark:text-rose-400 font-semibold text-[11px]"
                        }
                      >
                        {isMale ? "♂" : "♀"} {isMale ? t.male : t.female}
                      </span>
                      {patient.age && (
                        <span className="text-[11px] text-slate-400">• {patient.age}y</span>
                      )}
                      {visitsCount > 0 && (
                        <button
                          type="button"
                          onClick={() => onViewHistory(patient)}
                          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-[11px] cursor-pointer"
                        >
                          • {visitsCount} {visitsCount === 1 ? t.visit : t.visits}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {onPrintReceipt && (
                    <button
                      onClick={() => onPrintReceipt(patient)}
                      title={t.printReceipt}
                      aria-label={t.printReceipt}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-90 transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  )}
                  {onPrintPrescription && (
                    <button
                      onClick={() => onPrintPrescription(patient)}
                      title={t.printPrescription}
                      aria-label={t.printPrescription}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 active:scale-90 transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onViewHistory(patient)}
                    title="History"
                    aria-label="History"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-90 transition-all cursor-pointer"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditPatient(patient)}
                    title="Edit"
                    aria-label="Edit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-90 transition-all cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeletePatient(patient.id)}
                    title="Delete"
                    aria-label="Delete"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 active:scale-90 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle row: Date/Time + Payment Pill */}
              <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="font-medium text-[11px]">{formatDate(patient.date)}</span>
                  {patient.time && (
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      ({patient.time})
                    </span>
                  )}
                </div>

                <div>
                  {debt > 0 ? (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                      <span className="text-[11px] font-bold">
                        {t.owesLabel}: {formatIQD(debt)}
                      </span>
                      {onSettleDebt && (
                        <button
                          type="button"
                          onClick={() => onSettleDebt(patient)}
                          className="p-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-90 transition-all"
                          title={t.markDebtPaid}
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100/80 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/70 dark:border-slate-700/80 transition-all cursor-pointer active:scale-95"
                  >
                    <span>🦷</span>
                    <span className="text-[11px]">
                      {patient.teeth && patient.teeth.length > 0
                        ? `${patient.teeth.length} ${t.teethCount}`
                        : t.dentalChartBtn}
                    </span>
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <span>🦷</span>
                    <span>{patient.teeth && patient.teeth.length > 0 ? `${patient.teeth.length} ${t.teethCount}` : ""}</span>
                  </span>
                )}

                {patient.phone ? (
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${patient.phone}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-[11px]">{patient.phone}</span>
                    </a>
                    <a
                      href={getWhatsAppUrl(patient.phone, patient.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-600 text-white shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="text-xs">💬</span>
                      <span className="text-[11px]">{t.whatsApp}</span>
                    </a>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No phone</span>
                )}
              </div>

              {/* Notes preview if exists */}
              {patient.notes && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800/60">
                  <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="line-clamp-1 text-[11px]">{patient.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP TABLE VIEW (Screens >= md) ── */}
      <div className="hidden md:block w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left rtl:text-right text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="py-3 pl-5 pr-3 rtl:pl-3 rtl:pr-5 w-[220px]">{t.name}</th>
                <th scope="col" className="py-3 px-3 w-[110px]">{t.gender}</th>
                <th scope="col" className="py-3 px-3 w-[70px]">{t.age}</th>
                <th scope="col" className="py-3 px-3 w-[240px]">{t.phone}</th>
                <th scope="col" className="py-3 px-3 w-[130px]">{t.date}</th>
                {isDoctor && <th scope="col" className="py-3 px-3 w-[120px]">{t.dentalChartBtn}</th>}
                <th scope="col" className="py-3 px-3 w-[160px]">{t.paidLabel}</th>
                <th scope="col" className="py-3 px-3">{t.notes}</th>
                <th scope="col" className="py-3 pl-3 pr-5 rtl:pl-5 rtl:pr-3 w-[110px] text-right rtl:text-left">{t.actions}</th>
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

                return (
                  <tr
                    key={patient.id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Name + Avatar */}
                    <td className="py-3.5 pl-5 pr-3">
                      <div className="flex items-center gap-3">
                        <PatientAvatar gender={patient.gender} size="md" />
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            {patient.name}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                            ID: {patient.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${
                          isMale
                            ? "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        <span className="font-bold">{isMale ? "♂" : "♀"}</span>
                        <span className="capitalize">{isMale ? t.male : t.female}</span>
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3.5 px-3">
                      {patient.age ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                          {patient.age}y
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Contact: WhatsApp + Phone */}
                    <td className="py-3.5 px-3">
                      {patient.phone ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={getWhatsAppUrl(patient.phone, patient.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`${t.whatsApp} ${patient.name}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                          >
                            <span className="text-sm">💬</span>
                            <span>{t.whatsApp}</span>
                          </a>
                          <a
                            href={`tel:${patient.phone}`}
                            title={`${t.call} ${patient.phone}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100 hover:bg-sky-50 dark:bg-slate-800 dark:hover:bg-sky-950/50 border border-slate-200 dark:border-slate-700 transition-colors whitespace-nowrap"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="font-mono text-[11px]">{patient.phone}</span>
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
                        <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{patient.time}</span>
                        </div>
                      )}
                      {patient.history && patient.history.length > 0 && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => onViewHistory(patient)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shadow-2xs whitespace-nowrap"
                        >
                          <span className="text-sm">🦷</span>
                          <span>
                            {patient.teeth && patient.teeth.length > 0
                              ? `${patient.teeth.length} ${t.teethCount}`
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 whitespace-nowrap">
                              {t.owesLabel}: {formatIQD(debt)}
                            </span>
                            {onSettleDebt && (
                              <button
                                type="button"
                                onClick={() => onSettleDebt(patient)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs transition-all cursor-pointer"
                                title="Mark debt as paid"
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
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                          ✓ {t.fullyPaid} ({formatIQD(paid)})
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-xs max-w-[200px]">
                      {patient.notes ? (
                        <div className="flex items-start gap-1.5" title={patient.notes}>
                          <FileText className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 mt-px" />
                          <span className="line-clamp-2 leading-relaxed">{patient.notes}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400/60 dark:text-slate-600 italic">No notes</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-5 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        {onPrintReceipt && (
                          <button
                            onClick={() => onPrintReceipt(patient)}
                            title={t.printReceipt}
                            aria-label={t.printReceipt}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {onPrintPrescription && (
                          <button
                            onClick={() => onPrintPrescription(patient)}
                            title={t.printPrescription}
                            aria-label={t.printPrescription}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Stethoscope className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onOpenDentalChart(patient)}
                          title="Open 3D Dental Chart"
                          aria-label={`Open 3D Dental Chart for ${patient.name}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="text-sm leading-none block">🦷</span>
                        </button>
                        <button
                          onClick={() => onViewHistory(patient)}
                          title="View history"
                          aria-label={`View history for ${patient.name}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer text-xs"
                        >
                          <History className="w-4 h-4" />
                          <span className="text-[10px] font-semibold">
                            {patient.history?.length || 0}
                          </span>
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          title="Edit patient"
                          aria-label={`Edit patient ${patient.name}`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeletePatient(patient.id)}
                          title="Delete patient"
                          aria-label={`Delete patient ${patient.name}`}
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
