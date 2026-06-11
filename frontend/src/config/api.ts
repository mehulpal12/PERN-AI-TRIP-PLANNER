// 🔒 Removed 'dotenv' import since Next.js handles NEXT_PUBLIC_ variables natively at build time.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://13.61.193.96:5000";

const resolveApiRoute = (route: string | undefined, fallback: string) => {
  const value = route?.trim() || fallback;

  // If it's already an absolute URL (starts with http:// or https://), return it directly
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Otherwise, append it cleanly to the API Base Gateway URL
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export const API_ROUTES = {
  USERS: resolveApiRoute(process.env.NEXT_PUBLIC_USERS_API, "/api/users"),
  TRIPS: resolveApiRoute(process.env.NEXT_PUBLIC_TRIPS_API, "/api/trips"),
  /* 🛠️ FIX: Changed fallback from '/api/ai/trips' to '/api/ai' to match your Gateway routing */
  AI: resolveApiRoute(process.env.NEXT_PUBLIC_AI_API, "/api/ai"),
};

export { API_BASE_URL };