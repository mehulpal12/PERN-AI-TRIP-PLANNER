"use client";
import React from "react";
import { LucideIcon } from "lucide-react";

interface SideNavItemProps {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}

export const SideNavItem: React.FC<SideNavItemProps> = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all border-none bg-transparent cursor-pointer ${
      active
        ? "bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
        : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
    }`}
  >
    <Icon size={14} className={active ? "text-cyan-400" : "text-slate-400"} />
    {label}
  </button>
);