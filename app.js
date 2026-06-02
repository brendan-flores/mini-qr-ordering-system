import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { z } from "zod";

import "./config/env.js";
import { productsRouter } from "./routes/products.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? "*" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/products", productsRouter);
  app.use("/api/orders", ordersRouter);

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: { message: "Validation error", issues: err.issues },
      });
    }

    const status = typeof err?.status === "number" ? err.status : 500;
    const message =
      typeof err?.message === "string" ? err.message : "Internal Server Error";

    return res.status(status).json({
      error: {
        message,
      },
    });
  });

  return app;
}

