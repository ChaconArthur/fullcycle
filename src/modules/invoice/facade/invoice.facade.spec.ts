import { Sequelize } from "sequelize-typescript";
import InvoiceModel from "../repository/invoice.model";
import InvoiceItemsModel from "../repository/invoice-items.model";
import InvoiceFacadeFactory from "../factory/invoice.facade.factory";

describe("InvoiceFacade test", () => {
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

  it("should generate an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
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
          name: "Item 1",
          price: 100,
        },
        {
          id: "2",
          name: "Item 2",
          price: 200,
        },
      ],
    };

    const result = await facade.generate(input);

    expect(result.id).toBeDefined();
    expect(result.name).toBe("Invoice 1");
    expect(result.document).toBe("123456789");
    expect(result.street).toBe("Street 1");
    expect(result.number).toBe("123");
    expect(result.complement).toBe("Complement");
    expect(result.city).toBe("City");
    expect(result.state).toBe("State");
    expect(result.zipCode).toBe("12345-678");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe("1");
    expect(result.items[0].name).toBe("Item 1");
    expect(result.items[0].price).toBe(100);
    expect(result.items[1].id).toBe("2");
    expect(result.items[1].name).toBe("Item 2");
    expect(result.items[1].price).toBe(200);
    expect(result.total).toBe(300);
  });

  it("should find an invoice", async () => {
    const facade = InvoiceFacadeFactory.create();

    const input = {
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
          name: "Item 1",
          price: 100,
        },
        {
          id: "2",
          name: "Item 2",
          price: 200,
        },
      ],
    };

    const generated = await facade.generate(input);

    const result = await facade.find({ id: generated.id });

    expect(result.id).toBe(generated.id);
    expect(result.name).toBe("Invoice 1");
    expect(result.document).toBe("123456789");
    expect(result.address.street).toBe("Street 1");
    expect(result.address.number).toBe("123");
    expect(result.address.complement).toBe("Complement");
    expect(result.address.city).toBe("City");
    expect(result.address.state).toBe("State");
    expect(result.address.zipCode).toBe("12345-678");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].id).toBe("1");
    expect(result.items[0].name).toBe("Item 1");
    expect(result.items[0].price).toBe(100);
    expect(result.items[1].id).toBe("2");
    expect(result.items[1].name).toBe("Item 2");
    expect(result.items[1].price).toBe(200);
    expect(result.total).toBe(300);
    expect(result.createdAt).toBeDefined();
  });
});
