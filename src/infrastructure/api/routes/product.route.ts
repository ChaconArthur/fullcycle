import express, { Request, Response } from "express";
import ProductAdmFacadeFactory from "../../../modules/product-adm/factory/facade.factory";

export const productRoute = express.Router();

productRoute.post("/", async (req: Request, res: Response) => {
  const facade = ProductAdmFacadeFactory.create();

  try {
    // Validate required fields
    if (!req.body.name || !req.body.description ||
        req.body.purchasePrice === undefined ||
        req.body.stock === undefined) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const productDto = {
      id: req.body.id,
      name: req.body.name,
      description: req.body.description,
      purchasePrice: req.body.purchasePrice,
      stock: req.body.stock,
    };

    await facade.addProduct(productDto);

    res.status(201).send();
  } catch (err) {
    res.status(500).send(err);
  }
});
