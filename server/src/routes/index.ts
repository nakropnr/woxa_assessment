import { Router } from "express";
import type { BrokerService } from "../api/broker.js";
import createBrokerRouter from "./broker.js";

export default function createRoutes(service: BrokerService) {
  const router = Router();

  router.use("/brokers", createBrokerRouter(service));

  return router;
}
