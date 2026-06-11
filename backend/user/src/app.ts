import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { securityHeaders, corsMiddleware } from "./middlewares/security.middleware.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

// Security Middlewares
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(cookieParser());

// Logging
app.use(loggerMiddleware);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiting
app.use(globalLimiter);

// Routes
app.use("/api/users", userRoutes);

// Health Check
app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "User Service Running",
  });
});

// Error Handler (must be last)
app.use(errorHandler);

export default app;