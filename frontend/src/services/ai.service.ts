



import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { API_ROUTES } from "@/config/api";
import {
  GenerateItineraryRequest,
  GenerateItineraryResponse,
} from "@/types/ai.types";

export const aiService = {
  /**
   * Triggers background text synthesis via an async loop,
   * keeping the UI fully interactive and offering feedback.
   */
  async generateItinerary(
    payload: GenerateItineraryRequest,
    onProgressUpdate?: (status: string, progress: number) => void
  ): Promise<GenerateItineraryResponse> {
    const { tripId, ...requestBody } = payload;

    if (!tripId) {
      throw new Error("Missing required tripId mapping parameter context");
    }

    // 1. Dispatch payload to the updated route path. Returns `{ success: true, jobId: "..." }`
    const initialResponse = await api.post<ApiResponse<{ jobId: string }>>(
      `${API_ROUTES.AI}/trips/${tripId}/itinerary/generate`,
      requestBody
    );

    const { jobId } = initialResponse.data.data;

    if (!jobId) {
      throw new Error("AI service did not return a job tracking id.");
    }

    // 2. Poll the status route until execution shifts to 'completed' or 'failed'
    return new Promise((resolve, reject) => {
      const maxRetries = 30; // Max out at 75 seconds (30 * 2.5s) to catch timeout drops
      let trackingAttempts = 0;

      const pollingTracker = setInterval(async () => {
        try {
          trackingAttempts++;
          if (trackingAttempts > maxRetries) {
            clearInterval(pollingTracker);
            reject(new Error("The AI processing worker timed out. Please try again."));
            return;
          }

          // Request the job status by passing the jobId
          const statusCheck = await api.get<ApiResponse<{
            status: "waiting" | "active" | "completed" | "failed";
            progress: number;
            result?: any;
            error?: string;
          }>>(`${API_ROUTES.AI}/trips/itinerary/jobs/${jobId}`);

          const job = statusCheck.data.data;

          // Push feedback up to the UI view component context
          if (onProgressUpdate) {
            const displayStatus = job.status === "active" 
              ? "NVIDIA Gemma-2 is writing activities..." 
              : "Waiting for background worker slot...";
            onProgressUpdate(displayStatus, job.progress || 10);
          }

          if (job.status === "completed") {
            clearInterval(pollingTracker);
            // Resolve with the final compiled data payload
            resolve(job.result); 
          } else if (job.status === "failed") {
            clearInterval(pollingTracker);
            reject(new Error(job.error || "Generation pipeline failed inside background node."));
          }

        } catch (error) {
          clearInterval(pollingTracker);
          reject(error);
        }
      }, 2500); // Check state every 2.5 seconds
    });
  },

  async getCacheStats() {
    const response = await api.get(`${API_ROUTES.AI}/itinerary/cache-stats`);
    return response.data;
  },

  async clearCache() {
    const response = await api.delete(`${API_ROUTES.AI}/itinerary/cache`);
    return response.data;
  },
};














// import { api } from "@/lib/api";
// import { ApiResponse } from "@/types/api.types";
// import { API_ROUTES } from "@/config/api";
// import {
//   GenerateItineraryRequest,
//   GenerateItineraryResponse,
// } from "@/types/ai.types";

// export const aiService = {
//   async generateItinerary(
//     payload: GenerateItineraryRequest
//   ): Promise<GenerateItineraryResponse> {
//     const { tripId, ...rest } = payload;
//     const response =
//       await api.post<
//         ApiResponse<GenerateItineraryResponse>
//       >(
//         `${API_ROUTES.AI}/generate`,
//         payload
//       );

//     return response.data.data;
//   },

//   async getCacheStats() {
//     const response =
//       await api.get(
//         `${API_ROUTES.AI}/itinerary/cache-stats`
//       );

//     return response.data;
//   },

//   async clearCache() {
//     const response =
//       await api.delete(
//         `${API_ROUTES.AI}/itinerary/cache`
//       );

//     return response.data;
//   },
// };
