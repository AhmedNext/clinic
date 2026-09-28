"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { UserRole, AuthContextType } from "@/types/auth";
import { useLanguage } from "./LanguageContext";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: "doctor",
  isDoctor: true,
  isSecretary: false,
  userName: "Doctor",
  sessionChecked: false,
  isAuthenticated: false,
  signOut: async () => {},
  badgeLabel: "دکتۆر / Doctor",
  isPasswordRecovery: false,
  setIsPasswordRecovery: () => {},
});

/**
 * Extracts role strictly from Supabase Auth user metadata (user.user_metadata.role).
 * Defaults fallback to 'doctor' only if no role is explicitly set.
 */
export function extractRoleFromUser(user: User | null | undefined): UserRole {
  if (!user) return "doctor";
  
  const rawRole =
    user.user_metadata?.role ??
    (user as { app_metadata?: { role?: string } }).app_metadata?.role;

  if (typeof rawRole === "string") {
    const normalized = rawRole.toLowerCase().trim();
    if (normalized === "secretary" || normalized === "receptionist") {
      return "secretary";
    }
    if (normalized === "doctor" || normalized === "admin") {
      return "doctor";
    }
  }

  // Default fallback to 'doctor' if no role is explicitly set
  return "doctor";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const supabase = useMemo(() => createClient(), []);

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Clear any legacy role overrides on mount & check for recovery / invite links in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("clinic_role_override");
      const hash = window.location.hash || "";
      if (hash.includes("type=recovery") || hash.includes("type=invite")) {
        setIsPasswordRecovery(true);
      }
    }
  }, []);

  // Sync Supabase Auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setSessionChecked(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setSessionChecked(true);

      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("clinic_role_override");
    }
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }, [supabase]);

  // Strict role derived from authenticated user metadata
  const role: UserRole = useMemo(() => {
    return extractRoleFromUser(user);
  }, [user]);

  const isDoctor = role === "doctor";
  const isSecretary = role === "secretary";

  // Friendly display name
  const userName = useMemo(() => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) {
      const prefix = user.email.split("@")[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return isSecretary ? t.receptionistTitle : t.doctorTitle;
  }, [user, isSecretary, t]);

  // Badge label (e.g. 'دکتۆر / Doctor' or 'سکرتێر / Receptionist')
  const badgeLabel = isSecretary ? t.roleSecretaryBadge : t.roleDoctorBadge;

  const isAuthenticated = Boolean(session);

  const contextValue = useMemo(
    () => ({
      user,
      session,
      role,
      isDoctor,
      isSecretary,
      userName,
      sessionChecked,
      isAuthenticated,
      signOut,
      badgeLabel,
      isPasswordRecovery,
      setIsPasswordRecovery,
    }),
    [
      user,
      session,
      role,
      isDoctor,
      isSecretary,
      userName,
      sessionChecked,
      isAuthenticated,
      signOut,
      badgeLabel,
      isPasswordRecovery,
      setIsPasswordRecovery,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
