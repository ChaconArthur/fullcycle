import express, { Request, Response } from "express";
import CheckoutFacadeFactory from "../../../modules/checkout/factory/checkout.facade.factory";

export const checkoutRoute = express.Router();

checkoutRoute.post("/", async (req: Request, res: Response) => {
  const facade = CheckoutFacadeFactory.create();

  try {
    const orderDto = {
      clientId: req.body.clientId,
      products: req.body.products,
    };

    const output = await facade.placeOrder(orderDto);

    res.status(201).json(output);
  } catch (err) {
    res.status(500).send(err);
  }
});
