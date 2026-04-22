import express from "express";
import cors from "cors";
import createRoutes from "./routes/index.js";
import { brokerService } from "./services/broker.js";
import {
  middleWareErrorHandling,
  middleWareLogResponse,
  NotFoundError,
} from "./api/middleware.js";
import type { BrokerService } from "./api/broker.js";

type AppDependencies = {
  brokerService?: BrokerService;
};

export function createApp(dependencies: AppDependencies = {}) {
  const app = express();
  const activeBrokerService = dependencies.brokerService ?? brokerService;

  app.use(middleWareLogResponse);
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", createRoutes(activeBrokerService));

  app.use((_req, _res, next) => {
    next(new NotFoundError("Route not found"));
  });

  app.use(middleWareErrorHandling);

  return app;
}
