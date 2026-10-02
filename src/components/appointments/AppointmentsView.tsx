"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Phone,
  CheckCircle2,
  Trash2,
  CalendarClock,
  MessageCircle,
  X,
  MoreHorizontal,
  Stethoscope,
  List,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/types/appointment";
import { Patient, getAppointmentReminderWhatsAppUrl } from "@/types/patient";
import { BookAppointmentModal } from "./BookAppointmentModal";
import { useLanguage } from "@/context/LanguageContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { getMonthName, WEEKDAY_NAMES, formatStaticDate } from "@/utils/date";

// ─── Types ───
type ViewMode = "month" | "list";
type StatusFilter = "all" | "scheduled" | "completed" | "cancelled";

interface AppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (data: Omit<Appointment, "id" | "createdAt">) => void;
  onToggleStatus: (id: string, newStatus: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onOpenAddPatient?: (dateString: string) => void;
  onStartVisit?: (appointment: Appointment) => void;
}

export function AppointmentsView({
  appointments,
  patients,
  onAddAppointment,
  onToggleStatus,
  onDeleteAppointment,
  onOpenAddPatient,
  onStartVisit,
}: AppointmentsViewProps) {
  const { language, t } = useLanguage();
  const { settings } = useClinicSettings();

  // ─── Date helpers ───
  const toYMD = (year: number, monthIndex: number, day: number) => {
    const mStr = String(monthIndex + 1).padStart(2, "0");
    const dStr = String(day).padStart(2, "0");
    return `${year}-${mStr}-${dStr}`;
  };

  const today = new Date();
  const todayYMD = toYMD(today.getFullYear(), today.getMonth(), today.getDate());

  // ─── State ───
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDayString, setSelectedDayString] = useState<string>(todayYMD);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [bookModalDate, setBookModalDate] = useState<string | null>(null);
  const [detailsAppointment, setDetailsAppointment] = useState<Appointment | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // ─── Month navigation ───
  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else { setCurrentMonth((m) => m - 1); }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else { setCurrentMonth((m) => m + 1); }
  };
  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDayString(todayYMD);
  };

  const weekDayNames = WEEKDAY_NAMES[language] || WEEKDAY_NAMES.en;

  // ─── Calendar grid ───
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    const days: { dateString: string; dayNumber: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = toYMD(prevYear, prevMonthIdx, dayNum);
      days.push({ dateString: dateStr, dayNumber: dayNum, isCurrentMonth: false, isToday: dateStr === todayYMD });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toYMD(currentYear, currentMonth, day);
      days.push({ dateString: dateStr, dayNumber: day, isCurrentMonth: true, isToday: dateStr === todayYMD });
    }
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = toYMD(nextYear, nextMonthIdx, day);
      days.push({ dateString: dateStr, dayNumber: day, isCurrentMonth: false, isToday: dateStr === todayYMD });
    }
    return days;
  }, [currentYear, currentMonth, todayYMD]);

  // ─── Appointments index ───
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((apt) => {
      const list = map.get(apt.date) || [];
      list.push(apt);
      map.set(apt.date, list);
    });
    return map;
  }, [appointments]);

  // ─── List view: selected day appointments ───
  const dayAppointments = useMemo(() => {
    const list = appointmentsByDate.get(selectedDayString) || [];
    return [...list].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }, [appointmentsByDate, selectedDayString]);

  // ─── List view: all month appointments (sorted) ───
  const monthAppointments = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
    return appointments
      .filter((a) => a.date.startsWith(prefix))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  }, [appointments, currentYear, currentMonth]);

  const listAppointments = viewMode === "list" ? monthAppointments : dayAppointments;

  const filteredListAppointments = useMemo(() => {
    const list = statusFilter === "all" ? listAppointments : listAppointments.filter((a) => a.status === statusFilter);
    return [...list].sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));
  }, [listAppointments, statusFilter]);

  // Group appointments chronologically by date
  const groupedListAppointments = useMemo(() => {
    const groups: { date: string; appointments: Appointment[] }[] = [];
    const dateMap = new Map<string, Appointment[]>();
    for (const apt of filteredListAppointments) {
      const existing = dateMap.get(apt.date);
      if (existing) {
        existing.push(apt);
      } else {
        const arr = [apt];
        dateMap.set(apt.date, arr);
        groups.push({ date: apt.date, appointments: arr });
      }
    }
    return groups;
  }, [filteredListAppointments]);

  // ─── Localized labels ───
  const labels = {
    title: language === "ar" ? "المواعيد والجدول" : language === "ku" ? "مەوعیدەکان و خشتە" : "Appointments & Schedule",
    bookAppointment: language === "ar" ? "حجز موعد" : language === "ku" ? "نۆرە دابنێ" : "Book Appointment",
    today: language === "ar" ? "اليوم" : language === "ku" ? "ئەمڕۆ" : "Today",
    month: language === "ar" ? "شهري" : language === "ku" ? "مانگانە" : "Month",
    list: language === "ar" ? "قائمة" : language === "ku" ? "لیست" : "List",
    all: language === "ar" ? "الكل" : language === "ku" ? "هەمووی" : "All",
    scheduled: language === "ar" ? "مجدول" : language === "ku" ? "دانراو" : "Scheduled",
    completed: language === "ar" ? "مكتمل" : language === "ku" ? "تەواوبوو" : "Completed",
    cancelled: language === "ar" ? "ملغي" : language === "ku" ? "هەڵوەشاوە" : "Cancelled",
    noAppointments: language === "ar" ? "لا توجد مواعيد" : language === "ku" ? "هیچ مەوعیدێک نییە" : "No appointments",
    noAppointmentsDesc: language === "ar" ? "اضغط لحجز موعد جديد" : language === "ku" ? "دوگمە دابگرە بۆ مەوعیدی نوێ" : "Tap to schedule a new appointment",
    addAppointment: language === "ar" ? "إضافة موعد" : language === "ku" ? "مەوعیدی نوێ" : "Add Appointment",
    startVisit: language === "ar" ? "بدء الزيارة" : language === "ku" ? "دەستپێکردنی سەردان" : "Start Visit",
    whatsappReminder: language === "ar" ? "تذكير" : language === "ku" ? "بیرخستنەوە" : "Remind",
    cancel: language === "ar" ? "إلغاء الموعد" : language === "ku" ? "هەڵوەشاندنەوە" : "Cancel Appointment",
    deleteAppt: language === "ar" ? "حذف" : language === "ku" ? "سڕینەوە" : "Delete",
    markScheduled: language === "ar" ? "إرجاع لمجدول" : language === "ku" ? "بگۆڕە بۆ دانراو" : "Mark as Scheduled",
    markCompleted: language === "ar" ? "اكتمل" : language === "ku" ? "تەواو بوو" : "Mark as Completed",
    duration: language === "ar" ? "دقيقة" : language === "ku" ? "خولەک" : "min",
    close: language === "ar" ? "إغلاق" : language === "ku" ? "داخستن" : "Close",
  };

  const statusBadgeStyles: Record<AppointmentStatus, string> = {
    scheduled: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 ring-1 ring-sky-200 dark:ring-sky-800",
    completed: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800",
    cancelled: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700 line-through",
  };

  const statusLabels: Record<AppointmentStatus, string> = {
    scheduled: labels.scheduled,
    completed: labels.completed,
    cancelled: labels.cancelled,
  };

  const getInitials = (name: string) =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "P";

  // ═══════════════════════════════════════════
  // RENDER: Appointment Card (shared by List view & Details modal list)
  // ═══════════════════════════════════════════
  const renderAppointmentCard = (apt: Appointment) => {
    const isDone = apt.status === "completed";
    const isCancelled = apt.status === "cancelled";
    const isScheduled = apt.status === "scheduled";
    const initials = getInitials(apt.patientName);
    const isMenuOpen = openMenuId === apt.id;
    const whatsAppUrl = apt.phone
      ? getAppointmentReminderWhatsAppUrl({ phone: apt.phone, patientName: apt.patientName, clinicName: settings.clinicName, doctorName: settings.doctorName, date: apt.date, time: apt.time, language })
      : "";

    return (
      <div
        key={apt.id}
        className={`relative group p-4 sm:p-5 rounded-xl border transition-all duration-200 ${
          isDone ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800/60 opacity-75"
          : isCancelled ? "bg-slate-50/50 dark:bg-slate-950/30 border-slate-100 dark:border-slate-800/40 opacity-60"
          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4">
          {/* LEFT: Date & Time Block */}
          <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2 sm:gap-1.5 sm:w-[150px] flex-shrink-0">
            {/* Line 1: Date */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CalendarIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>{formatStaticDate(apt.date, language)}</span>
            </div>

            {/* Line 2: Time */}
            <div className={`px-2.5 py-1 rounded-lg text-center font-mono font-bold text-sm ${
              isDone ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800/60"
              : isCancelled ? "bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium ring-1 ring-slate-200 dark:ring-slate-700 line-through"
              : "bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 ring-1 ring-slate-200 dark:ring-slate-700"
            }`}>
              {apt.time || "—"}
            </div>

            {/* Line 3: Duration */}
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">30 {labels.duration}</span>
          </div>

          {/* CENTER: Patient & Clinical */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{initials}</span>
              </div>
              <div className="min-w-0">
                <h4 className={`text-base font-semibold capitalize truncate ${isCancelled ? "text-slate-400 dark:text-slate-500 line-through" : "text-slate-900 dark:text-slate-100"}`}>
                  {apt.patientName}
                </h4>
                {apt.phone && (
                  <a href={`tel:${apt.phone}`} className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-sky-600 transition-colors">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="font-mono">{apt.phone}</span>
                  </a>
                )}
              </div>
            </div>
            {apt.treatment && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                <Stethoscope className="w-3 h-3 text-slate-400" />
                {apt.treatment}
              </span>
            )}
            {apt.notes && !isCancelled && (
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{apt.notes}</p>
            )}
          </div>

          {/* RIGHT: Status & Actions */}
          <div className="flex items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap ${statusBadgeStyles[apt.status]}`}>
              {apt.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
              {apt.status === "scheduled" && <Clock className="w-3 h-3" />}
              {statusLabels[apt.status]}
            </span>

            <div className="flex items-center gap-1.5">
              {onStartVisit && isScheduled && (
                <button type="button" onClick={() => onStartVisit(apt)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer min-h-[36px]" title={labels.startVisit}>
                  <span>🩺</span>
                  <span className="hidden sm:inline">{labels.startVisit}</span>
                </button>
              )}
              {apt.phone && isScheduled && (
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" title={labels.whatsappReminder} className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer min-h-[36px]">
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline text-[11px]">{labels.whatsappReminder}</span>
                </a>
              )}

              {/* ••• Menu */}
              <div className="relative">
                <button type="button" onClick={() => setOpenMenuId(isMenuOpen ? null : apt.id)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer" aria-label="More actions">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute end-0 top-full mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95">
                      {isScheduled && (
                        <button type="button" onClick={() => { onToggleStatus(apt.id, "completed"); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors min-h-[40px] cursor-pointer">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /><span>{labels.markCompleted}</span>
                        </button>
                      )}
                      {isDone && (
                        <button type="button" onClick={() => { onToggleStatus(apt.id, "scheduled"); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors min-h-[40px] cursor-pointer">
                          <Clock className="w-4 h-4 text-sky-500" /><span>{labels.markScheduled}</span>
                        </button>
                      )}
                      {!isCancelled && (
                        <button type="button" onClick={() => { onToggleStatus(apt.id, "cancelled"); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors min-h-[40px] cursor-pointer">
                          <X className="w-4 h-4 text-amber-500" /><span>{labels.cancel}</span>
                        </button>
                      )}
                      {isCancelled && (
                        <button type="button" onClick={() => { onToggleStatus(apt.id, "scheduled"); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors min-h-[40px] cursor-pointer">
                          <CalendarIcon className="w-4 h-4 text-sky-500" /><span>{labels.markScheduled}</span>
                        </button>
                      )}
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                      <button type="button" onClick={() => { onDeleteAppointment(apt.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors min-h-[40px] cursor-pointer">
                        <Trash2 className="w-4 h-4 text-rose-500" /><span>{labels.deleteAppt}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-32 md:pb-4">
      {/* ════════════════════════ HEADER BAR ════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Left: Title + Month Nav */}
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {labels.title}
          </h2>

          {/* Month Navigator: < October 2026 > */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
            <button onClick={handlePrevMonth} aria-label="Previous month" className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
            <span className="px-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 select-none whitespace-nowrap">
              {getMonthName(currentMonth, language)} {currentYear}
            </span>
            <button onClick={handleNextMonth} aria-label="Next month" className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>

          {/* Today Reset */}
          <button type="button" onClick={handleGoToday} className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer">
            {labels.today}
          </button>
        </div>

        {/* Right: View Toggle + Book Button */}
        <div className="flex items-center gap-2.5">
          {/* Segmented Toggle: Month | List */}
          <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{labels.month}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{labels.list}</span>
            </button>
          </div>

          {/* + Book Appointment */}
          <button
            type="button"
            onClick={() => setBookModalDate(viewMode === "month" ? todayYMD : selectedDayString)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white shadow-sm shadow-sky-600/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">{labels.bookAppointment}</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════ MONTH CALENDAR VIEW ════════════════════════ */}
      {viewMode === "month" && (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          {/* Weekday header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
            {weekDayNames.map((day, idx) => {
              const isFriday = idx === 5;
              return (
                <div
                  key={day}
                  className={`py-2.5 text-center text-[11px] font-bold uppercase tracking-wider ${
                    isFriday
                      ? "text-rose-500 dark:text-rose-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/60">
            {calendarDays.map((cell) => {
              const cellAppts = appointmentsByDate.get(cell.dateString) || [];
              const cellDate = new Date(`${cell.dateString}T00:00:00`);
              const isFriday = cellDate.getDay() === 5;

              return (
                <div
                  key={cell.dateString}
                  onClick={() => setBookModalDate(cell.dateString)}
                  className={`
                    min-h-[56px] sm:min-h-[100px] p-1 sm:p-2 transition-all duration-150 cursor-pointer flex flex-col group
                    ${isFriday ? "bg-rose-50/30 dark:bg-rose-950/10" : cell.isCurrentMonth ? "bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/30" : "bg-slate-50/40 dark:bg-slate-950/30 opacity-40 hover:opacity-70"}
                    ${cell.isToday ? "ring-2 ring-sky-500/60 ring-inset" : ""}
                  `}
                >
                  {/* Day number + quick add */}
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`
                      w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-xs font-semibold
                      ${cell.isToday ? "bg-sky-600 text-white font-bold" : isFriday ? "text-rose-500 dark:text-rose-400 font-bold" : cell.isCurrentMonth ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}
                    `}>
                      {cell.dayNumber}
                    </span>
                    {/* + icon on hover */}
                    <span className="hidden sm:flex w-5 h-5 rounded-md items-center justify-center text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3 h-3" />
                    </span>
                  </div>

                  {/* Mobile: dot indicators */}
                  <div className="sm:hidden flex items-center justify-center gap-0.5 mt-0.5">
                    {cellAppts.slice(0, 3).map((apt) => (
                      <span key={apt.id} className={`w-1.5 h-1.5 rounded-full ${apt.status === "completed" ? "bg-emerald-500" : apt.status === "cancelled" ? "bg-slate-400" : "bg-sky-500"}`} />
                    ))}
                    {cellAppts.length > 3 && <span className="text-[7px] font-bold text-slate-400">+</span>}
                  </div>

                  {/* Desktop: appointment chips */}
                  <div className="hidden sm:flex flex-col gap-0.5 overflow-hidden flex-1 mt-0.5">
                    {cellAppts.slice(0, 2).map((apt) => {
                      const chipDone = apt.status === "completed";
                      const chipCancelled = apt.status === "cancelled";
                      return (
                        <button
                          key={apt.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailsAppointment(apt);
                          }}
                          className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md font-medium truncate text-start transition-colors ${
                            chipDone
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 line-through opacity-70"
                              : chipCancelled
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-400 line-through opacity-60"
                              : "bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/60"
                          }`}
                          title={`${apt.time} • ${apt.patientName}`}
                        >
                          <span className="font-mono opacity-75">{apt.time?.split(" ")[0]}</span>{" "}
                          <span className="font-semibold">{apt.patientName}</span>
                        </button>
                      );
                    })}
                    {cellAppts.length > 2 && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ps-1">
                        +{cellAppts.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════════════════ LIST VIEW ════════════════════════ */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1">
            {([
              { key: "all" as StatusFilter, label: labels.all, count: listAppointments.length },
              { key: "scheduled" as StatusFilter, label: labels.scheduled, count: listAppointments.filter((a) => a.status === "scheduled").length },
              { key: "completed" as StatusFilter, label: labels.completed, count: listAppointments.filter((a) => a.status === "completed").length },
              { key: "cancelled" as StatusFilter, label: labels.cancelled, count: listAppointments.filter((a) => a.status === "cancelled").length },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                  statusFilter === tab.key
                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                    : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${
                    statusFilter === tab.key ? "bg-white/20 dark:bg-slate-900/30 text-white dark:text-slate-900" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Appointment cards or empty state */}
          {filteredListAppointments.length === 0 ? (
            <div className="p-10 sm:p-14 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-4">
                <CalendarClock className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{labels.noAppointments}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1.5 mb-5 leading-relaxed">{labels.noAppointmentsDesc}</p>
              <button type="button" onClick={() => setBookModalDate(todayYMD)} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer transition-all shadow-xs active:scale-[0.98]">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{labels.addAppointment}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedListAppointments.map((group) => {
                const groupDate = new Date(`${group.date}T00:00:00`);
                const isGroupToday = group.date === todayYMD;
                const weekdayIndex = isNaN(groupDate.getDay()) ? 0 : groupDate.getDay();
                const dayName = weekDayNames[weekdayIndex] || "";

                return (
                  <div key={group.date} className="space-y-2.5">
                    {/* Date Section Header */}
                    <div className="flex items-center gap-2.5 px-1 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                          {dayName} • {formatStaticDate(group.date, language)}
                        </h3>
                      </div>
                      {isGroupToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {labels.today}
                        </span>
                      )}
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        ({group.appointments.length})
                      </span>
                      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800/80" />
                    </div>

                    {/* Group Appointments */}
                    <div className="space-y-2.5">
                      {group.appointments.map((apt) => renderAppointmentCard(apt))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════ APPOINTMENT DETAILS MODAL ════════════════════════ */}
      {detailsAppointment && (() => {
        const apt = detailsAppointment;
        const isDone = apt.status === "completed";
        const isCancelled = apt.status === "cancelled";
        const isScheduled = apt.status === "scheduled";
        const whatsAppUrl = apt.phone
          ? getAppointmentReminderWhatsAppUrl({ phone: apt.phone, patientName: apt.patientName, clinicName: settings.clinicName, doctorName: settings.doctorName, date: apt.date, time: apt.time, language })
          : "";

        return (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in"
            onClick={() => setDetailsAppointment(null)}
          >
            <div
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md animate-in zoom-in-95 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{getInitials(apt.patientName)}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold capitalize text-slate-900 dark:text-slate-100">{apt.patientName}</h3>
                    <p className="text-xs text-slate-500">{formatStaticDate(apt.date, language)} • {apt.time}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setDetailsAppointment(null)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-3">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${statusBadgeStyles[apt.status]}`}>
                    {apt.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                    {apt.status === "scheduled" && <Clock className="w-3 h-3" />}
                    {statusLabels[apt.status]}
                  </span>
                </div>

                {/* Treatment */}
                {apt.treatment && (
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{apt.treatment}</span>
                  </div>
                )}

                {/* Phone */}
                {apt.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`tel:${apt.phone}`} className="text-sm text-slate-700 dark:text-slate-300 hover:text-sky-600 font-mono">{apt.phone}</a>
                  </div>
                )}

                {/* Notes */}
                {apt.notes && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3">{apt.notes}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                {onStartVisit && isScheduled && (
                  <button type="button" onClick={() => { onStartVisit(apt); setDetailsAppointment(null); }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-sky-600 hover:bg-sky-700 text-white shadow-sm active:scale-95 transition-all cursor-pointer">
                    <span>🩺</span><span>{labels.startVisit}</span>
                  </button>
                )}
                {apt.phone && isScheduled && (
                  <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5 fill-current" /><span>{labels.whatsappReminder}</span>
                  </a>
                )}
                {isScheduled && (
                  <button type="button" onClick={() => { onToggleStatus(apt.id, "cancelled"); setDetailsAppointment(null); }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 active:scale-95 transition-all cursor-pointer">
                    <X className="w-3.5 h-3.5" /><span>{labels.cancel}</span>
                  </button>
                )}
                {isDone && (
                  <button type="button" onClick={() => { onToggleStatus(apt.id, "scheduled"); setDetailsAppointment(null); }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 active:scale-95 transition-all cursor-pointer">
                    <Clock className="w-3.5 h-3.5" /><span>{labels.markScheduled}</span>
                  </button>
                )}
                {isCancelled && (
                  <button type="button" onClick={() => { onToggleStatus(apt.id, "scheduled"); setDetailsAppointment(null); }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-sky-700 border border-sky-200 hover:bg-sky-50 active:scale-95 transition-all cursor-pointer">
                    <CalendarIcon className="w-3.5 h-3.5" /><span>{labels.markScheduled}</span>
                  </button>
                )}
                <button type="button" onClick={() => { onDeleteAppointment(apt.id); setDetailsAppointment(null); }} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 active:scale-95 transition-all cursor-pointer ms-auto">
                  <Trash2 className="w-3.5 h-3.5" /><span>{labels.deleteAppt}</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ════════════════════════ BOOK APPOINTMENT MODAL ════════════════════════ */}
      {bookModalDate && (
        <BookAppointmentModal
          isOpen={Boolean(bookModalDate)}
          initialDate={bookModalDate}
          existingPatients={patients}
          onClose={() => setBookModalDate(null)}
          onBookAppointment={(data) => {
            onAddAppointment(data);
            setBookModalDate(null);
          }}
        />
      )}
    </div>
  );
}
