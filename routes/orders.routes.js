import { Router } from "express";
import {
  getOrders,
  patchOrderPayment,
  postOrder,
} from "../controllers/orders.controller.js";

export const ordersRouter = Router();

ordersRouter.get("/", getOrders);
ordersRouter.post("/", postOrder);
ordersRouter.patch("/:id/payment", patchOrderPayment);

