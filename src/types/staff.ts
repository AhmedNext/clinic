export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: "secretary" | "doctor";
  createdAt: number;
}
