import { Sequelize } from "sequelize-typescript";
import InvoiceModel from "./invoice.model";
import InvoiceItemsModel from "./invoice-items.model";
import InvoiceRepository from "./invoice.repository";
import Invoice from "../domain/invoice.entity";
import InvoiceItems from "../domain/invoice-items.entity";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";

describe("InvoiceRepository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([InvoiceModel, InvoiceItemsModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should find an invoice", async () => {
    const invoice = await InvoiceModel.create(
      {
        id: "1",
        name: "Invoice 1",
        document: "123456789",
        street: "Street 1",
        number: "123",
        complement: "Complement",
        city: "City",
        state: "State",
        zipCode: "12345-678",
        items: [
          {
            id: "1",
            invoice_id: "1",
            name: "Item 1",
            price: 100,
          },
          {
            id: "2",
            invoice_id: "1",
            name: "Item 2",
            price: 200,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        include: [InvoiceItemsModel],
      }
    );

    const repository = new InvoiceRepository();
    const result = await repository.find("1");

    expect(result.id.id).toBe("1");
    expect(result.name).toBe("Invoice 1");
    expect(result.document).toBe("123456789");
    expect(result.address.street).toBe("Street 1");
    expect(result.address.number).toBe("123");
    expect(result.address.complement).toBe("Complement");
    expect(result.address.city).toBe("City");
    expect(result.address.state).toBe("State");
    expect(result.address.zipCode).toBe("12345-678");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id.id).toBe("1");
    expect(result.items[0].name).toBe("Item 1");
    expect(result.items[0].price).toBe(100);
    expect(result.items[1].id.id).toBe("2");
    expect(result.items[1].name).toBe("Item 2");
    expect(result.items[1].price).toBe(200);
  });

  it("should generate an invoice", async () => {
    const repository = new InvoiceRepository();

    const address = new Address(
      "Street 1",
      "123",
      "Complement",
      "City",
      "State",
      "12345-678"
    );

    const item1 = new InvoiceItems({
      id: new Id("1"),
      name: "Item 1",
      price: 100,
    });

    const item2 = new InvoiceItems({
      id: new Id("2"),
      name: "Item 2",
      price: 200,
    });

    const invoice = new Invoice({
      id: new Id("1"),
      name: "Invoice 1",
      document: "123456789",
      address,
      items: [item1, item2],
    });

    await repository.generate(invoice);

    const invoiceDb = await InvoiceModel.findOne({
      where: { id: "1" },
      include: [InvoiceItemsModel],
    });

    expect(invoiceDb.id).toBe("1");
    expect(invoiceDb.name).toBe("Invoice 1");
    expect(invoiceDb.document).toBe("123456789");
    expect(invoiceDb.street).toBe("Street 1");
    expect(invoiceDb.number).toBe("123");
    expect(invoiceDb.complement).toBe("Complement");
    expect(invoiceDb.city).toBe("City");
    expect(invoiceDb.state).toBe("State");
    expect(invoiceDb.zipCode).toBe("12345-678");
    expect(invoiceDb.items).toHaveLength(2);
    expect(invoiceDb.items[0].id).toBe("1");
    expect(invoiceDb.items[0].name).toBe("Item 1");
    expect(invoiceDb.items[0].price).toBe(100);
    expect(invoiceDb.items[1].id).toBe("2");
    expect(invoiceDb.items[1].name).toBe("Item 2");
    expect(invoiceDb.items[1].price).toBe(200);
  });

  it("should throw an error when invoice is not found", async () => {
    const repository = new InvoiceRepository();

    await expect(repository.find("1")).rejects.toThrow("Invoice not found");
  });
});
