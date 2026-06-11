import helmet from "helmet";
import cors from "cors";

export const securityHeaders = helmet();

export const corsMiddleware = cors({
  origin: true, // Dynamically reflect request origin
  credentials: true,
});
