const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const resolveApiRoute = (route: string | undefined, fallback: string) => {
  const value = route?.trim() || fallback;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export const API_ROUTES = {
  USERS: resolveApiRoute(process.env.NEXT_PUBLIC_USERS_API, "/api/users"),
  TRIPS: resolveApiRoute(process.env.NEXT_PUBLIC_TRIPS_API, "/api/trips"),
  AI: resolveApiRoute(process.env.NEXT_PUBLIC_AI_API, "/api/ai/trips"),
};

export { API_BASE_URL };
