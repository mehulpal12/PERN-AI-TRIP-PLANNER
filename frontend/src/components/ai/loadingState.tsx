"use client";

import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="animate-spin text-cyan-400"
          size={32}
        />
        <p className="text-slate-400">
          Generating itinerary...
        </p>
      </div>
    </div>
  );
}