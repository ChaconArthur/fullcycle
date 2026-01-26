import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerCreatedEvent from "./customer-created.event";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import EnviaConsoleLog1Handler from "./handler/envia-console-log-1.handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log-2.handler";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";

describe("Customer Events Integration tests", () => {
  it("should dispatch CustomerCreated event when a new customer is created", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new EnviaConsoleLog1Handler();
    const eventHandler2 = new EnviaConsoleLog2Handler();
    const spyConsoleLog = jest.spyOn(console, "log");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    const customer = new Customer("1", "John Doe");

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: customer.id,
      name: customer.name,
    });

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyConsoleLog).toHaveBeenCalledWith(
      "Esse é o primeiro console.log do evento: CustomerCreated"
    );
    expect(spyConsoleLog).toHaveBeenCalledWith(
      "Esse é o segundo console.log do evento: CustomerCreated"
    );

    spyConsoleLog.mockRestore();
  });

  it("should dispatch CustomerAddressChanged event when customer address is changed", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();
    const spyConsoleLog = jest.spyOn(console, "log");

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    const customer = new Customer("1", "John Doe");
    const address = new Address("Street 1", 100, "12345", "City");

    customer.changeAddress(address);

    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: address.toString(),
    });

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyConsoleLog).toHaveBeenCalledWith(
      "Endereço do cliente: 1, John Doe alterado para: Street 1, 100, 12345 City"
    );

    spyConsoleLog.mockRestore();
  });

  it("should handle complete customer lifecycle with events", () => {
    const eventDispatcher = new EventDispatcher();
    const createHandler1 = new EnviaConsoleLog1Handler();
    const createHandler2 = new EnviaConsoleLog2Handler();
    const addressHandler = new EnviaConsoleLogHandler();
    const spyConsoleLog = jest.spyOn(console, "log");

    eventDispatcher.register("CustomerCreatedEvent", createHandler1);
    eventDispatcher.register("CustomerCreatedEvent", createHandler2);
    eventDispatcher.register("CustomerAddressChangedEvent", addressHandler);

    // Create customer
    const customer = new Customer("123", "Jane Smith");
    const customerCreatedEvent = new CustomerCreatedEvent({
      id: customer.id,
      name: customer.name,
    });
    eventDispatcher.notify(customerCreatedEvent);

    // Change address
    const newAddress = new Address("Main Street", 500, "54321", "New York");
    customer.changeAddress(newAddress);

    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: newAddress.toString(),
    });
    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyConsoleLog).toHaveBeenCalledTimes(3);
    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      1,
      "Esse é o primeiro console.log do evento: CustomerCreated"
    );
    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      2,
      "Esse é o segundo console.log do evento: CustomerCreated"
    );
    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      3,
      "Endereço do cliente: 123, Jane Smith alterado para: Main Street, 500, 54321 New York"
    );

    spyConsoleLog.mockRestore();
  });

  it("should handle multiple address changes", () => {
    const eventDispatcher = new EventDispatcher();
    const addressHandler = new EnviaConsoleLogHandler();
    const spyConsoleLog = jest.spyOn(console, "log");

    eventDispatcher.register("CustomerAddressChangedEvent", addressHandler);

    const customer = new Customer("999", "Bob Wilson");

    // First address change
    const address1 = new Address("First Street", 10, "11111", "Boston");
    customer.changeAddress(address1);

    const event1 = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: address1.toString(),
    });
    eventDispatcher.notify(event1);

    // Second address change
    const address2 = new Address("Second Street", 20, "22222", "Chicago");
    customer.changeAddress(address2);

    const event2 = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: address2.toString(),
    });
    eventDispatcher.notify(event2);

    expect(spyConsoleLog).toHaveBeenCalledTimes(2);
    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      1,
      "Endereço do cliente: 999, Bob Wilson alterado para: First Street, 10, 11111 Boston"
    );
    expect(spyConsoleLog).toHaveBeenNthCalledWith(
      2,
      "Endereço do cliente: 999, Bob Wilson alterado para: Second Street, 20, 22222 Chicago"
    );

    spyConsoleLog.mockRestore();
  });
});
