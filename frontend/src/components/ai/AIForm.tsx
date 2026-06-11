"use client";

import { useState, FormEvent } from "react";
import { Sparkles, Calendar, MapPin, DollarSign, PersonStanding } from "lucide-react";

interface Props {
  onGenerate: (payload: {
    destination: string;
    days: number;
    budget: number;
    travelStyle: string;
  }) => void;
  isGenerating?: boolean; // Optional parameter to lock out input modification during generation runs
}

export default function AIForm({ onGenerate, isGenerating = false }: Props) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState<number>(5);
  const [budget, setBudget] = useState<number>(50000);
  const [travelStyle, setTravelStyle] = useState("Adventure");
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * FORM SUBMISSION HANDLER
   * Adds validation checkpoints before passing payloads upstream.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Sanitize input state
    const cleanDestination = destination.trim();

    if (!cleanDestination) {
      setValidationError("Please specify a target destination.");
      return;
    }

    if (days < 1 || days > 30) {
      setValidationError("Trip duration must fall between 1 and 30 days.");
      return;
    }

    if (budget <= 0) {
      setValidationError("Please enter a valid target budget amount.");
      return;
    }

    // Execute upstream callback contract
    onGenerate({
      destination: cleanDestination,
      days,
      budget,
      travelStyle,
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-5"
    >
      {/* Input Data Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* DESTINATION INPUT */}
        <div className="space-y-1.5">
          <label htmlFor="destination" className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <MapPin size={12} className="text-cyan-400" /> Destination
          </label>
          <input
            id="destination"
            type="text"
            value={destination}
            disabled={isGenerating}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Tokyo, Kyoto"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm disabled:opacity-50"
          />
        </div>

        {/* DURATION INPUT */}
        <div className="space-y-1.5">
          <label htmlFor="days" className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar size={12} className="text-cyan-400" /> Duration (Days)
          </label>
          <input
            id="days"
            type="number"
            min={1}
            max={30}
            value={days || ""}
            disabled={isGenerating}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
            placeholder="5"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm disabled:opacity-50"
          />
        </div>

        {/* BUDGET INPUT */}
        <div className="space-y-1.5">
          <label htmlFor="budget" className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <DollarSign size={12} className="text-cyan-400" /> Budget
          </label>
          <input
            id="budget"
            type="number"
            min={1}
            value={budget || ""}
            disabled={isGenerating}
            onChange={(e) => setBudget(Math.max(0, Number(e.target.value)))}
            placeholder="50000"
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm disabled:opacity-50"
          />
        </div>

        {/* TRAVEL STYLE SELECT */}
        <div className="space-y-1.5">
          <label htmlFor="travelStyle" className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <PersonStanding size={12} className="text-cyan-400" /> Travel Style
          </label>
          <select
            id="travelStyle"
            value={travelStyle}
            disabled={isGenerating}
            onChange={(e) => setTravelStyle(e.target.value)}
            className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all text-sm disabled:opacity-50 appearance-none cursor-pointer"
          >
            <option value="Adventure" className="bg-[#111625]">Adventure</option>
            <option value="Luxury" className="bg-[#111625]">Luxury</option>
            <option value="Budget" className="bg-[#111625]">Budget Style</option>
            <option value="Family" className="bg-[#111625]">Family Friendly</option>
            <option value="Romantic" className="bg-[#111625]">Romantic</option>
            <option value="Solo" className="bg-[#111625]">Solo Explorer</option>
          </select>
        </div>

      </div>

      {/* VALIDATION FEEDBACK BANNER */}
      {validationError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-medium text-red-400 animate-fadeIn">
          ⚠️ {validationError}
        </div>
      )}

      {/* SUBMISSION CTA TRIGGER */}
      <button
        type="submit"
        disabled={isGenerating}
        className="w-full mt-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/10 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
      >
        <Sparkles size={16} className={isGenerating ? "animate-pulse" : ""} />
        {isGenerating ? "Mapping Out Itinerary..." : "Generate Custom Itinerary"}
      </button>
    </form>
  );
}