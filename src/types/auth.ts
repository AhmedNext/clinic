import { User, Session } from "@supabase/supabase-js";

export type UserRole = "doctor" | "secretary";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isDoctor: boolean;
  isSecretary: boolean;
  userName: string;
  sessionChecked: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  roleOverride: UserRole | null;
  setRoleOverride: (role: UserRole | null) => void;
  badgeLabel: string;
  enableOfflineAccess: () => void;
}
