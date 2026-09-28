"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ClinicSettings, DEFAULT_CLINIC_SETTINGS } from "@/types/settings";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "./AuthContext";

interface ClinicSettingsContextType {
  settings: ClinicSettings;
  updateSettings: (newSettings: Partial<ClinicSettings>) => Promise<void>;
  isLoaded: boolean;
}

const ClinicSettingsContext = createContext<ClinicSettingsContextType>({
  settings: DEFAULT_CLINIC_SETTINGS,
  updateSettings: async () => {},
  isLoaded: false,
});

export function ClinicSettingsProvider({ children }: { children: React.ReactNode }) {
  const { clinicOwnerId, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync settings when clinicOwnerId / authentication changes
  useEffect(() => {
    if (!isAuthenticated || !clinicOwnerId) {
      setSettings(DEFAULT_CLINIC_SETTINGS);
      setIsLoaded(true);
      return;
    }

    const cacheKey = `clinic_custom_settings_${clinicOwnerId}`;

    // 1. Load from user-isolated localStorage immediately
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } else {
          setSettings(DEFAULT_CLINIC_SETTINGS);
        }
      } catch (e) {
        console.error("Failed to load clinic settings from cache:", e);
      }
      setIsLoaded(true);
    }

    // 2. Sync from Supabase clinic_settings table for this clinic owner
    async function loadCloudSettings() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clinic_settings")
          .select("*")
          .or(`user_id.eq.${clinicOwnerId},id.eq.${clinicOwnerId}`)
          .maybeSingle();

        if (!error && data) {
          const cloudSettings: ClinicSettings = {
            clinicName: data.clinic_name || DEFAULT_CLINIC_SETTINGS.clinicName,
            doctorName: data.doctor_name || DEFAULT_CLINIC_SETTINGS.doctorName,
            phone: data.phone || "",
            address: data.address || "",
          };
          setSettings(cloudSettings);
          if (typeof window !== "undefined") {
            localStorage.setItem(cacheKey, JSON.stringify(cloudSettings));
          }
        }
      } catch {
        // Table or row might not exist yet; local cache or defaults are used
      }
    }

    loadCloudSettings();
  }, [isAuthenticated, clinicOwnerId]);

  const updateSettings = useCallback(
    async (newSettings: Partial<ClinicSettings>) => {
      if (!clinicOwnerId) return;
      const cacheKey = `clinic_custom_settings_${clinicOwnerId}`;

      setSettings((prev) => {
        const merged = { ...prev, ...newSettings };
        if (typeof window !== "undefined") {
          localStorage.setItem(cacheKey, JSON.stringify(merged));
        }
        return merged;
      });

      try {
        const supabase = createClient();
        await supabase.from("clinic_settings").upsert([
          {
            id: clinicOwnerId,
            user_id: clinicOwnerId,
            clinic_name: newSettings.clinicName,
            doctor_name: newSettings.doctorName,
            phone: newSettings.phone,
            address: newSettings.address,
            updated_at: new Date().toISOString(),
          },
        ]);
      } catch (e) {
        console.error("Failed to save clinic settings to Supabase:", e);
      }
    },
    [clinicOwnerId]
  );

  return (
    <ClinicSettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </ClinicSettingsContext.Provider>
  );
}

export function useClinicSettings() {
  return useContext(ClinicSettingsContext);
}
