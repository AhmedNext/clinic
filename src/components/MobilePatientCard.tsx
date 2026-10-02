"use client";

import React from "react";
import { Patient, calculateDebt, formatIQD, getWhatsAppUrl } from "@/types/patient";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  MessageCircle,
  MoreHorizontal,
  Printer,
  Stethoscope,
  History,
  Pencil,
  Trash2,
  Banknote,
} from "lucide-react";
import { formatStaticDate } from "@/utils/date";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";

export interface MobilePatientCardProps {
  patient: Patient;
  onDeletePatient: (id: string) => void;
  onEditPatient: (patient: Patient) => void;
  onViewHistory: (patient: Patient) => void;
  onOpenDentalChart: (patient: Patient) => void;
  onSettleDebt?: (patient: Patient) => void;
  onPrintReceipt?: (patient: Patient) => void;
  onPrintPrescription?: (patient: Patient) => void;
}

export const MobilePatientCard = React.memo(function MobilePatientCard({
  patient,
  onDeletePatient,
  onEditPatient,
  onViewHistory,
  onOpenDentalChart,
  onSettleDebt,
  onPrintReceipt,
  onPrintPrescription,
}: MobilePatientCardProps) {
  const { t, language } = useLanguage();
  const { isDoctor } = useAuth();
  const { settings } = useClinicSettings();

  const debt = calculateDebt(
    patient.totalAmount,
    patient.paidAmount,
    patient.debtAmount
  );

  const isMale = patient.gender === "male";
  const visitsCount = patient.history?.length || 0;

  // Single clean subline: e.g. "Female, 67y • Oct 16, 2026, 06:00 PM"
  const genderText = isMale ? t.male : t.female;
  const ageText = patient.age ? `${patient.age}y` : "";
  const genderAge = [genderText, ageText].filter(Boolean).join(", ");
  const dateFormatted = formatStaticDate(patient.date, language);
  const dateTime = [dateFormatted, patient.time].filter(Boolean).join(", ");
  const subline = [genderAge, dateTime].filter(Boolean).join(" • ");

  // Clean note handling: suppress raw string dumps of past visits
  const isRawVisitDump = Boolean(
    patient.notes &&
      (/^(\d+\s*visits?:|\[\d{4}-\d{2}-\d{2})/i.test(patient.notes.trim()) ||
        patient.notes.includes("->"))
  );
  const cleanNote = isRawVisitDump ? "" : (patient.notes || "").trim();

  // Tooth label: crisp single badge e.g. "Tooth #24" or "3 teeth"
  const hasTeeth = Boolean(patient.teeth && patient.teeth.length > 0);
  const toothBadgeLabel = hasTeeth
    ? patient.teeth!.length === 1
      ? `Tooth #${patient.teeth![0].toothNumber}`
      : `${patient.teeth!.length} ${t.teethCount}`
    : null;

  const initials = patient.name
    ? patient.name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "P";

  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all p-0">
      {/* ── ZONE A: HEADER ── */}
      <CardHeader className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 flex-row items-start justify-between gap-2.5 space-y-0">
        {/* Left: Avatar + Name + Clean Subline (No Pill Soup!) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className={`font-bold text-xs ${
                isMale
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              }`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-start">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">
              {patient.name}
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {genderAge && <span className="shrink-0">{genderAge}</span>}
                {genderAge && (dateFormatted || patient.time) && (
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                )}
                {dateFormatted && <span className="font-medium shrink-0">{dateFormatted}</span>}
                {patient.time && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="shrink-0">{patient.time}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Single Status Badge + ••• Dropdown Menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          {debt > 0 ? (
            <Badge variant="destructive" className="tabular-nums">
              {t.owesLabel}: {formatIQD(debt)}
            </Badge>
          ) : (
            <Badge variant="secondary">
              ✓ {t.fullyPaid}
            </Badge>
          )}

          {/* shadcn DropdownMenu for ••• Ghost Action Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Patient options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 text-start">
              <DropdownMenuLabel className="truncate">
                {patient.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onPrintReceipt && (
                <DropdownMenuItem
                  onClick={() => onPrintReceipt(patient)}
                  className="gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Printer className="w-4 h-4 text-sky-500" />
                  <span>{t.printReceipt}</span>
                </DropdownMenuItem>
              )}

              {onPrintPrescription && (
                <DropdownMenuItem
                  onClick={() => onPrintPrescription(patient)}
                  className="gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <Stethoscope className="w-4 h-4 text-emerald-500" />
                  <span>{t.printPrescription}</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem
                onClick={() => onViewHistory(patient)}
                className="gap-2.5 text-slate-700 dark:text-slate-300"
              >
                <History className="w-4 h-4 text-indigo-500" />
                <span>
                  {language === "ar"
                    ? `عرض السجل (${visitsCount} ${visitsCount === 1 ? "زيارة" : "زيارات"})`
                    : language === "ku"
                    ? `مێژووی سەردان (${visitsCount} سەردان)`
                    : `View History (${visitsCount} ${visitsCount === 1 ? "visit" : "visits"})`}
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onEditPatient(patient)}
                className="gap-2.5 text-slate-700 dark:text-slate-300"
              >
                <Pencil className="w-4 h-4 text-slate-500" />
                <span>{t.editPatient}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeletePatient(patient.id)}
                className="gap-2.5 text-rose-600 focus:text-rose-600 dark:focus:text-rose-400 font-semibold"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>{t.delete}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* ── ZONE B: CLINICAL DETAILS (MIDDLE) ── */}
      {(toothBadgeLabel || cleanNote) && (
        <CardContent className="px-3.5 sm:px-4 py-0 space-y-1.5 text-start">
          {toothBadgeLabel && (
            <div>
              {isDoctor ? (
                <button
                  type="button"
                  onClick={() => onOpenDentalChart(patient)}
                  className="cursor-pointer"
                >
                  <Badge variant="outline" className="gap-1.5 hover:bg-sky-50 dark:hover:bg-sky-950/50 hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                    <span>🦷</span>
                    <span>{toothBadgeLabel}</span>
                  </Badge>
                </button>
              ) : (
                <Badge variant="outline" className="gap-1.5">
                  <span>🦷</span>
                  <span>{toothBadgeLabel}</span>
                </Badge>
              )}
            </div>
          )}

          {cleanNote && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
              {cleanNote}
            </p>
          )}
        </CardContent>
      )}

      {/* ── ZONE C: ACTION FOOTER ── */}
      <CardFooter className="border-t border-slate-100 dark:border-slate-800/80 px-3.5 sm:px-4 pt-3 pb-3 mt-3 flex items-center justify-between gap-2">
        {/* Left: Quick Contact Icon Buttons (Phone, WhatsApp, Dental) */}
        <div className="flex items-center gap-1">
          {patient.phone ? (
            <>
              <a
                href={`tel:${patient.phone}`}
                title={`${t.call} ${patient.phone}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">{patient.phone}</span>
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
            </>
          ) : (
            <span className="text-xs text-slate-400 italic px-2">No phone</span>
          )}

          {/* Dental chart shortcut if not shown in Zone B */}
          {!hasTeeth && isDoctor && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenDentalChart(patient)}
              title={t.dentalChartBtn}
              className="h-7 w-7 text-xs"
            >
              🦷
            </Button>
          )}
        </div>

        {/* Right: Clean Collect / Settle Button or Visit Count */}
        <div>
          {debt > 0 && onSettleDebt ? (
            <Button
              variant="emerald"
              size="sm"
              onClick={() => onSettleDebt(patient)}
              className="gap-1.5"
            >
              <Banknote className="w-3.5 h-3.5" />
              <span>{t.markDebtPaid}</span>
            </Button>
          ) : visitsCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewHistory(patient)}
              className="gap-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 font-medium h-7 px-2"
            >
              <History className="w-3.5 h-3.5" />
              <span>
                {visitsCount} {visitsCount === 1 ? t.visit : t.visits}
              </span>
            </Button>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
});
