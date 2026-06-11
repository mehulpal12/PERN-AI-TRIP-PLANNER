"use client";

import { useMemo } from "react";
import { 
  CalendarDays, 
  Sparkles, 
  MapPin, 
  Compass, 
  Clock, 
  Layers, 
  AlertCircle,
  TrendingUp
} from "lucide-react";

// Flexible structural contract matching your backend normalization setup
interface ItineraryDay {
  day: number | string;
  title: string;
  activities: string[];
}

interface Props {
  itinerary: any; // Dynamic data type handling to catch multiple input shapes safely
}

export default function ItineraryPage({ itinerary }: Props) {
  
  /**
   * MEMOIZED EXTRACTOR LAYER
   * Decouples the presentation layer from backend structural variations.
   * Extracts days and source metadata regardless of whether it's wrapped in deep objects.
   */
  const cleanData = useMemo(() => {
    if (!itinerary) return null;

    // Resolve source identifier flag
    const source = itinerary.source || itinerary.fullData?.source || "unknown";

    // Drill down to locate the raw day layout array
    let dayArray: ItineraryDay[] | null = null;
    
    if (Array.isArray(itinerary.days)) {
      dayArray = itinerary.days;
    } else if (itinerary.data?.days && Array.isArray(itinerary.data.days)) {
      dayArray = itinerary.data.days;
    } else if (itinerary.fullData?.data?.days && Array.isArray(itinerary.fullData.data.days)) {
      dayArray = itinerary.fullData.data.days;
    } else if (itinerary.data?.data?.days && Array.isArray(itinerary.data.data.days)) {
      dayArray = itinerary.data.data.days;
    }

    // Capture fallback metadata info strings if they exist
    const destination = itinerary.destination || itinerary.data?.destination || "";
    const travelStyle = itinerary.travelStyle || itinerary.data?.travelStyle || "";

    return dayArray ? { days: dayArray, source, destination, travelStyle } : null;
  }, [itinerary]);

  // Render empty placeholder if data extraction resolves to null
  if (!cleanData) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-800 bg-white/[0.01] p-8 text-center text-slate-400">
        <AlertCircle size={32} className="text-slate-600 animate-pulse" />
        <div>
          <h4 className="text-white font-medium text-base">No Data Structure Detected</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            The system could not parse standard itinerary schema arrays from this specific reference instance.
          </p>
        </div>
      </div>
    );
  }

  const { days, source, destination, travelStyle } = cleanData;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- HEADER BLOCK --- */}
        <div className="relative overflow-hidden bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sm:p-8 backdrop-blur-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-2xl">
          {/* Neon decorative background glow lines */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold tracking-wider uppercase">
              <Compass size={14} className="animate-spin-[spin_8s_linear_infinite]" />
              <span>Your Custom Journey</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {destination ? `${destination} Exploration` : "Generated Itinerary"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400 text-xs font-medium">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" /> {days.length} Total Active Days
              </span>
              {travelStyle && (
                <span className="bg-white/[0.04] px-2 py-0.5 rounded-md text-[10px] uppercase font-semibold text-slate-300 border border-white/[0.04]">
                  Style: {travelStyle}
                </span>
              )}
            </div>
          </div>

          {/* Infrastructure Caching Status Badge */}
          <div className="shrink-0 self-start md:self-center relative z-10">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider shadow-lg transition-all duration-300 ${
                source === "redis"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/5"
                  : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-cyan-500/5"
              }`}
            >
              {source === "redis" ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <Layers size={12} className="text-emerald-400" />
                  <span>⚡ Memory Cache (Redis)</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>🤖 Live Engine (Gemini)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* --- TIMELINE DECK CARDS --- */}
        <div className="relative border-l-2 border-slate-800/60 ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-8">
          {days.map((day, dayIndex) => (
            <div
              key={day.day || dayIndex}
              className="relative group transition-all duration-300"
            >
              {/* Floating Node Bullet Indicator */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 h-8 w-8 rounded-xl bg-[#0F1626] border-2 border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/80 font-bold text-xs flex items-center justify-center transition-all duration-300 shadow-xl group-hover:scale-105">
                {day.day}
              </div>

              {/* Day Blueprint Context Wrapper */}
              <div className="bg-white/[0.02] hover:bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl p-6 shadow-xl transition-all duration-350 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 bg-cyan-500/40 group-hover:h-full transition-all duration-300" />
                
                {/* Day Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/10 transition-colors duration-300">
                      <CalendarDays size={16} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors duration-300">
                        Day {day.day}
                      </h3>
                      <p className="text-slate-400 text-sm font-medium mt-0.5 tracking-wide">
                        {day.title || "No Title Specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sub Activity Map Loop */}
                <div className="space-y-4 pl-1">
                  {day.activities && day.activities.length > 0 ? (
                    day.activities.map((activity, index) => (
                      <div
                        key={index}
                        className="flex gap-4 items-start group/item"
                      >
                        <div className="mt-1.5 shrink-0 flex items-center justify-center">
                          <Sparkles
                            size={12}
                            className="text-cyan-500/40 group-hover/item:text-cyan-400 group-hover/item:scale-110 transition-all duration-200"
                          />
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed font-normal group-hover/item:text-slate-100 transition-colors duration-150">
                          {activity}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic pl-6">
                      No precise dynamic activities itemized for this period block.
                    </p>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Informative Footer Note */}
        <p className="text-center text-[11px] text-slate-600 tracking-wide pt-4 flex items-center justify-center gap-1.5">
          <TrendingUp size={11} /> Generation structured and optimized dynamically under Next.js server components.
        </p>

      </div>
    </div>
  );
}