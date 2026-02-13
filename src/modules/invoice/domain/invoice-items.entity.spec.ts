import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItems from "./invoice-items.entity";

describe("InvoiceItems entity unit tests", () => {
  it("should create an invoice item", () => {
    const invoiceItem = new InvoiceItems({
      id: new Id("1"),
      name: "Item 1",
      price: 100,
    });

    expect(invoiceItem.id.id).toBe("1");
    expect(invoiceItem.name).toBe("Item 1");
    expect(invoiceItem.price).toBe(100);
  });

  it("should create an invoice item without id", () => {
    const invoiceItem = new InvoiceItems({
      name: "Item 1",
      price: 100,
    });

    expect(invoiceItem.id).toBeDefined();
    expect(invoiceItem.name).toBe("Item 1");
    expect(invoiceItem.price).toBe(100);
  });
});
