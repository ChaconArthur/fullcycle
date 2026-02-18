import Order from "../domain/order.entity";
import CheckoutGateway from "../gateway/checkout.gateway";

export default class OrderRepository implements CheckoutGateway {
  async addOrder(order: Order): Promise<void> {
    // For now, just a simple in-memory implementation
    // In production, this would persist to database
  }

  async findOrder(id: string): Promise<Order> {
    throw new Error("Method not implemented.");
  }
}
