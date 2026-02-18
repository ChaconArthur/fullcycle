# API REST - Monolito Full Cycle

API REST completa para o sistema monolítico com endpoints para gerenciamento de produtos, clientes, pedidos e notas fiscais.

## 🚀 Como Executar os Testes

```bash
npm run test
```

Todos os testes, incluindo os testes E2E dos endpoints, serão executados automaticamente.

## 📋 Endpoints Disponíveis

### 1. POST /products

Cria um novo produto no sistema.

**Request Body:**
```json
{
  "id": "string (optional)",
  "name": "string (required)",
  "description": "string (required)",
  "purchasePrice": "number (required)",
  "stock": "number (required)"
}
```

**Response:**
- `201 Created` - Produto criado com sucesso
- `400 Bad Request` - Dados inválidos ou campos obrigatórios faltando
- `500 Internal Server Error` - Erro no servidor

**Exemplo:**
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Notebook Dell",
    "description": "Notebook Dell Inspiron 15",
    "purchasePrice": 3000,
    "stock": 10
  }'
```

---

### 2. POST /clients

Cria um novo cliente no sistema.

**Request Body:**
```json
{
  "id": "string (optional)",
  "name": "string (required)",
  "email": "string (required)",
  "document": "string (required)",
  "address": {
    "street": "string (required)",
    "number": "string (required)",
    "complement": "string (required)",
    "city": "string (required)",
    "state": "string (required)",
    "zipCode": "string (required)"
  }
}
```

**Response:**
- `201 Created` - Cliente criado com sucesso
- `400 Bad Request` - Dados inválidos ou campos obrigatórios faltando
- `500 Internal Server Error` - Erro no servidor

**Exemplo:**
```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@example.com",
    "document": "12345678900",
    "address": {
      "street": "Rua das Flores",
      "number": "123",
      "complement": "Apto 45",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    }
  }'
```

---

### 3. POST /checkout

Realiza um pedido (checkout), processando pagamento e gerando nota fiscal.

**Request Body:**
```json
{
  "clientId": "string (required)",
  "products": [
    {
      "productId": "string (required)"
    }
  ]
}
```

**Response:**
```json
{
  "id": "string",
  "invoiceId": "string",
  "status": "approved | rejected",
  "total": "number",
  "products": [
    {
      "productId": "string"
    }
  ]
}
```

- `201 Created` - Pedido criado com sucesso
- `500 Internal Server Error` - Erro no processamento (cliente não encontrado, produto sem estoque, etc.)

**Exemplo:**
```bash
curl -X POST http://localhost:3000/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client-uuid-here",
    "products": [
      {
        "productId": "product-uuid-here"
      }
    ]
  }'
```

**Fluxo do Checkout:**
1. Valida se o cliente existe
2. Valida se os produtos existem e têm estoque
3. Calcula o total do pedido
4. Processa o pagamento
5. Se aprovado, gera a nota fiscal
6. Retorna o status do pedido

---

### 4. GET /invoice/:id

Busca uma nota fiscal pelo ID.

**URL Parameters:**
- `id` - UUID da nota fiscal

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "document": "string",
  "address": {
    "street": "string",
    "number": "string",
    "complement": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string"
  },
  "items": [
    {
      "id": "string",
      "name": "string",
      "price": "number"
    }
  ],
  "total": "number",
  "createdAt": "Date"
}
```

- `200 OK` - Nota fiscal encontrada
- `500 Internal Server Error` - Nota fiscal não encontrada

**Exemplo:**
```bash
curl http://localhost:3000/invoice/invoice-uuid-here
```

---

## 🏗️ Arquitetura

A API foi construída seguindo os princípios de Clean Architecture e Domain-Driven Design (DDD):

### Módulos Implementados

1. **Product-Adm**: Gerenciamento de produtos (estoque e preços)
2. **Client-Adm**: Gerenciamento de clientes
3. **Store-Catalog**: Catálogo de produtos para venda
4. **Checkout**: Orquestração do processo de compra
5. **Payment**: Processamento de pagamentos
6. **Invoice**: Geração e consulta de notas fiscais

### Módulo Checkout (Novo)

O módulo de checkout foi criado para orquestrar todo o fluxo de compra:

```
checkout/
├── domain/
│   ├── client.entity.ts
│   ├── product.entity.ts
│   └── order.entity.ts
├── usecase/
│   └── place-order/
│       ├── place-order.dto.ts
│       └── place-order.usecase.ts
├── facade/
│   ├── checkout.facade.interface.ts
│   └── checkout.facade.ts
├── factory/
│   └── checkout.facade.factory.ts
├── gateway/
│   └── checkout.gateway.ts
└── repository/
    └── order.repository.ts
```

### Infraestrutura da API

```
infrastructure/
└── api/
    ├── express.ts (configuração do Express e banco de dados)
    ├── routes/
    │   ├── product.route.ts
    │   ├── client.route.ts
    │   ├── checkout.route.ts
    │   └── invoice.route.ts
    └── __tests__/
        └── api.e2e.spec.ts
```

---

## 🧪 Testes E2E

Foram implementados 9 testes E2E cobrindo todos os endpoints:

### POST /products
- ✅ Criar produto com sucesso
- ✅ Rejeitar produto com dados inválidos

### POST /clients
- ✅ Criar cliente com sucesso
- ✅ Rejeitar cliente com dados inválidos

### POST /checkout
- ✅ Realizar pedido com sucesso
- ✅ Rejeitar pedido com cliente inválido
- ✅ Rejeitar pedido sem produtos

### GET /invoice/:id
- ✅ Retornar nota fiscal existente
- ✅ Retornar erro para nota fiscal inexistente

**Executar apenas testes E2E:**
```bash
npm test -- --testPathPattern=api.e2e.spec.ts
```

---

## 📊 Resultado dos Testes

```
Test Suites: 22 passed, 22 total
Tests:       42 passed, 42 total
Snapshots:   0 total
Time:        2.113 s
```

Todos os testes unitários e E2E estão passando! ✅

---

## 🔧 Tecnologias Utilizadas

- **TypeScript**: Linguagem principal
- **Express**: Framework web
- **Sequelize**: ORM para banco de dados
- **SQLite**: Banco de dados (in-memory para testes)
- **Jest**: Framework de testes
- **Supertest**: Testes E2E para API REST

---

## 💡 Observações Importantes

1. **Sincronização de Produtos**: Os produtos criados via `/products` são automaticamente disponibilizados no catálogo com preço de venda calculado (margem de 50% sobre o preço de compra).

2. **Validação de Estoque**: O checkout valida automaticamente se há estoque disponível antes de processar o pedido.

3. **Processamento de Pagamento**: O módulo de pagamento é simulado e pode aprovar ou rejeitar transações.

4. **Geração de Invoice**: A nota fiscal só é gerada se o pagamento for aprovado.

5. **IDs Fixos para Testes**: Nos testes E2E, é possível passar IDs fixos nos endpoints POST para facilitar a integração entre os testes.
