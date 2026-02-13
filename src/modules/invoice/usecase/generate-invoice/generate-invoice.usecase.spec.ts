import GenerateInvoiceUseCase from "./generate-invoice.usecase";

const MockRepository = () => {
  return {
    find: jest.fn(),
    generate: jest.fn(),
  };
};

describe("GenerateInvoiceUseCase unit tests", () => {
  it("should generate an invoice", async () => {
    const repository = MockRepository();
    const usecase = new GenerateInvoiceUseCase(repository);

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

    const result = await usecase.execute(input);

    expect(repository.generate).toHaveBeenCalled();
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
});
