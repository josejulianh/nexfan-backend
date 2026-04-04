import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { connectDB } from "./infrastructure/database/postgres";
import { errorHandler, notFound } from "./shared/middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(config.env === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));

import authRoutes from "./modules/auth/auth.routes";
app.use("/api/v1/auth", authRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "ok", env: config.env, timestamp: new Date().toISOString() });
});

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  // await connectDB();
  app.listen(config.port, () => console.log(`NEXFAN API running on port ${config.port}`));
};

start().catch(console.error);
export default app;
