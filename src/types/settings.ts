export interface ClinicSettings {
  clinicName: string;
  doctorName: string;
  phone?: string;
  address?: string;
}

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  clinicName: "Dental Clinic",
  doctorName: "Doctor",
  phone: "",
  address: "",
};
