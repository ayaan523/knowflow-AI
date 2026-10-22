import http from "node:http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { env } from "./config/env.js";
import api from "./routes/api.js";
import { errorHandler, notFound } from "./middleware/errors.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: "100kb" }));
app.use(rateLimit({ windowMs: 60000, limit: 240 }));
app.use("/api/v1", api);
app.use(notFound);
app.use(errorHandler);
const server = http.createServer(app);
export { app };
if (process.env.NODE_ENV !== "test") {
  await mongoose.connect(env.mongoUri);
  server.listen(env.port, () =>
    console.log(`KnowFlow API listening on ${env.port}`),
  );
  const shutdown = async () => {
    await mongoose.disconnect();
    server.close(() => process.exit(0));
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}
