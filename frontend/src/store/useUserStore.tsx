import { create } from "zustand";
import { useAuthStore } from "@/lib/authStore";
import { API_ROUTES } from "@/config/api";
import { ApiResponse } from "@/types/api.types";

export interface UserProfile {
  id: string;
  bio?: string;
  preferences?: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  status: "upcoming" | "completed";
}

export interface FullUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  image?: string; 
  profile?: UserProfile;
  trips: Trip[];
}

interface UserStoreState {
  data: FullUserData | null;
  user: FullUserData | null; 
  isLoading: boolean;
  error: string | null;
  fetchUser: (forceRefresh?: boolean) => Promise<void>;
  fetchUserData: (forceRefresh?: boolean) => Promise<void>;
  updateUserPreferences: (prefs: Partial<UserProfile["preferences"]>) => Promise<boolean>;
  clearUserData: () => void;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  data: null,
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async (forceRefresh = false) => {
    await get().fetchUserData(forceRefresh);
  },

  fetchUserData: async (forceRefresh = false) => {
    // Only skip fetching if data exists AND we aren't explicitly forcing a refresh
    if (get().data && !forceRefresh) {
      console.log("🟢 Zustand: Data already cached, skipping fetch.");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const accessToken = useAuthStore.getState().accessToken;

      if (!accessToken) {
        throw new Error("No access token found. User is likely logged out.");
      }

      console.log("🔵 Zustand: Fetching profile from Express backend...");
      
      const response = await fetch(`${API_ROUTES.USERS}/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch profile. Server responded with status: ${response.status}`);
      }

      const result = (await response.json()) as ApiResponse<FullUserData>;
      
      const payload = result.data;
      console.log("✨ Zustand Fetch Success! Incoming Data Payload:", payload);

      set({ 
        data: payload, 
        user: payload, 
        isLoading: false,
        error: null
      });
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || "An unexpected error occurred";
      console.error("❌ Zustand Fetch Error:", errorMessage);
      set({ error: errorMessage, isLoading: false, data: null, user: null });
    }
  },

  updateUserPreferences: async (newPrefs) => {
    const currentData = get().data;
    if (!currentData) {
      console.warn("⚠️ Zustand: Cannot update preferences because no user data is loaded yet.");
      return false;
    }

    try {
      const accessToken = useAuthStore.getState().accessToken;
      const updatedPreferences = { ...currentData.profile?.preferences, ...newPrefs };

      console.log("🔄 Zustand Optimistic Update: Patching preferences with:", newPrefs);

      const optimizedState: FullUserData = {
        ...currentData,
        profile: {
          ...currentData.profile!,
          id: currentData.profile?.id || "",
          preferences: updatedPreferences as UserProfile["preferences"],
        },
      };

      set({ data: optimizedState, user: optimizedState });

      const response = await fetch(`${API_ROUTES.USERS}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newPrefs),
      });

      if (!response.ok) throw new Error("Server rejected preference update.");

      console.log("✅ Zustand: Server sync successful!");
      return true;
    } catch (error) {
      console.error("❌ Zustand Preferences Sync Failed:", error);
      return false;
    }
  },

  clearUserData: () => {
    console.log("🧹 Zustand: Clearing user data state (Logging out)...");
    set({ data: null, user: null, isLoading: false, error: null });
  },
}));
