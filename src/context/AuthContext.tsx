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
  roleOverride: null,
  setRoleOverride: () => {},
  badgeLabel: "دکتۆر / Doctor",
  enableOfflineAccess: () => {},
});

/**
 * Extracts role from Supabase Auth user metadata (user.user_metadata.role).
 * Default fallback to 'doctor' if no role is explicitly set.
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
  const [roleOverride, setRoleOverrideState] = useState<UserRole | null>(null);
  const [offlineAccess, setOfflineAccess] = useState(false);

  // Load preview override from sessionStorage if exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOverride = sessionStorage.getItem("clinic_role_override") as UserRole | null;
      if (savedOverride === "doctor" || savedOverride === "secretary") {
        setRoleOverrideState(savedOverride);
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
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setSessionChecked(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const setRoleOverride = useCallback((newOverride: UserRole | null) => {
    setRoleOverrideState(newOverride);
    if (typeof window !== "undefined") {
      if (newOverride) {
        sessionStorage.setItem("clinic_role_override", newOverride);
      } else {
        sessionStorage.removeItem("clinic_role_override");
      }
    }
  }, []);

  const enableOfflineAccess = useCallback(() => {
    setOfflineAccess(true);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setOfflineAccess(false);
    setRoleOverride(null);
  }, [supabase, setRoleOverride]);

  // Determine actual role from user metadata with fallback to 'doctor'
  const actualRole: UserRole = useMemo(() => {
    return extractRoleFromUser(user);
  }, [user]);

  // Effective role applies override if set (e.g., doctor previewing receptionist view)
  const role: UserRole = roleOverride || actualRole;
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

  const isAuthenticated = Boolean(session) || offlineAccess;

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
      roleOverride,
      setRoleOverride,
      badgeLabel,
      enableOfflineAccess,
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
      roleOverride,
      setRoleOverride,
      badgeLabel,
      enableOfflineAccess,
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
