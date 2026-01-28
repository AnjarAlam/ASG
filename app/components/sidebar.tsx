"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  Home,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Settings,
  MessageSquare,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Wallet,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Collapse sidebar on mobile by default
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

  if (!isAuthenticated) return null;

  const role = (user?.role || "").toUpperCase();

  // Define menu items based on role
  const getNavItems = () => {
    const baseItems = [
      { name: "Dashboard", icon: Home, path: "/dashboard/dash" },
    ];

    if (role === "ADMIN") {
      return [
        ...baseItems,
        { name: "Inventory", icon: Package, path: "/dashboard/inventory" },
        { name: "Inward", icon: ArrowDownToLine, path: "/dashboard/inward" },
        { name: "Outward", icon: ArrowUpFromLine, path: "/dashboard/outward" },
        { name: "Labour Management", icon: HardHat, path: "/dashboard/labour" },
        { name: "DO Report", icon: Wallet, path: "/dashboard/DOsection" },
        { name: "Reports", icon: BarChart3, path: "/dashboard/reports" },
        { name: "Chat", icon: MessageSquare, path: "/dashboard/chat" },
        { name: "Users", icon: Users, path: "/dashboard/users" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },

      ];
    }

    if (role === "OPERATOR") {
      return [
        ...baseItems,
        { name: "Inventory", icon: Package, path: "/dashboard/inventory" },
        { name: "Inward", icon: ArrowDownToLine, path: "/dashboard/inward" },
        { name: "Outward", icon: ArrowUpFromLine, path: "/dashboard/outward" },
        { name: "Labour Management", icon: HardHat, path: "/dashboard/labour" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },

      ];
    }

    if (role === "SUPERVISOR") {
      return [
        ...baseItems,
        { name: "Inventory", icon: Package, path: "/dashboard/inventory" },
        { name: "Inward", icon: ArrowDownToLine, path: "/dashboard/inward" },
        { name: "Outward", icon: ArrowUpFromLine, path: "/dashboard/outward" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },

      ];
    }

    if (role === "ACCOUNTS") {
      return [
        ...baseItems,
        { name: "DO Report", icon: Wallet, path: "/dashboard/DOsection" },
        { name: "Reports", icon: BarChart3, path: "/dashboard/reports" },
        { name: "Settings", icon: Settings, path: "/dashboard/settings" },
      ];
    }

    // Default / unknown role → minimal access
    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => pathname.startsWith(path);

  const canCreateNewEntry =
    role === "ADMIN" || role === "OPERATOR" || role === "SUPERVISOR";

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="fixed top-5 left-5 z-50 lg:hidden w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg transition-colors"
        onClick={() => setMobileOpen(true)}
      >
        <Package className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-gradient-to-b from-gray-950 to-gray-900
          border-r border-gray-800
          transition-all duration-500 ease-out
          ${collapsed ? "w-20" : "w-72"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo / Header */}
        <div className="h-20 flex items-center px-5 border-b border-gray-800/60">
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md flex-shrink-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span
              className={`
                text-3xl font-bold text-white tracking-tight
                transition-all duration-500
                ${collapsed ? "opacity-0 w-0" : "opacity-100"}
              `}
            >
              Washery
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-hide hide-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-300
                  ${
                    active
                      ? "bg-indigo-600/25 text-white border border-indigo-500/40 shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                  }
                `}
                onClick={() => setMobileOpen(false)}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    active ? "text-indigo-400" : "group-hover:text-indigo-400"
                  } transition-colors`}
                />
                <span
                  className={`
                    transition-all duration-500 whitespace-nowrap overflow-hidden
                    ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
                  `}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-5 pb-6 pt-4 border-t border-gray-800/60 space-y-4">
          {canCreateNewEntry && (
            <button
              onClick={() => {
                router.push("/dashboard/inward/new");
                setMobileOpen(false);
              }}
              className={`
                w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700
                hover:from-indigo-500 hover:to-indigo-600
                text-white font-medium flex items-center justify-center gap-2
                shadow-lg transition-all duration-300
              `}
            >
              <Plus className="w-5 h-5" />
              <span
                className={`
                  transition-all duration-500 whitespace-nowrap overflow-hidden
                  ${collapsed ? "opacity-0 w-0" : "opacity-100"}
                `}
              >
                New Entry
              </span>
            </button>
          )}

          {/* Collapse toggle - visible only on desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full h-10 items-center justify-center rounded-xl bg-gray-800/60 hover:bg-gray-700/60 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      {/* Spacer for main content (desktop only) */}
      <div
        className={`hidden lg:block transition-all duration-500 ${
          collapsed ? "w-20" : "w-72"
        }`}
      />
    </>
  );
}