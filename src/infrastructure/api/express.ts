import express, { Express } from "express";
import { Sequelize } from "sequelize-typescript";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import { ProductModel } from "../../modules/product-adm/repository/product.model";
import ProductModelCatalog from "../../modules/store-catalog/repository/product.model";
import InvoiceModel from "../../modules/invoice/repository/invoice.model";
import InvoiceItemsModel from "../../modules/invoice/repository/invoice-items.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { productRoute } from "./routes/product.route";
import { clientRoute } from "./routes/client.route";
import { checkoutRoute } from "./routes/checkout.route";
import { invoiceRoute } from "./routes/invoice.route";

export const app: Express = express();
app.use(express.json());
app.use("/products", productRoute);
app.use("/clients", clientRoute);
app.use("/checkout", checkoutRoute);
app.use("/invoice", invoiceRoute);

export let sequelize: Sequelize;

async function setupDb() {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });

  sequelize.addModels([
    ClientModel,
    ProductModel,
    ProductModelCatalog,
    InvoiceModel,
    InvoiceItemsModel,
    TransactionModel,
  ]);
  await sequelize.sync();
}

setupDb();
