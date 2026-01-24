"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store"; // ← import your store
import {
  Home,
  Package,
  Truck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Scale,
  BarChart3,
  Settings,
  MessageSquare,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  HardHat,
  CreditCard,
  Wallet,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore(); // ← get user & auth state

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isAdmin = user?.role === "ADMIN"; // or "SUPER_ADMIN" if you have it

  const navItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard/dash" },
    { name: "Inventory", icon: Package, path: "/dashboard/inventory" },
    { name: "Inward", icon: ArrowDownToLine, path: "/dashboard/inward" },
    { name: "Outward", icon: ArrowUpFromLine, path: "/dashboard/outward" },
    { name: "Labour Management", icon: HardHat, path: "/dashboard/labour" },
    { name: "DO Report", icon: Wallet, path: "/dashboard/DOsection" },
    { name: "Reports", icon: BarChart3, path: "/dashboard/reports" },
    { name: "Chat", icon: MessageSquare, path: "/dashboard/chat" },

    // Only show "Users" to admins
    ...(isAdmin
      ? [{ name: "Users", icon: Users, path: "/dashboard/users" }]
      : []),

    { name: "Settings", icon: Settings, path: "/dashboard/settings" },
  ];

  return (
    <>
      {/* MOBILE TOGGLE BUTTON */}
      <button
        className="fixed top-9 left-4 z-50 lg:hidden w-13.5 h-13 rounded-xl bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center text-white shadow-lg hover:bg-indigo-700 transition-colors"
        onClick={() => setMobileOpen(true)}
      >
        <Package className="w-5 h-5" />
      </button>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-gradient-to-b from-gray-950 to-gray-900
          border-r border-gray-800
          transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${collapsed ? "w-20" : "w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* HEADER / LOGO */}
        <div className="h-20 flex items-center px-5 border-b border-gray-800/50">
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center flex-shrink-0 shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span
              className={`
                text-4xl font-semibold text-white tracking-tight
                transition-all duration-500 ease-in-out
                ${collapsed ? "opacity-0 w-0" : "opacity-100"}
              `}
            >
              Washery
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav
          className="
            flex-1 px-3 py-6 space-y-1.5 
            overflow-y-auto 
            scrollbar-hide
            [-ms-overflow-style:none]
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300 ease-in-out
                  ${
                    isActive
                      ? "bg-indigo-600/20 text-white border border-indigo-500/30"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/40"
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors duration-300
                    ${isActive ? "text-indigo-400" : "group-hover:text-indigo-400"}`}
                />
                <span
                  className={`
                    transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden
                    ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
                  `}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM ACTIONS */}
        <div className="px-5 pb-6 space-y-4 border-t border-gray-800/50 pt-4">
          <button
            onClick={() => {
              router.push("/dashboard/inward/new");
              setMobileOpen(false);
            }}
            className={`
              w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700
              text-white font-medium flex items-center justify-center gap-2
              shadow-lg hover:from-indigo-500 hover:to-indigo-600
              transition-all duration-300
            `}
          >
            <Plus className="w-5 h-5" />
            <span
              className={`
                transition-all duration-500 ease-in-out whitespace-nowrap overflow-hidden
                ${collapsed ? "opacity-0 w-0" : "opacity-100"}
              `}
            >
              New Entry
            </span>
          </button>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full h-10 items-center justify-center rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={`hidden lg:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          collapsed ? "w-20" : "w-72"
        }`}
      />
    </>
  );
}