"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import Sidebar from "../components/sidebar"; // ← your sidebar component

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializeAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100">
        {isAuthenticated ? (
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        ) : (
          <main className="min-h-screen">{children}</main>
        )}
      </body>
    </html>
  );
}