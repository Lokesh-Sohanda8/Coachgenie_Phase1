import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "owner" | "counselor" | "tutor" | "parent" | "student";

export interface AuthUser {
  id:          string;
  email:       string;
  first_name?: string;
  last_name?:  string;
  role:        UserRole;
  tenant_id:   string;
}

interface AuthState {
  accessToken:  string | null;
  refreshToken: string | null;
  user:         AuthUser | null;
  tenantId:     string | null;
  role:         UserRole | null;
  setAuth:      (access: string, refresh: string, user: AuthUser) => void;
  clear:        () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken:  null,
      refreshToken: null,
      user:         null,
      tenantId:     null,
      role:         null,
      setAuth: (access, refresh, user) =>
        set({
          accessToken:  access,
          refreshToken: refresh,
          user,
          tenantId: user.tenant_id,
          role:     user.role,
        }),
      clear: () =>
        set({
          accessToken:  null,
          refreshToken: null,
          user:         null,
          tenantId:     null,
          role:         null,
        }),
    }),
    {
      name: "coachgenie-auth",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
    }
  )
);