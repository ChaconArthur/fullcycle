import express, { Request, Response } from "express";
import ClientAdmFacadeFactory from "../../../modules/client-adm/factory/client-adm.facade.factory";
import Address from "../../../modules/@shared/domain/value-object/address";

export const clientRoute = express.Router();

clientRoute.post("/", async (req: Request, res: Response) => {
  const facade = ClientAdmFacadeFactory.create();

  try {
    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.document || !req.body.address) {
      return res.status(400).send({ error: "Missing required fields" });
    }

    const clientDto = {
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      document: req.body.document,
      address: new Address(
        req.body.address.street,
        req.body.address.number,
        req.body.address.complement,
        req.body.address.city,
        req.body.address.state,
        req.body.address.zipCode
      ),
    };

    await facade.add(clientDto);

    res.status(201).send();
  } catch (err) {
    res.status(500).send(err);
  }
});
