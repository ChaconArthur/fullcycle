import { app, sequelize } from "../express";
import request from "supertest";

describe("E2E test for API", () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("POST /products", () => {
    it("should create a product", async () => {
      const response = await request(app)
        .post("/products")
        .send({
          name: "Product 1",
          description: "Product 1 description",
          purchasePrice: 100,
          stock: 10,
        });

      expect(response.status).toBe(201);
    });

    it("should not create a product with invalid data", async () => {
      const response = await request(app).post("/products").send({
        name: "Product 1",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /clients", () => {
    it("should create a client", async () => {
      const response = await request(app)
        .post("/clients")
        .send({
          name: "Client 1",
          email: "client@example.com",
          document: "00000000000",
          address: {
            street: "Street 1",
            number: "123",
            complement: "Complement 1",
            city: "City 1",
            state: "State 1",
            zipCode: "00000-000",
          },
        });

      expect(response.status).toBe(201);
    });

    it("should not create a client with invalid data", async () => {
      const response = await request(app).post("/clients").send({
        name: "Client 1",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /invoice/:id", () => {
    it("should return an invoice", async () => {
      // Use fixed IDs for testing
      const clientId = "1c";
      const productId = "1p";

      // Create a product with fixed ID
      await request(app).post("/products").send({
        id: productId,
        name: "Product 1",
        description: "Product 1 description",
        purchasePrice: 100,
        stock: 10,
      });

      // Create a client with fixed ID
      await request(app).post("/clients").send({
        id: clientId,
        name: "Client 1",
        email: "client@example.com",
        document: "00000000000",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Complement 1",
          city: "City 1",
          state: "State 1",
          zipCode: "00000-000",
        },
      });

      // Place an order
      const checkoutResponse = await request(app).post("/checkout").send({
        clientId: clientId,
        products: [{ productId: productId }],
      });

      expect(checkoutResponse.status).toBe(201);
      const { invoiceId } = checkoutResponse.body;

      // Get the invoice
      const invoiceResponse = await request(app).get(`/invoice/${invoiceId}`);

      expect(invoiceResponse.status).toBe(200);
      expect(invoiceResponse.body).toHaveProperty("id");
      expect(invoiceResponse.body).toHaveProperty("name");
      expect(invoiceResponse.body).toHaveProperty("document");
      expect(invoiceResponse.body).toHaveProperty("address");
      expect(invoiceResponse.body).toHaveProperty("items");
      expect(invoiceResponse.body).toHaveProperty("total");
      expect(invoiceResponse.body.name).toBe("Client 1");
    });

    it("should return 500 for non-existent invoice", async () => {
      const response = await request(app).get(
        "/invoice/non-existent-id"
      );

      expect(response.status).toBe(500);
    });
  });

  describe("POST /checkout", () => {
    it("should place an order successfully", async () => {
      // Use fixed IDs for testing
      const clientId = "1c";
      const productId = "1p";

      // Create a product with fixed ID
      await request(app).post("/products").send({
        id: productId,
        name: "Product 1",
        description: "Product 1 description",
        purchasePrice: 100,
        stock: 10,
      });

      // Create a client with fixed ID
      await request(app).post("/clients").send({
        id: clientId,
        name: "Client 1",
        email: "client@example.com",
        document: "00000000000",
        address: {
          street: "Street 1",
          number: "123",
          complement: "Complement 1",
          city: "City 1",
          state: "State 1",
          zipCode: "00000-000",
        },
      });

      // Place an order
      const response = await request(app).post("/checkout").send({
        clientId: clientId,
        products: [{ productId: productId }],
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("invoiceId");
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("products");
      expect(response.body.products).toHaveLength(1);
    });

    it("should not place an order with invalid client", async () => {
      const response = await request(app).post("/checkout").send({
        clientId: "invalid-id",
        products: [{ productId: "some-product" }],
      });

      expect(response.status).toBe(500);
    });

    it("should not place an order with no products", async () => {
      const clientId = "2c";

      await request(app).post("/clients").send({
        id: clientId,
        name: "Client 2",
        email: "client2@example.com",
        document: "11111111111",
        address: {
          street: "Street 2",
          number: "456",
          complement: "Complement 2",
          city: "City 2",
          state: "State 2",
          zipCode: "11111-111",
        },
      });

      const response = await request(app).post("/checkout").send({
        clientId: clientId,
        products: [],
      });

      expect(response.status).toBe(500);
    });
  });
});
