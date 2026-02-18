# Sistema Monolítico Full Cycle

Sistema monolítico completo desenvolvido em TypeScript seguindo os princípios de Clean Architecture e Domain-Driven Design (DDD).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Execução](#execução)
- [Testes](#testes)
- [Arquitetura](#arquitetura)
- [API REST](#api-rest)
- [Módulos](#módulos)

## 🎯 Visão Geral

Este projeto implementa um sistema monolítico modular que gerencia o fluxo completo de e-commerce, desde o cadastro de produtos e clientes até o processamento de pedidos, pagamentos e geração de notas fiscais.

## 🛠️ Tecnologias

- **TypeScript 4.5+** - Linguagem principal
- **Node.js** - Runtime
- **Express 4.17** - Framework web
- **Sequelize 6.17** - ORM
- **SQLite 5.0** - Banco de dados
- **Jest 27.5** - Framework de testes
- **Supertest 6.2** - Testes E2E de API

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Compilar TypeScript
npm run tsc
```

## 🚀 Execução

### Executar Testes

```bash
npm test
```

### Executar Testes Específicos

```bash
# Apenas testes E2E da API
npm test -- --testPathPattern=api.e2e.spec.ts

# Testes de um módulo específico
npm test -- --testPathPattern=invoice

# Testes com cobertura
npm test -- --coverage
```

## 🧪 Testes

O projeto possui cobertura completa de testes:

```
Test Suites: 22 passed, 22 total
Tests:       42 passed, 42 total
```

### Tipos de Testes

- **Testes Unitários**: Todos os use cases, repositories e facades
- **Testes de Integração**: Repositories com banco de dados
- **Testes E2E**: Todos os endpoints da API REST

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── modules/                      # Módulos de domínio
│   ├── @shared/                 # Código compartilhado
│   │   ├── domain/
│   │   │   ├── entity/
│   │   │   └── value-object/
│   │   └── usecase/
│   ├── product-adm/             # Administração de produtos
│   ├── store-catalog/           # Catálogo de produtos
│   ├── client-adm/              # Administração de clientes
│   ├── checkout/                # Processamento de pedidos
│   ├── payment/                 # Processamento de pagamentos
│   └── invoice/                 # Geração de notas fiscais
└── infrastructure/              # Infraestrutura
    └── api/                     # API REST
        ├── routes/
        └── __tests__/
```

### Princípios Aplicados

- **Clean Architecture**: Separação clara entre camadas
- **DDD**: Modelagem rica de domínio
- **SOLID**: Princípios de design orientado a objetos
- **Dependency Inversion**: Uso de interfaces e facades
- **Repository Pattern**: Abstração de persistência

### Padrão de Módulos

Cada módulo segue a mesma estrutura:

```
module/
├── domain/              # Entidades e lógica de negócio
├── usecase/            # Casos de uso (application layer)
├── repository/         # Persistência de dados
├── gateway/            # Interfaces de saída
├── facade/             # Interface pública do módulo
└── factory/            # Criação de instâncias
```

## 📡 API REST

A API REST está disponível através do Express com os seguintes endpoints:

### POST /products

Cria um novo produto.

**Request:**
```json
{
  "name": "Notebook Dell",
  "description": "Notebook Dell Inspiron 15",
  "purchasePrice": 3000,
  "stock": 10
}
```

**Response:** `201 Created`

---

### POST /clients

Cria um novo cliente.

**Request:**
```json
{
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
}
```

**Response:** `201 Created`

---

### POST /checkout

Processa um pedido (validação, pagamento e nota fiscal).

**Request:**
```json
{
  "clientId": "uuid-do-cliente",
  "products": [
    {
      "productId": "uuid-do-produto"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-do-pedido",
  "invoiceId": "uuid-da-nota-fiscal",
  "status": "approved",
  "total": 4500,
  "products": [
    {
      "productId": "uuid-do-produto"
    }
  ]
}
```

---

### GET /invoice/:id

Busca uma nota fiscal por ID.

**Response:** `200 OK`
```json
{
  "id": "uuid-da-nota-fiscal",
  "name": "João Silva",
  "document": "12345678900",
  "address": {
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01234-567"
  },
  "items": [
    {
      "id": "uuid-do-item",
      "name": "Notebook Dell",
      "price": 4500
    }
  ],
  "total": 4500,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

## 📚 Módulos

### 1. Product-Adm (Administração de Produtos)

Gerencia produtos com foco em estoque e preço de compra.

**Casos de Uso:**
- `AddProductUseCase`: Adiciona novo produto
- `CheckStockUseCase`: Verifica estoque disponível

**Facade:**
- `addProduct(input): Promise<void>`
- `checkStock(input): Promise<CheckStockOutput>`

---

### 2. Store-Catalog (Catálogo de Produtos)

Expõe produtos para venda com preço calculado.

**Casos de Uso:**
- `FindProductUseCase`: Busca produto por ID
- `FindAllProductsUseCase`: Lista todos os produtos

**Facade:**
- `find(input): Promise<ProductOutput>`
- `findAll(): Promise<ProductsOutput>`

**Observação:** Preço de venda = Preço de compra × 1.5 (50% de margem)

---

### 3. Client-Adm (Administração de Clientes)

Gerencia cadastro de clientes.

**Casos de Uso:**
- `AddClientUseCase`: Adiciona novo cliente
- `FindClientUseCase`: Busca cliente por ID

**Facade:**
- `add(input): Promise<void>`
- `find(input): Promise<ClientOutput>`

---

### 4. Checkout (Processamento de Pedidos)

Orquestra o fluxo completo de compra.

**Casos de Uso:**
- `PlaceOrderUseCase`: Processa pedido completo

**Fluxo:**
1. Valida existência do cliente
2. Valida produtos e estoque
3. Calcula total do pedido
4. Processa pagamento
5. Gera nota fiscal (se aprovado)
6. Retorna status do pedido

**Facade:**
- `placeOrder(input): Promise<OrderOutput>`

---

### 5. Payment (Processamento de Pagamentos)

Processa pagamentos de pedidos.

**Casos de Uso:**
- `ProcessPaymentUseCase`: Processa transação de pagamento

**Facade:**
- `process(input): Promise<PaymentOutput>`

**Regra:** Valores acima de 100 são automaticamente aprovados

---

### 6. Invoice (Notas Fiscais)

Gerencia geração e consulta de notas fiscais.

**Casos de Uso:**
- `GenerateInvoiceUseCase`: Gera nova nota fiscal
- `FindInvoiceUseCase`: Busca nota fiscal por ID

**Facade:**
- `generate(input): Promise<InvoiceOutput>`
- `find(input): Promise<InvoiceOutput>`

**Características:**
- Calcula total automaticamente
- Suporta múltiplos itens
- Armazena endereço completo do cliente

## 🗄️ Banco de Dados

### Modelo de Dados

O sistema utiliza as seguintes tabelas:

#### products
- `id` (PK)
- `name`
- `description`
- `purchasePrice`
- `salesPrice`
- `stock`
- `createdAt`
- `updatedAt`

#### clients
- `id` (PK)
- `name`
- `email`
- `document`
- `street`, `number`, `complement`, `city`, `state`, `zipCode`
- `createdAt`
- `updatedAt`

#### invoices
- `id` (PK)
- `name`
- `document`
- `street`, `number`, `complement`, `city`, `state`, `zip_code`
- `createdAt`
- `updatedAt`

#### invoice_items
- `id` (PK)
- `invoice_id` (FK)
- `name`
- `price`

#### transactions
- `id` (PK)
- `orderId`
- `amount`
- `status`
- `createdAt`
- `updatedAt`

## 🔧 Configuração

### TypeScript

O projeto usa TypeScript com as seguintes configurações principais:
- Target: ES2020
- Module: CommonJS
- Strict mode habilitado
- Decorators habilitados (para Sequelize)

### Jest

Configuração de testes com SWC para transpilação rápida:
- Transform: @swc/jest
- Coverage provider: v8
- Clear mocks automático

## 📝 Convenções de Código

### Nomenclatura

- **Entities**: PascalCase (ex: `Product`, `Client`)
- **Use Cases**: PascalCase + UseCase (ex: `AddProductUseCase`)
- **Interfaces**: PascalCase + Interface (ex: `ProductGateway`)
- **DTOs**: PascalCase + Dto (ex: `AddProductInputDto`)

### Estrutura de Arquivos

- **Entities**: `*.entity.ts`
- **Use Cases**: `*.usecase.ts`
- **DTOs**: `*.dto.ts`
- **Models**: `*.model.ts`
- **Repositories**: `*.repository.ts`
- **Facades**: `*.facade.ts`
- **Factories**: `*.factory.ts`
- **Testes**: `*.spec.ts`

## 🤝 Contribuindo

### Executar Testes Antes de Commit

```bash
npm test
```

### Adicionar Novo Módulo

1. Criar estrutura de diretórios seguindo o padrão
2. Implementar domain entities
3. Criar use cases
4. Implementar repository
5. Criar facade
6. Implementar factory
7. Escrever testes completos

## 📄 Licença

Este projeto é parte do curso Full Cycle.

## 👥 Autores

Desenvolvido durante o curso Full Cycle.
