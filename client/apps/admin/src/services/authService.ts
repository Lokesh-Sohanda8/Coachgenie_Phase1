// apps/admin/src/services/authService.ts
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth.store";

export interface LoginResponse {
  access_token:  string;
  refresh_token: string;
  token_type:    string;
  user: {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await api.post<LoginResponse>("/auth/login", { email, password });
    const { setAuth } = useAuthStore.getState();
    setAuth(data.access_token, data.refresh_token, {
      ...(data.user as any),
      tenant_id: (data.user as any).tenant_id ?? "demo",
    });
    // also set cookie for middleware
    document.cookie = `cg_access_token=${data.access_token}; path=/; max-age=900; SameSite=Lax`;
    return data;
  },

  async logout() {
    try { await api.post("/auth/logout"); } catch {}
    useAuthStore.getState().clear();
    document.cookie = "cg_access_token=; path=/; max-age=0";
    window.location.href = "/login";
  },

  async me() {
    return api.get<LoginResponse["user"]>("/auth/me");
  },

  async forgotPassword(email: string) {
    return api.post("/auth/forgot-password", { email });
  },

  async verifyOtp(email: string, otp: string) {
    return api.post("/auth/verify-otp", { email, otp });
  },

  async resetPassword(email: string, otp: string, new_password: string) {
    return api.post("/auth/reset-password", { email, otp, new_password });
  },

  async changePassword(current_password: string, new_password: string) {
    return api.post("/auth/change-password", { current_password, new_password });
  },
};
