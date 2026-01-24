"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "ADMIN" | "OPERATOR" | "SUPER_ADMIN" | string; // extend as needed

export interface AuthUser {
  id: string;           // comes as organization.id
  name: string;
  email: string;
  role: UserRole;
  // permissions?: string[];   ← not returned in login → load separately if needed
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Core actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;

  // Optional future methods
  refreshSession?: () => Promise<boolean>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      initializeAuth: () => {
        try {
          const storedAccess = localStorage.getItem("access_token");
          const storedRefresh = localStorage.getItem("refresh_token");
          const storedUser = localStorage.getItem("auth_user");

          if (storedAccess && storedUser) {
            set({
              accessToken: storedAccess,
              refreshToken: storedRefresh || null,
              user: JSON.parse(storedUser),
              isAuthenticated: true,
            });
          }
        } catch (err) {
          console.error("Auth init failed:", err);
          set({ isAuthenticated: false });
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`${API_BASE}/user-auth/login`, {
            // ← adjust endpoint if different (e.g. /auth/login, /auth/signin)
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.message || "Invalid email or password"
            );
          }

          // Expected structure from your service
          const { organization, accessToken, refreshToken } = data;

          if (!accessToken || !organization) {
            throw new Error("Invalid response from server");
          }

          const user: AuthUser = {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            role: organization.role,
          };

          // Save tokens & user
          localStorage.setItem("access_token", accessToken);
          if (refreshToken) {
            localStorage.setItem("refresh_token", refreshToken);
          }
          localStorage.setItem("auth_user", JSON.stringify(user));

          set({
            user,
            accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (err: any) {
          const msg =
            err.message?.includes("Invalid")
              ? "Invalid email or password"
              : err.message || "Login failed. Please try again.";
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("auth_user");

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

    }),

    {
      name: "auth-storage", 
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);