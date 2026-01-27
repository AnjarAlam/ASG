
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { User } from "@/types/user"

interface UserState {
  users: User[]
  loading: boolean
  initializeUsers: () => void
  addUser: (user: Omit<User, "id" | "createdAt" | "updatedAt">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  getUserById: (id: string) => User | undefined
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      loading: false,

      initializeUsers: () => {
        const state = get()
      },

      addUser: (userData) => {
        const newUser: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, newUser],
        }))
      },

      updateUser: (id, userData) => {
        set((state) => ({
          users: state.users.map((user) =>
            user.id === id ? { ...user, ...userData, updatedAt: new Date().toISOString() } : user,
          ),
        }))
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        }))
      },

      getUserById: (id) => {
        const state = get()
        return state.users.find((user) => user.id === id)
      },
    }),
    {
      name: "user-storage",
    },
  ),
)
