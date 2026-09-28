"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Lock, Mail, ShieldCheck, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useClinicSettings } from "@/context/ClinicSettingsContext";
import { LanguageToggle } from "./LanguageToggle";

interface LoginModalProps {
  onSuccess: () => void;
}

export function LoginScreen({ onSuccess }: LoginModalProps) {
  const { t } = useLanguage();
  const { enableOfflineAccess } = useAuth();
  const { settings } = useClinicSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || "Invalid credentials. Please verify your password.");
      } else if (data.session) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-slate-950 text-slate-100 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Top Language Toggle */}
      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20">
        <LanguageToggle />
      </div>

      {/* Ambient Radial Lights */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/25 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      {/* Medical subtle dot grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 ring-1 ring-white/10">
        {/* Clinic Brand & Doctor Portrait */}
        <div className="text-center mb-7 relative">
          <div className="relative inline-block mx-auto mb-4 group">
            {/* Ambient outer glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition duration-700 animate-pulse" />

            {/* Doctor Photo Frame */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-indigo-500 via-violet-500 to-cyan-400 shadow-2xl ring-4 ring-white/10">
              <div className="w-full h-full rounded-[20px] bg-gradient-to-b from-slate-800 via-indigo-950 to-slate-950 overflow-hidden relative flex items-end justify-center">
                {/* Radial spotlight behind doctor */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.45)_0%,_transparent_75%)]" />
                <Image
                  src="/dr.png"
                  alt="Clinic Portal"
                  width={140}
                  height={140}
                  priority
                  className="w-full h-full object-cover object-top scale-115 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-120"
                />
              </div>
            </div>

            {/* Online / Active Clinic Badge */}
            <div className="absolute -bottom-1 -right-1 rtl:-right-auto rtl:-left-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-lg border-2 border-slate-900 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>{settings.clinicName || t.clinicPortalTitle}</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/25 text-indigo-300 border border-indigo-400/30 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              Pro
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/80 font-medium mt-1">
            {t.clinicPortalSubtitle}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.doctorEmail}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
                className="w-full pl-10 rtl:pl-4 rtl:pr-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.password}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 rtl:pl-10 rtl:pr-10 pr-10 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white text-sm font-bold shadow-lg shadow-indigo-600/35 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.unlockDashboard}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Offline / Cached Clinic Access Shortcut */}
        <div className="mt-5 pt-4 border-t border-white/10 text-center space-y-2">
          <button
            type="button"
            onClick={() => {
              enableOfflineAccess();
              onSuccess();
            }}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-indigo-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <span>{t.offlineCacheAccess}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
          </button>
          <p className="text-[11px] text-slate-400">
            🔒 {t.offlineCacheDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
