import { Router } from "express";
import { createBrokerHandlers, type BrokerService } from "../api/broker.js";
import {
  validate,
  createBrokerSchema,
  brokerQuerySchema,
  brokerSlugParamSchema,
} from "../api/validate.js";

export default function createBrokerRouter(service: BrokerService) {
  const router = Router();
  const { handlerListBrokers, handlerGetBroker, handlerCreateBroker } =
    createBrokerHandlers(service);

  router.get("/", validate(brokerQuerySchema, "query"), handlerListBrokers);
  router.get(
    "/:slug",
    validate(brokerSlugParamSchema, "params"),
    handlerGetBroker,
  );
  router.post("/", validate(createBrokerSchema, "body"), handlerCreateBroker);

  return router;
}
