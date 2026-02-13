import Id from "../../@shared/domain/value-object/id.value-object";
import Address from "../../@shared/domain/value-object/address";
import Invoice from "./invoice.entity";
import InvoiceItems from "./invoice-items.entity";

describe("Invoice entity unit tests", () => {
  it("should create an invoice", () => {
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

    expect(invoice.id.id).toBe("1");
    expect(invoice.name).toBe("Invoice 1");
    expect(invoice.document).toBe("123456789");
    expect(invoice.address).toBe(address);
    expect(invoice.items).toHaveLength(2);
    expect(invoice.items[0]).toBe(item1);
    expect(invoice.items[1]).toBe(item2);
  });

  it("should calculate total", () => {
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

    expect(invoice.total()).toBe(300);
  });
});
