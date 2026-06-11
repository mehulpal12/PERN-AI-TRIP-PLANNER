"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Trash2,
  Edit3,
  X,
  Loader2,
  Globe,
  ChevronDown,
  Check,
  Users,
  Sparkles,
  Compass,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { API_ROUTES } from "@/config/api";
import { Country, City } from "country-state-city";
import { TripItem, TripMember } from "@/features/dashboard/types/dashboard.types";
import { tripService } from "@/services/trip.service";
import { aiService } from "@/services/ai.service";

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

interface AiItineraryResponse {
  success: boolean;
  source: string;
  data: {
    days?: ItineraryDay[];
  } | ItineraryDay[];
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;

export const TripsPage: React.FC = () => {
  const token = useAuthStore((state) => state.accessToken);

  const [trips, setTrips] = useState<TripItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "budget" | "date">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("");

  const countryRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  const [formState, setFormState] = useState({
    title: "",
    country: "",
    destination: "",
    startDate: "",
    endDate: "",
    budget: 0,
    notes: "",
  });

  const [members, setMembers] = useState<TripMember[]>([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [collabDeleteTarget, setCollabDeleteTarget] = useState<TripMember | null>(null);
  const [newMemberName, setNewMemberName] = useState("");

  // States managing AI Engine Integration
  const [isGeneratingItinerary, setIsGeneratingItinerary] = useState(false);
  const [isFetchingItinerary, setIsFetchingItinerary] = useState(false);
  const [aiItinerary, setAiItinerary] = useState<ItineraryDay[] | null>(null);

  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const filteredCountries = useMemo(() => {
    const query = (formState.country || "").trim().toLowerCase();
    if (query === "") return allCountries.slice(0, 10);
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(query))
      .slice(0, 10);
  }, [allCountries, formState.country]);

  const filteredDestinations = useMemo(() => {
    const query = (formState.destination || "").trim().toLowerCase();
    if (selectedCountryCode) {
      const countryCities = City.getCitiesOfCountry(selectedCountryCode) || [];
      if (query === "") return countryCities.slice(0, 15);
      return countryCities
        .filter((c) => c.name.toLowerCase().includes(query))
        .slice(0, 15);
    } else {
      const fallbackCities = [
        { name: "Paris" },
        { name: "New York" },
        { name: "Tokyo" },
        { name: "London" },
        { name: "Dubai" },
        { name: "Singapore" },
      ];
      if (query === "") return fallbackCities;
      return fallbackCities.filter((c) => c.name.toLowerCase().includes(query));
    }
  }, [selectedCountryCode, formState.destination]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };

  const calculateDaysBetween = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays || 1;
  };

  const fetchTrips = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setApiError(null);
    try {
      setTrips(await tripService.getTrips());
    } catch (err: unknown) {
      setApiError(getErrorMessage(err, "Failed to download trip modules."));
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    void fetchTrips();
  }, [token, fetchTrips]);

  const fetchTripMembers = useCallback(async (tripId: string) => {
    if (!token) return;

    try {
      setCollabLoading(true);
      setMembers(await tripService.getMembers(tripId));
    } catch {
      triggerToast("Failed to load members");
    } finally {
      setCollabLoading(false);
    }
  }, [token]);

  // Read Layer Fallback: Passive verification checking if cache or DB has an itinerary ready
  const fetchExistingItinerary = useCallback(async (tripId: string) => {
    if (!token) return;
    setIsFetchingItinerary(true);
    try {
      const response = await fetch(`${API_ROUTES.TRIPS}/itinerary/${tripId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const resData: any = await response.json();
        if (resData.success && resData.data) {
          let targetDays = null;
          
          if (Array.isArray(resData.data)) {
            // Handle array of DB itinerary records (from prisma.trip.include.itinerary)
            if (resData.data.length > 0 && resData.data[0].itinerary) {
              // Use the most recently created itinerary (last item)
              const latestRecord = resData.data[resData.data.length - 1];
              targetDays = latestRecord.itinerary?.days;
            } else if (resData.data.length > 0 && resData.data[0].day !== undefined) {
              // Direct array of days
              targetDays = resData.data;
            }
          } else if (resData.data.days) {
            // Object with days array
            targetDays = resData.data.days;
          }
            
          if (targetDays && Array.isArray(targetDays)) {
            setAiItinerary(targetDays);
          }
        }
      }
    } catch (err: unknown) {
      console.warn("Passive Cache Resolution Missed:", err);
    } finally {
      setIsFetchingItinerary(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedTrip) {
      setAiItinerary(null);
      void fetchTripMembers(selectedTrip._id);
      void fetchExistingItinerary(selectedTrip._id);
    }
  }, [selectedTrip, fetchTripMembers, fetchExistingItinerary]);

  // Integrated Generation Pipeline mapped directly to the correct dynamic parameter route
  const generateAiItinerary = async (trip: TripItem) => {
    if (!token || !trip) return;

    setIsGeneratingItinerary(true);
    try {
      const calculatedDays = calculateDaysBetween(trip.startDate, trip.endDate);
      const resData = await aiService.generateItinerary({
        tripId: trip._id,
        destination: trip.destination || trip.title,
        days: calculatedDays,
        budget: trip.budget,
        travelStyle: "Adventure",
      });
      
      if (resData?.data) {
        // Defensive Architecture Strategy: Handles structural shape updates seamlessly
        const finalDays = Array.isArray(resData.data)
          ? resData.data
          : resData.data.days;

        if (!finalDays) {
          throw new Error("Target matrix payload missing array layout attributes.");
        }

        setAiItinerary(finalDays);
        triggerToast(`Itinerary generated via ${resData.source || "AI Engine"}`);
      } else {
        throw new Error("Failed validation layout structure on processing data.");
      }
    } catch (err: unknown) {
      triggerToast(`AI Runtime Pipeline Error: ${getErrorMessage(err, "Inference failed")}`);
    } finally {
      setIsGeneratingItinerary(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const payload = {
        ...formState,
        budget: Number(formState.budget),
      };

      if (editingTrip) {
        const fallbackTrips = [...trips];
        const updatedTrips = trips.map((t) =>
          t._id === editingTrip._id ? { ...t, ...payload } : t
        );
        setTrips(updatedTrips);

        try {
          const finalTrip = await tripService.updateTrip(editingTrip._id, payload);
          if (selectedTrip?._id === editingTrip._id) {
            setSelectedTrip(finalTrip);
          }
        } catch (error: unknown) {
          setTrips(fallbackTrips);
          throw error;
        }
        triggerToast(`Successfully modified framework for "${formState.title}"`);
      } else {
        const finalTrip = await tripService.createTrip(payload);
        setTrips([finalTrip, ...trips]);
        triggerToast(`"${formState.title}" successfully organized and serialized!`);
      }
      setIsModalOpen(false);
      void fetchTrips();
    } catch (err: unknown) {
      triggerToast(`Pipeline error: ${getErrorMessage(err, "Unknown error")}`);
    }
  };

  const handleDeleteTrip = async (id: string, e?: React.MouseEvent) => {
    if (!token) return;

    if (e) e.stopPropagation();
    const target = trips.find((t) => t._id === id);
    const fallbackTrips = [...trips];

    setTrips(trips.filter((t) => t._id !== id));
    if (selectedTrip?._id === id) setSelectedTrip(null);
    setShowDeleteConfirm(null);

    try {
      try {
        await tripService.deleteTrip(id);
      } catch (error: unknown) {
        setTrips(fallbackTrips);
        throw error;
      }
      triggerToast(`Archived and completely removed configuration "${target?.title}"`);
    } catch (err: unknown) {
      triggerToast(`Error: ${getErrorMessage(err, "Unknown error")}`);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !token) return;

    try {
      await tripService.addMember(selectedTrip._id, newMemberName);
      triggerToast("Member added successfully");
      setShowAddMemberModal(false);
      setNewMemberName("");
      void fetchTripMembers(selectedTrip._id);
    } catch {
      triggerToast("Failed to add member");
    }
  };

  const handleRemoveMember = async (member: TripMember) => {
    if (!selectedTrip || !token) return;

    try {
      await tripService.removeMember(selectedTrip._id, member.userId);
      setMembers((current) => current.filter((item) => item.userId !== member.userId));
      setCollabDeleteTarget(null);
      triggerToast("Member removed");
    } catch {
      triggerToast("Failed to remove member");
    }
  };

  const openCreateModal = () => {
    setEditingTrip(null);
    setSelectedCountryCode("");
    setFormState({
      title: "",
      country: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: 0,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trip: TripItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTrip(trip);

    const matchedCountry = allCountries.find(
      (c) => c.name.toLowerCase() === trip.country?.toLowerCase()
    );
    setSelectedCountryCode(matchedCountry ? matchedCountry.isoCode : "");

    setFormState({
      title: trip.title || "",
      country: trip.country || "",
      destination: trip.destination || "",
      startDate: formatDateString(trip.startDate),
      endDate: formatDateString(trip.endDate),
      budget: trip.budget || 0,
      notes: trip.notes || "",
    });
    setIsModalOpen(true);
  };

  const processedTrips = useMemo(() => {
    const filtered = trips.filter(
      (t) =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.destination?.toLowerCase().includes(search.toLowerCase()) ||
        t.country?.toLowerCase().includes(search.toLowerCase())
    );

return filtered.sort((a, b) => {
  if (sortBy === "title") return a.title.localeCompare(b.title);
  if (sortBy === "budget") return b.budget - a.budget;
  return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
});
  }, [trips, search, sortBy]);

  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedTrips.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTrips, currentPage]);

  const totalPages = Math.ceil(processedTrips.length / itemsPerPage) || 1;

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const finalName = member.memberName || member.name || "";
      return finalName.toLowerCase().includes(memberSearch.toLowerCase());
    });
  }, [members, memberSearch]);

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-6 right-6 z-[100] bg-cyan-900/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-200 px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(0,209,255,0.15)] flex items-center gap-2 text-sm font-medium"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedTrip ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Trip Frameworks
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Manage pipelines, budget parameters, and collaborator nodes.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-50 text-[#080a10] text-sm font-semibold hover:bg-cyan-400 transition-all duration-200 shadow-[0_0_20px_rgba(0,209,255,0.2)] cursor-pointer"
            >
              <Plus size={16} /> Organize Trip
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl backdrop-blur-xl">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by title, country or destination..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#080a10]/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#080a10]/40 border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-slate-400">
                <SlidersHorizontal size={13} />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "title" | "budget" | "date")}
                  className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer font-medium"
                >
                  <option value="date" className="bg-[#0c0f17]">
                    Timeline
                  </option>
                  <option value="budget" className="bg-[#0c0f17]">
                    Budget Cap
                  </option>
                  <option value="title" className="bg-[#0c0f17]">
                    Alphabetical
                  </option>
                </select>
              </div>
              <div className="flex items-center border border-white/[0.08] rounded-xl overflow-hidden bg-[#080a10]/40 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-cyan-500" size={32} />
              <p className="text-slate-400 text-sm font-light">
                Downloading secure framework schemas...
              </p>
            </div>
          ) : apiError ? (
            <div className="text-center py-12 border border-rose-500/10 bg-rose-500/[0.02] rounded-2xl p-6">
              <p className="text-rose-400 text-sm mb-2">
                Failed sync sequence: {apiError}
              </p>
              <button
                onClick={() => void fetchTrips()}
                className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                Re-attempt Sync
              </button>
            </div>
          ) : paginatedTrips.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl">
              <p className="text-slate-400 text-sm">
                No travel blueprints discovered matching criteria parameters.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => setSelectedTrip(trip)}
                  className="group relative border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-xl cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        Active Pipeline
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(trip, e)}
                          className="p-1 text-slate-400 hover:text-cyan-400"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(trip._id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-cyan-500/70" />
                      {trip.country
                        ? `${trip.destination}, ${trip.country}`
                        : trip.destination}
                    </p>
                    <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light">
                      {trip.notes || "No extra contextual details mapped."}
                    </p>
                  </div>
                  <div className="border-t border-white/[0.06] mt-5 pt-4 flex justify-between items-center text-xs">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {formatDateString(trip.startDate)}
                    </div>
                    <div className="text-cyan-400 font-semibold bg-cyan-500/[0.04] px-2.5 py-1 rounded-lg">
                      ${trip.budget}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip._id}
                  onClick={() => setSelectedTrip(trip)}
                  className="group border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] px-5 py-4 rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer backdrop-blur-xl"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {trip.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-cyan-500/70" />
                        {trip.country
                          ? `${trip.destination}, ${trip.country}`
                          : trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />{" "}
                        {formatDateString(trip.startDate)} to{" "}
                        {formatDateString(trip.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-none border-white/[0.06] pt-3 sm:pt-0">
                    <div className="text-cyan-400 font-mono font-semibold">
                      ${trip.budget}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => openEditModal(trip, e)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-white/5 rounded-lg"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(trip._id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-400 font-medium px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedTrip(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to listing
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6">
              <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedTrip.title}
                    </h2>
                    <p className="text-cyan-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} />
                      {selectedTrip.country
                        ? `${selectedTrip.destination}, ${selectedTrip.country}`
                        : selectedTrip.destination}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => void generateAiItinerary(selectedTrip)}
                      disabled={isGeneratingItinerary || isFetchingItinerary}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-[#080a10] text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(0,209,255,0.3)] cursor-pointer"
                    >
                      {isGeneratingItinerary ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Querying Engine...
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} /> AI Itinerary
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => openEditModal(selectedTrip, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 text-slate-200 transition-all cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(selectedTrip._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/[0.06] py-4 my-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs block">
                      Start Blueprint
                    </span>
                    <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {formatDateString(selectedTrip.startDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">
                      End Pipeline
                    </span>
                    <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {formatDateString(selectedTrip.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">
                      Allocated Cap
                    </span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1 mt-0.5">
                      <DollarSign size={14} /> {selectedTrip.budget}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <FileText size={12} /> Notes & Scope Parameters
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed bg-[#080a10]/40 p-4 rounded-xl border border-white/[0.04] font-light">
                    {selectedTrip.notes || "No extended descriptions appended."}
                  </p>
                </div>
              </div>

              {/* Dynamic Presentation Pipeline Window Render Segment */}
              <AnimatePresence mode="wait">
                {isFetchingItinerary ? (
                  <div className="flex items-center justify-center p-8 border border-white/[0.05] bg-[#0c0f17]/40 rounded-2xl gap-2 text-xs text-slate-400">
                    <Loader2 size={14} className="animate-spin text-cyan-400" />
                    <span>Resolving cached schedule layout nodes...</span>
                  </div>
                ) : aiItinerary && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="border border-cyan-500/20 bg-gradient-to-b from-cyan-950/10 to-[#0c0f17] backdrop-blur-xl p-6 rounded-2xl space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.05)]"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                          <Compass size={16} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            Generated Smart Track Matrix
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Custom schedule tailored by nvidia-gemma core
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAiItinerary(null)}
                        className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-cyan-500/40 before:to-transparent">
                      {aiItinerary.map((dayPlan) => (
                        <div key={dayPlan.day} className="relative pl-9 group">
                          <div className="absolute left-1.5 top-1.5 h-4 w-4 rounded-full bg-[#0c0f17] border-2 border-cyan-400 flex items-center justify-center text-[9px] font-bold text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                            {dayPlan.day}
                          </div>
                          <div className="bg-[#080a10]/40 border border-white/[0.05] hover:border-cyan-500/20 p-4 rounded-xl transition-all">
                            <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                              {dayPlan.title}
                            </h4>
                            <ul className="mt-3 space-y-2">
                              
                              {dayPlan.activities?.map((activity, aIdx) => (
                                <li
                                  key={`${dayPlan.day}-activity-${aIdx}`}
                                  className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed"
                                >
                                  <span className="text-cyan-500 mt-1 select-none">•</span>
                                  <span>{activity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">
                  Activity Timeline Log
                </h3>
                {selectedTrip.activities && selectedTrip.activities.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
                    {selectedTrip.activities.map((act) => (
                      <div key={act.id} className="flex gap-4 relative pl-7">
                        <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-4 ring-cyan-900/30" />
                        <div className="flex-1 bg-[#080a10]/20 p-3 rounded-xl border border-white/[0.04]">
                          <p className="text-sm text-slate-300">{act.text}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {act.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No automated tracking changes registered on this channel framework yet.
                  </p>
                )}
              </div> */}
            </div>

            <div className="xl:col-span-4 space-y-6">
              {/* <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Owner Details
                </h3>
                <div className="flex items-center gap-3 bg-[#080a10]/30 p-3 rounded-xl border border-white/[0.04]">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center font-bold text-xs text-white">
                    {typeof selectedTrip.owner === "object"
                      ? selectedTrip.owner.name?.slice(0, 2).toUpperCase()
                      : "OW"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {typeof selectedTrip.owner === "object"
                        ? selectedTrip.owner.name
                        : "Secure Node Owner"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {typeof selectedTrip.owner === "object"
                        ? selectedTrip.owner.email
                        : "Shared internal pipeline"}
                    </p>
                  </div>
                </div>
              </div> */}

              <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Users size={12} className="text-cyan-400" />
                    <span>Workspace Network ({filteredMembers.length})</span>
                  </h3>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#080a10] text-[11px] font-bold transition-all cursor-pointer"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Filter network nodes..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#080a10]/50 border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                {collabLoading ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-500">
                    <Loader2 className="animate-spin text-cyan-500" size={14} />
                    <span>Loading channel components...</span>
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No workspace channels matching query found.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {filteredMembers.map((m) => {
                      const finalName = m.memberName || m.name || "Unknown Member";
                      return (
                        <div
                          key={m.userId}
                          className="flex items-center justify-between p-2 bg-[#080a10]/20 rounded-xl border border-white/[0.02] hover:border-white/[0.05] group"
                        >
                          <div className="flex items-center gap-2.5 text-sm text-slate-300 min-w-0">
                            {m.avatar ? (
                              <img
                                src={m.avatar}
                                alt={finalName}
                                className="h-6 w-6 rounded-full object-cover border border-white/10"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] flex items-center justify-center font-bold uppercase">
                                {finalName.slice(0, 2)}
                              </div>
                            )}
                            <div className="truncate text-xs">
                              <p className="text-slate-200 font-medium truncate">{finalName}</p>
                              {m.role && <span className="text-[9px] text-slate-500 font-mono tracking-tight">{m.role}</span>}
                            </div>
                          </div>

                          <button
                            onClick={() => setCollabDeleteTarget(m)}
                            className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#0c0f17] border border-white/[0.08] w-full max-w-lg p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold text-white mb-4">
                {editingTrip ? "Modify Blueprint Parameters" : "Map New Journey Blueprint"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title || ""}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g., Summer Alpine Framework"
                    className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full bg-[#080a10]/40 p-4 border border-white/[0.08] rounded-2xl">
                  <div ref={countryRef} className="relative flex-1 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block px-1">
                      Country <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        placeholder="Search country (e.g., France)..."
                        value={formState.country || ""}
                        onFocus={() => setShowCountryDropdown(true)}
                        onChange={(e) => {
                          setFormState({
                            ...formState,
                            country: e.target.value,
                            destination: "",
                          });
                          if (e.target.value === "") setSelectedCountryCode("");
                        }}
                        className="w-full bg-[#0c0f17] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                    </div>

                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <div className="absolute left-0 right-0 top-[105%] z-50 max-h-48 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0f17] p-1 shadow-2xl backdrop-blur-md">
                        {filteredCountries.map((c) => (
                          <button
                            key={c.isoCode}
                            type="button"
                            onClick={() => {
                              setFormState({
                                ...formState,
                                country: c.name,
                                destination: "",
                              });
                              setSelectedCountryCode(c.isoCode);
                              setShowCountryDropdown(false);
                            }}
                            className="flex items-center justify-between w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-cyan-400 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{c.name}</span>
                            </div>
                            {selectedCountryCode === c.isoCode && <Check size={14} className="text-cyan-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div ref={destRef} className="relative flex-1 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 block px-1">
                      Destination <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      <input
                        type="text"
                        required
                        placeholder={selectedCountryCode ? "Famous spots or cities..." : "Enter city name..."}
                        value={formState.destination || ""}
                        onFocus={() => setShowDestinationDropdown(true)}
                        onChange={(e) => setFormState({ ...formState, destination: e.target.value })}
                        className="w-full bg-[#0c0f17] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>

                    {showDestinationDropdown && filteredDestinations.length > 0 && (
                      <div className="absolute left-0 right-0 top-[105%] z-50 max-h-48 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0f17] p-1 shadow-2xl backdrop-blur-md">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {selectedCountryCode ? "Suggested Local Cities" : "Popular Global Destinations"}
                        </div>
                        {filteredDestinations.map((city, idx) => (
                          <button
                            key={`${city.name}-${idx}`}
                            type="button"
                            onClick={() => {
                              setFormState({ ...formState, destination: city.name });
                              setShowDestinationDropdown(false);
                            }}
                            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-cyan-400 rounded-lg transition-colors"
                          >
                            <MapPin size={14} className="text-slate-500" />
                            <span>{city.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1.5">Start Date</label>
                    <input
                      type="date"
                      required
                      value={formState.startDate || ""}
                      onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
                      className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1.5">End Date</label>
                    <input
                      type="date"
                      required
                      value={formState.endDate || ""}
                      onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
                      className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">Budget Allocation ($)</label>
                  <input
                    type="number"
                    required
                    value={formState.budget || ""}
                    onChange={(e) => setFormState({ ...formState, budget: Number(e.target.value) })}
                    placeholder="4000"
                    className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">Context Scope & Notes</label>
                  <textarea
                    rows={3}
                    value={formState.notes || ""}
                    onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                    placeholder="Describe key priorities, modular routes, structural stops..."
                    className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-50 text-[#080a10] font-semibold hover:bg-cyan-400 transition-colors shadow-lg"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMemberModal(false)}
              className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0c0f17] border border-white/[0.08] w-full max-w-sm p-5 rounded-2xl shadow-2xl z-10"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Workspace Member</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">Display / Workspace Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Jane Doe"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#080a10] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-[#080a10] font-bold hover:bg-cyan-400 transition-colors shadow-md"
                >
                  Authorize Profile Connection
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {collabDeleteTarget && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCollabDeleteTarget(null)}
              className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0c0f17] border border-rose-500/20 w-full max-w-sm p-5 rounded-2xl shadow-2xl z-10 text-center"
            >
              <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-3">
                <Trash2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Revoke Workspace Token Access?</h3>
              <p className="text-slate-400 text-xs mb-5">
                Remove <strong>{collabDeleteTarget.memberName || collabDeleteTarget.name}</strong> from this travel blueprint node matrix?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCollabDeleteTarget(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={() => void handleRemoveMember(collabDeleteTarget)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400 transition-colors"
                >
                  Sever Node Connections
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0c0f17] border border-rose-500/20 w-full max-w-sm p-5 rounded-2xl shadow-2xl z-10 text-center"
            >
              <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-3">
                <Trash2 size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Archive Trip Blueprint?</h3>
              <p className="text-slate-400 text-xs mb-5">This action safely detaches data segments. This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={() => void handleDeleteTrip(showDeleteConfirm)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400 transition-colors"
                >
                  Confirm Removal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
