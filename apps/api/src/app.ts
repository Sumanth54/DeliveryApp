import cors from "cors";
import express from "express";
import { getCacheHealth } from "./config/cache.js";
import { getDatabaseHealth } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

const app = express();
const allowedOrigins = env.clientUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);

app.use(express.json());

app.get("/health", (_request, response) => {
  const database = getDatabaseHealth();
  const cache = getCacheHealth();
  const isReady = database.readyState === 1 && cache.ready;

  response.status(isReady ? 200 : 503).json({
    ok: isReady,
    service: "api",
    services: {
      database,
      cache
    }
  });
});

app.get("/health/live", (_request, response) => {
  response.json({
    ok: true,
    service: "api"
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app; // ✅ THIS FIXES YOUR ISSUE
