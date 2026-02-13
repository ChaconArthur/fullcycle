import Id from "../../../@shared/domain/value-object/id.value-object";
import Address from "../../../@shared/domain/value-object/address";
import Invoice from "../../domain/invoice.entity";
import InvoiceItems from "../../domain/invoice-items.entity";
import FindInvoiceUseCase from "./find-invoice.usecase";

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
  createdAt: new Date(),
  updatedAt: new Date(),
});

const MockRepository = () => {
  return {
    find: jest.fn().mockReturnValue(Promise.resolve(invoice)),
    generate: jest.fn(),
  };
};

describe("FindInvoiceUseCase unit tests", () => {
  it("should find an invoice", async () => {
    const repository = MockRepository();
    const usecase = new FindInvoiceUseCase(repository);

    const input = {
      id: "1",
    };

    const result = await usecase.execute(input);

    expect(repository.find).toHaveBeenCalled();
    expect(result.id).toBe("1");
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
