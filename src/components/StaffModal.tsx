"use client";

import React, { useState, useEffect } from "react";
import { X, UserPlus, Mail, Lock, User, Trash2, ShieldCheck, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { StaffMember } from "@/types/staff";
import { createSecretaryAccount, fetchStaffFromDB, deleteStaffFromDB } from "@/utils/supabase/staff";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { formatStaticDate } from "@/utils/date";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffModal({ isOpen, onClose }: StaffModalProps) {
  const { t } = useLanguage();
  const { clinicOwnerId } = useAuth();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStaffFromDB(clinicOwnerId).then(setStaffList);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, clinicOwnerId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await createSecretaryAccount(name, email, password, clinicOwnerId);

    setIsLoading(false);
    if (!result.success) {
      setErrorMsg(result.error || "Failed to create secretary account.");
    } else {
      setSuccessMsg(`${t.secretaryCreatedSuccess} (${email})`);
      setName("");
      setEmail("");
      setPassword("");
      if (result.staffMember) {
        setStaffList((prev) => [result.staffMember!, ...prev.filter((s) => s.email !== email)]);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteStaffFromDB(id, clinicOwnerId);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
                {t.manageStaff}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {t.roleSecretaryDesc}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form: Add Secretary */}
          <form onSubmit={handleSubmit} className="space-y-3.5 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.addSecretary}</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.secretaryName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sara"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.secretaryEmail}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="reception@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t.secretaryPassword}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold shadow-md shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t.createSecretaryAccount}</span>
                </>
              )}
            </button>
          </form>

          {/* List of active staff */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              {t.activeStaff} ({staffList.length})
            </h4>

            {staffList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                {t.noStaffYet}
              </p>
            ) : (
              <div className="space-y-2">
                {staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {staff.name}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {t.roleSecretary}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {staff.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(staff.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
