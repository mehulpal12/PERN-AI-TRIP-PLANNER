"use client";

import { useState, useEffect, useCallback } from "react";
import AIForm from "@/components/ai/AIForm";
import LoadingState from "@/components/ai/loadingState";
import ItineraryCard from "@/components/ai/ItineraryCard";
import { useGenerateItinerary } from "@/hooks/useGenerateItinerary";
import { CalendarDays, MapPin, History, Compass, ArrowRight, Trash2, RotateCcw, Loader2 } from "lucide-react";
import axios from "axios";

// Standardizing structure definitions
interface SavedItinerarySummary {
  id: string; // The Redis key identifier
  destination: string;
  days: number;
  budget: number;
  travelStyle: string;
  createdAt?: string;
  fullData?: {
    source: string;
    data: any; 
  };
}

const API_BASE = process.env.NEXT_PUBLIC_AI_API || "http://localhost:4002/api/ai/trips"; 
// /api/ai/trips

export function Ai() {
  // 1. Core Async Hooks
  const { loading: generating, itinerary: freshlyGenerated, error: generationError, generate } = useGenerateItinerary();
  
  // 2. Component Reactive State
  const [activeItinerary, setActiveItinerary] = useState<any>(null);
  const [history, setHistory] = useState<SavedItinerarySummary[]>([]);
  
  // 3. UI Process Locks
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);
  const [loadingActiveItem, setLoadingActiveItem] = useState<boolean>(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState<boolean>(false);

  /**
   * DATA NORMALIZATION LAYER
   * Extracts pure downstream JSON data objects irrespective of origin mappings.
   */
  const normalizeItineraryData = (payload: any): any => {
    if (!payload) return null;
    if (payload.fullData?.data) return payload.fullData.data;
    if (payload.data?.data) return payload.data.data;
    if (payload.data) return payload.data;
    return payload;
  };

  /**
   * READ ALL: Refreshes historical sidebar summary index
   */
  const fetchUserHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const response = await axios.get(`${API_BASE}/history`);
      if (response.data?.success) {
        setHistory(response.data.data || []);
      }
    } catch (err: any) {
      console.error("Error pulling database history summary:", err?.response?.data || err.message);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Hydrate UI context on layout mount
  useEffect(() => {
    fetchUserHistory();
  }, [fetchUserHistory]);

  /**
   * CREATE PIPELINE STREAM WATCHER
   * Catches newly compiled engine records, forces display board render, & pushes to history stack.
   */
  useEffect(() => {
    if (freshlyGenerated) {
      const cleanItinerary = normalizeItineraryData(freshlyGenerated);
      setActiveItinerary(cleanItinerary);
      fetchUserHistory(); // Keep sidebar perfectly in sync
    }
  }, [freshlyGenerated, fetchUserHistory]);

  /**
   * READ ONE: Pulls specific target payload on explicit card select click
   * If your sidebar summary lacks full nested schemas, this queries the unique record explicitly.
   */
  const handleSelectHistoricalTrip = async (trip: SavedItinerarySummary) => {
    // Optimization: If summary payload already contains structural nesting data, omit remote trip lookup
    if (trip.fullData?.data) {
      setActiveItinerary(trip.fullData.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoadingActiveItem(true);
      // Fetching explicit nested blueprint directly by key signature
      const response = await axios.get(`${API_BASE}/itinerary/item/${trip.id}`);
      
      if (response.data?.success) {
        const structuralData = normalizeItineraryData(response.data.data);
        setActiveItinerary(structuralData);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Could not fetch unique data schema context:", err?.response?.data || err.message);
    } finally {
      setLoadingActiveItem(false);
    }
  };

  /**
   * DELETE ONE: Removes isolated instance key string from storage clusters
   */
  const handleDeleteItem = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation(); // Halt bubbling container panel select events
    if (deletingKey) return;

    try {
      setDeletingKey(tripId);
      const response = await axios.delete(`${API_BASE}/itinerary/remove-item`, {
        data: { key: tripId }
      });

      if (response.data?.success) {
        // Safe match evaluation logic to clear display workspace
        if (activeItinerary && (activeItinerary._id === tripId || activeItinerary?.id === tripId || activeItinerary?.key === tripId)) {
          setActiveItinerary(null);
        }
        setHistory((prev) => prev.filter((item) => item.id !== tripId));
      }
    } catch (err: any) {
      console.error("Failure running entry point deletion operation:", err?.response?.data || err.message);
    } finally {
      setDeletingKey(null);
    }
  };

  /**
   * DELETE ALL: Total systemic flush of data context
   */
  const handleClearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to completely clear out all generated itineraries from global storage?")) return;
    
    try {
      setClearingAll(true);
      const response = await axios.delete(`${API_BASE}/itinerary/clear-all`);
      
      if (response.data?.success) {
        setHistory([]);
        setActiveItinerary(null);
      }
    } catch (err: any) {
      console.error("Cache flush operational runtime failure:", err?.response?.data || err.message);
    } finally {
      setClearingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT HAND PANEL: FORM INPUT & SIDEBAR HISTORY --- */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Compass size={20} className="text-cyan-400" />
              Plan Your Adventure
            </h2>
            <AIForm onGenerate={generate} />
          </div>

          {/* HISTORY TRACKING SIDEBAR */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History size={18} className="text-slate-400" />
                Recent Generations
              </h3>
              
              {history.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  disabled={clearingAll}
                  className="text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 transition-all font-medium disabled:opacity-50"
                >
                  {clearingAll ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                  Clear All
                </button>
              )}
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 w-full rounded-xl bg-white/[0.02] animate-pulse" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                No past itineraries generated yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {history.map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => handleSelectHistoricalTrip(trip)}
                    className="w-full text-left bg-white/[0.01] hover:bg-cyan-500/[0.02] border border-white/[0.04] hover:border-cyan-500/20 p-3.5 rounded-xl flex items-center justify-between group transition-all duration-200 cursor-pointer"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        <MapPin size={13} className="text-cyan-400 shrink-0" />
                        {trip.destination}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 shrink-0">
                          <CalendarDays size={11} /> {trip.days} Days
                        </span>
                        <span className="bg-white/[0.05] px-1.5 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider truncate max-w-[100px]">
                          {trip.travelStyle}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS INTERACTION ITEMS */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleDeleteItem(e, trip.id)}
                        disabled={deletingKey === trip.id}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-150 disabled:opacity-100"
                      >
                        {deletingKey === trip.id ? (
                          <Loader2 size={13} className="animate-spin text-red-400" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT HAND PANEL: ACTIVE DISPLAY BOARD --- */}
        <div className="lg:col-span-2 space-y-6">
          {(generating || loadingActiveItem) && (
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 shadow-xl flex flex-col justify-center items-center min-h-[400px]">
              <LoadingState />
              {loadingActiveItem && <p className="text-sm text-cyan-400 mt-4 animate-pulse">Fetching complete trip data...</p>}
            </div>
          )}

          {generationError && !generating && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-400 text-sm font-medium shadow-lg">
              ⚠️ {generationError}
            </div>
          )}

          {activeItinerary && !generating && !loadingActiveItem ? (
            <div className="bg-white/[0.01] border border-white/[0.03] rounded-3xl p-2 shadow-2xl transition-all duration-300">
              <ItineraryCard itinerary={activeItinerary} />
            </div>
          ) : (
            (!generating && !loadingActiveItem) && (
              <div className="h-full min-h-[480px] border-2 border-dashed border-slate-800/60 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4 animate-pulse">
                  <Compass size={28} />
                </div>
                <h3 className="text-lg font-bold text-white">No Itinerary Selected</h3>
                <p className="text-slate-400 text-sm max-w-sm mt-1 mx-auto leading-relaxed">
                  Fill out the parameters on the left pane to build a fresh AI journey, or select a past journey from your tracking index deck.
                </p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
}