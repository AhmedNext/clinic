"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ClinicSettings, DEFAULT_CLINIC_SETTINGS } from "@/types/settings";
import { createClient } from "@/utils/supabase/client";

const LOCAL_STORAGE_SETTINGS_KEY = "clinic_custom_settings";

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
  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load from localStorage immediately on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to load clinic settings from cache:", e);
      }
      setIsLoaded(true);
    }
  }, []);

  // 2. Sync from Supabase clinic_settings table if authenticated
  useEffect(() => {
    async function loadCloudSettings() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("clinic_settings")
          .select("*")
          .limit(1)
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
            localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(cloudSettings));
          }
        }
      } catch {
        // Table might not exist yet; local cache is used
      }
    }

    loadCloudSettings();
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<ClinicSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(merged));
      }
      return merged;
    });

    try {
      const supabase = createClient();
      await supabase.from("clinic_settings").upsert([
        {
          id: "primary",
          clinic_name: newSettings.clinicName,
          doctor_name: newSettings.doctorName,
          phone: newSettings.phone,
          address: newSettings.address,
          updated_at: new Date().toISOString(),
        },
      ]);
    } catch {
      // Local cache updated successfully
    }
  }, []);

  return (
    <ClinicSettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </ClinicSettingsContext.Provider>
  );
}

export function useClinicSettings() {
  return useContext(ClinicSettingsContext);
}
