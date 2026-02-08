import EventDispatcher from "../../@shared/event/event-dispatcher";
import Address from "../value-object/address";
import Customer from "../entity/customer";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";

describe("CustomerAddressChangedEvent tests", () => {
  it("should register event handler for CustomerAddressChanged event", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"]
    ).toBeDefined();
    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"].length
    ).toBe(1);
    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("CustomerAddressChangedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"].length
    ).toBe(0);
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["CustomerAddressChangedEvent"]
    ).toBeUndefined();
  });

  it("should notify event handler when address is changed", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    const customer = new Customer("123", "John Doe");
    const address = new Address("Street 1", 123, "12345", "City");

    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: address.toString(),
    });

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should log correct message when address is changed", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();
    const spyConsoleLog = jest.spyOn(console, "log");

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    const customer = new Customer("123", "John Doe");
    const address = new Address("Street 1", 123, "12345", "City");

    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: address.toString(),
    });

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyConsoleLog).toHaveBeenCalledWith(
      `Endereço do cliente: ${customer.id}, ${customer.name} alterado para: ${address.toString()}`
    );

    spyConsoleLog.mockRestore();
  });

  it("should handle address change with complete customer data", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new EnviaConsoleLogHandler();
    const spyConsoleLog = jest.spyOn(console, "log");

    eventDispatcher.register("CustomerAddressChangedEvent", eventHandler);

    const customer = new Customer("456", "Jane Smith");
    const newAddress = new Address("Main Street", 500, "54321", "New York");

    customer.changeAddress(newAddress);

    const customerAddressChangedEvent = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: newAddress.toString(),
    });

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(spyConsoleLog).toHaveBeenCalledWith(
      "Endereço do cliente: 456, Jane Smith alterado para: Main Street, 500, 54321 New York"
    );

    spyConsoleLog.mockRestore();
  });
});
