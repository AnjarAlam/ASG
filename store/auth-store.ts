"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "ADMIN" | "OPERATOR" | "USER" | "SUPER_ADMIN" | string

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // ─── Core actions ────────────────────────────────────────────────
  initializeAuth: () => void
  login: (email: string, password: string) => Promise<boolean>
  signup: (data: {
    name: string
    email: string
    mobileNumber: string
    password: string
    role?: UserRole           // optional — backend may restrict/ignore it
  }) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,           // ← Changed: start as true to prevent early redirect
      error: null,

      // ─── Initialize from localStorage ──────────────────────────────
      initializeAuth: () => {
        try {
          const storedAccess = localStorage.getItem("access_token")
          const storedUser = localStorage.getItem("auth_user")

          if (storedAccess && storedUser) {
            const user = JSON.parse(storedUser)
            if (user?.id && user?.email) {
              set({
                user,
                accessToken: storedAccess,
                isAuthenticated: true,
                isLoading: false,
                error: null
              })
              return
            }
          }
        } catch (err) {
          console.error("Auth init failed:", err)
        }

        set({ 
          isAuthenticated: false, 
          isLoading: false,      // ← Always set to false when finished
          error: null 
        })
      },

      // ─── Login ─────────────────────────────────────────────────────
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const res = await fetch(`${API_BASE}/user-auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(data.message || "Invalid credentials")
          }

          const { organization, accessToken, refreshToken } = data

          if (!accessToken || !organization) {
            throw new Error("Invalid server response")
          }

          const user: AuthUser = {
            id: organization.id,
            name: organization.name,
            email: organization.email,
            role: organization.role
          }

          localStorage.setItem("access_token", accessToken)
          if (refreshToken) localStorage.setItem("refresh_token", refreshToken)
          localStorage.setItem("auth_user", JSON.stringify(user))

          set({
            user,
            accessToken,
            refreshToken: refreshToken || null,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          return true
        } catch (err: any) {
          const msg = err.message?.includes("Invalid")
            ? "Invalid email or password"
            : err.message || "Login failed"
          set({ error: msg, isLoading: false })
          return false
        }
      },

      // ─── Signup / Create New User ────────────────────────────────
      signup: async ({ name, email, mobileNumber, password, role = "OPERATOR" }) => {
        set({ isLoading: true, error: null })

        try {
          const payload = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            mobileNumber: mobileNumber.trim(),
            password,
            role,                
            status: true
          }

          const res = await fetch(`${API_BASE}/user-auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
          })

          const data = await res.json()

          if (!res.ok) {
            throw new Error(
              data.message ||
              data.error ||
              "Failed to create user. Please check your input."
            )
          }

          set({
            isLoading: false,
            error: null
          })

          return {
            success: true,
            message: "User created successfully! You can now log in."
          }
        } catch (err: any) {
          const msg = err.message || "Failed to create account. Please try again."
          set({ error: msg, isLoading: false })
          return { success: false, message: msg }
        }
      },

      // ─── Logout ─────────────────────────────────────────────────────
      logout: () => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("auth_user")

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      }
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)