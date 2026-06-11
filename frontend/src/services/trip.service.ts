import { TripItem, TripMember } from "@/features/dashboard/types/dashboard.types";
import { API_ROUTES } from "@/config/api";
import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";

type TripPayload = {
  title: string;
  country?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes?: string;
};

type RawTrip = Partial<TripItem> & {
  id?: string;
  description?: string;
  destinations?: Array<{
    city?: string | null;
    name?: string | null;
  }>;
};

// Data normalization mapping rules logic intact
const normalizeTrip = (trip: RawTrip): TripItem => ({
  ...trip,
  _id: trip._id || trip.id || "",
  title: trip.title || "",
  destination:
    trip.destination ||
    trip.destinations?.[0]?.city ||
    trip.destinations?.[0]?.name ||
    "",
  startDate: trip.startDate || "",
  endDate: trip.endDate || "",
  budget: trip.budget ?? 0,
  notes: trip.notes || trip.description || "",
});

export const tripService = {
  async getTrips(): Promise<TripItem[]> {
    const response = await api.get<ApiResponse<RawTrip[]>>(API_ROUTES.TRIPS);
    console.log(response.data);
    return response.data.data.map(normalizeTrip);
  },

  async createTrip(payload: TripPayload): Promise<TripItem> {
    const response = await api.post<ApiResponse<RawTrip>>(API_ROUTES.TRIPS, payload);
    return normalizeTrip(response.data.data);
  },

  async updateTrip(tripId: string, payload: TripPayload): Promise<TripItem> {
    const response = await api.put<ApiResponse<RawTrip>>(`${API_ROUTES.TRIPS}/${tripId}`, payload);
    return normalizeTrip(response.data.data);
  },

  async deleteTrip(tripId: string): Promise<void> {
    await api.delete<ApiResponse<any>>(`${API_ROUTES.TRIPS}/${tripId}`);
  },

  async getMembers(tripId: string): Promise<TripMember[]> {
    const response = await api.get<ApiResponse<TripMember[]>>(`${API_ROUTES.TRIPS}/${tripId}/members`);
    return response.data.data;
  },

  async addMember(tripId: string, memberName: string): Promise<TripMember> {
    const response = await api.post<ApiResponse<TripMember>>(`${API_ROUTES.TRIPS}/${tripId}/members`, { memberName });
    return response.data.data;
  },

  async removeMember(tripId: string, userId: string): Promise<void> {
    await api.delete<ApiResponse<any>>(`${API_ROUTES.TRIPS}/${tripId}/members/${userId}`);
  },
};