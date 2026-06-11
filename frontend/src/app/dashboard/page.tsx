"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Users,
  LogOut,
  Bell,
  Map,
  Loader2,
  Menu,
  X,
} from "lucide-react";

import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/lib/authStore";

// Clean Absolute Mapping Aliases
import { AuroraBackground } from "@/components/ui/aurora-background";
import { SideNavItem } from "@/components/ui/side-nav-item";
import { TripItem } from "@/features/dashboard/types/dashboard.types";
import { OverviewView } from "@/features/dashboard/views/overview-view";
import { WorkspaceView } from "@/features/dashboard/views/workspace-view";
import { tripService } from "@/services/trip.service";

import { TripsPage } from "./trips-page";
import CollaboratorsPage from "./CollaboratorsPage";
// import { Ai } from "./ai";

export default function MainDashboard() {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const logout = useAuthStore((state) => state.logout);
  const { user, fetchUser, isLoading: isUserLoading } = useUserStore();

  const [trips, setTrips] = useState<TripItem[]>([]);
  const [isTripsLoading, setIsTripsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const fetchTrips = useCallback(async () => {
    if (!token) return;
    setIsTripsLoading(true);
    try {
      setTrips(await tripService.getTrips());
    } catch (err) {
      console.error("Dashboard connection error pipeline:", err);
    } finally {
      setIsTripsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      fetchUser();
      queueMicrotask(() => {
        void fetchTrips();
      });
    }
  }, [token, router, fetchUser, fetchTrips]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isUserLoading) {
    return (
      <div className="h-screen w-screen bg-[#06080c] flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-500" size={28} />
        <p className="text-slate-500 text-xs tracking-wider">
          Configuring secure ecosystem clusters...
        </p>
      </div>
    );
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Trip Blueprints", icon: Compass },
    { label: "Collaborators", icon: Users },
    // { label: "AI Guide Node", icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#06080c] text-slate-100 relative overflow-x-hidden">
      <AuroraBackground />

      {/* ── TOP NAV BAR (Mobile & Tablet Exclusive) ── */}
      <header className="md:hidden flex h-16 items-center justify-between px-4 sticky top-0 bg-[#06080c]/80 backdrop-blur-md border-b border-white/[0.04] z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            <Map size={14} className="text-[#06080c]" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight block">
              Aether Travel
            </span>
            <span className="text-[8px] text-cyan-500 font-bold tracking-widest uppercase block">
              Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <Bell size={14} />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.06] rounded-xl transition-colors"
          >
            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </header>

      {/* Main Structural Layout Wrapper */}
      <div className="flex">
        {/* ── DESKTOP SIDEBAR RAIL ── */}
        <aside className="hidden md:flex flex-col w-64 fixed top-0 bottom-0 left-0 bg-[#080a10]/60 backdrop-blur-2xl border-r border-white/[0.06] z-30 p-5 justify-between">
          <div className="space-y-8">
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.25)]">
                <Map size={16} className="text-[#06080c]" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight block">
                  Aether Travel
                </span>
                <span className="text-[9px] text-cyan-500 font-bold tracking-widest uppercase block">
                  Workspace
                </span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <SideNavItem
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  active={activeTab === item.label}
                  onClick={() => setActiveTab(item.label)}
                />
              ))}
            </nav>
          </div>

          <div className="border-t border-white/[0.06] pt-4 space-y-3">
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs text-white font-bold">
                {user?.name?.slice(0, 2).toUpperCase() || "AM"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "Developer"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/[0.02] border-none bg-transparent cursor-pointer transition-colors"
            >
              <LogOut size={14} /> Log Out Node
            </button>
          </div>
        </aside>

        {/* ── MOBILE OVERLAY DRAWER PANEL ── */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex justify-end">
            {/* Backdrop click barrier dismisses menu */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <div className="relative w-72 max-w-[80vw] h-full bg-[#080a10]/95 border-l border-white/[0.06] p-6 flex flex-col justify-between shadow-2xl animate-slideLeft">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
                  <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                    Account Profile
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-slate-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] p-3 rounded-2xl">
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-400 font-bold">
                    {user?.name?.slice(0, 2).toUpperCase() || "AM"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {user?.name || "Developer"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pb-20">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut size={14} /> Close Session Node
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT FLUID OPERATIONS VIEWPORT AREA ── */}
        <main className="flex-1 md:ml-64 min-h-screen px-4 sm:px-8 lg:px-12 py-4 md:py-6 pb-24 md:pb-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Bar telemetry status headers (Desktop Only) */}
            <div className="hidden md:flex justify-between items-center border-b border-white/[0.04] pb-4">
              <div className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
                System Framework:{" "}
                <span className="text-emerald-400">● MAPPED</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-white bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <Bell size={14} />
              </button>
            </div>

            {/* Dynamic Rendering Section Mapping Switch */}
            <div className="min-h-[60vh] md:min-h-[70vh]">
              {activeTab === "Dashboard" && (
                <OverviewView
                  trips={trips}
                  isLoading={isTripsLoading}
                  userDisplayName={user?.name || "Developer"}
                  setActiveTab={setActiveTab}
                />
              )}
              {activeTab === "Trip Blueprints" && <TripsPage />}
              {activeTab === "Collaborators" && (
                <CollaboratorsPage
                  trips={trips}
                  accessToken={token || ""}
                  triggerToast={() => {}}
                />
              )}
              {/* {activeTab === "AI Guide Node" && <Ai />} */}
            </div>
          </div>
        </main>

        {/* ── MOBILE BOTTOM NAVIGATION NAVIGATION RAIL ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#080a10]/80 backdrop-blur-lg border-t border-white/[0.06] flex items-center justify-around px-2 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.label;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors border-none bg-transparent cursor-pointer ${
                  isActive
                    ? "text-cyan-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon
                  size={16}
                  className={
                    isActive ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : ""
                  }
                />
                <span className="text-[9px] font-medium tracking-tight whitespace-nowrap">
                  {item.label.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
