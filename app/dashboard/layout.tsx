"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import Sidebar from "../components/sidebar"; 

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
    <html lang="en" className="hide-scrollbar scroll-smooth">
      <body className="bg-gray-950 text-gray-100 overflow-x-hidden">
        {isAuthenticated ? (
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 w-full overflow-x-hidden">
              {children}
            </main>
          </div>
        ) : (
          <main className="min-h-screen w-full overflow-x-hidden">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}