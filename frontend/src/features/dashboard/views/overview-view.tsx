"use client";

import React, { Dispatch, SetStateAction } from "react";
import { TripItem } from "@/features/dashboard/types/dashboard.types";
import { 
  Compass, 
  Layers, 
  DollarSign, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  MapPin 
} from "lucide-react";

// 1. Define the explicit Props contract matching your exact parent state pass
interface OverviewViewProps {
  trips: TripItem[];
  isLoading: boolean;
  userDisplayName: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export function OverviewView({ trips, isLoading, userDisplayName, setActiveTab }: OverviewViewProps) {
  
  // Dynamic calculation based on live incoming trips from your Redis pool
  const totalTripsCount = trips.length;
  const recentActivities = trips.slice(0, 3).map((trip) => ({
    id: (trip._id) as string,
    destination: trip.destination,
    // type: trip.travelStyle,
    time: "Saved Itinerary",
    // days: trip.days
  }));

  const operationalStats = [
    {
      title: "Welcome Back",
      value: userDisplayName || "Explorer",
      description: "Active system terminal user",
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-500/5",
    },
    {
      title: "AI Routes Compiled",
      value: isLoading ? "Loading..." : `${totalTripsCount} Total`,
      description: "Synchronized from Redis pool",
      icon: Compass,
      color: "text-cyan-400",
      bg: "bg-cyan-500/5",
    },
    {
      title: "Global Cache Hits",
      value: "100%",
      description: "Optimized persistent layers",
      icon: Layers,
      color: "text-purple-400",
      bg: "bg-purple-500/5",
    },
    {
      title: "Avg Engine Response",
      value: "1.8s",
      description: "Powered by Gemini Pro",
      icon: DollarSign,
      color: "text-amber-400",
      bg: "bg-amber-500/5",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          System Overview
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Real-time diagnostics and telemetry mapping for your generative engine.
        </p>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {operationalStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-white/[0.1] transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
                <TrendingUp size={12} className="text-emerald-500" />
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* RECENT FEED & QUICK CONTROL LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            Live Cache Stream
          </h3>
          
          {isLoading ? (
            <p className="text-sm text-slate-500 py-4">Syncing stream logs...</p>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-500 mb-3">No active itineraries detected in database pool.</p>
              <button 
                onClick={() => setActiveTab("ai")} 
                className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 px-3 py-1.5 rounded-lg font-medium transition-all"
              >
                Launch Generation Engine
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04] space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between pt-3 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{act.destination}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        {/* <span>{act.type}</span> */}
                        <span className="h-1 w-1 rounded-full bg-slate-700" />
                        {/* <span>{act.days} Days</span> */}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={11} /> {act.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/[0.01] border border-white/[0.04] rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Cluster Status</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engine deployment structures are operating under nominal workloads globally.
            </p>
          </div>
          <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-center gap-3 text-xs text-cyan-300 my-4">
            <div className="h-2 w-2 rounded-full bg-cyan-400定位 animate-ping shrink-0" />
            Redis nodes active and listening.
          </div>
        </div>
      </div>
    </div>
  );
}