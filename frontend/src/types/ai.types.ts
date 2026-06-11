export interface GenerateItineraryRequest {
  destination: string;
  days: number;
  budget: number;
  travelStyle: string;
  tripId: string;
}

export interface Activity {
  time?: string;
  title: string;
  description?: string;
}
export interface DayPlan {
  day: number;
  title: string;
  activities: string[];
}

export interface Itinerary {
  days: DayPlan[];
}

export interface GenerateItineraryResponse {
  success: boolean;
  source: "redis" | "gemini";
  data: Itinerary;
}