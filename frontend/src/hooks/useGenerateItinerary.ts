import { useState } from "react";
import { aiService } from "@/services/ai.service";
import { GenerateItineraryResponse } from "@/types/ai.types";

export function useGenerateItinerary() {

  const [loading, setLoading] =
    useState(false);

  const [itinerary, setItinerary] =
    useState<GenerateItineraryResponse | null>(
      null
    );

  const [error, setError] =
    useState("");

  const generate = async (
    payload: any
  ) => {
    try {

      setLoading(true);
      setError("");

      const data =
        await aiService.generateItinerary(
          payload
        );

      setItinerary(data);

    } catch (err: any) {

      setError(
        err?.response?.data?.message ??
        "Failed to generate itinerary"
      );

    } finally {

      setLoading(false);

    }
  };

  return {
    loading,
    itinerary,
    error,
    generate,
  };
}