# Invoice Module

Módulo completo de Invoice (Nota Fiscal) implementado seguindo a arquitetura do monolito.

## Estrutura

```
invoice/
├── domain/
│   ├── invoice.entity.ts
│   ├── invoice.entity.spec.ts
│   ├── invoice-items.entity.ts
│   └── invoice-items.entity.spec.ts
├── gateway/
│   └── invoice.gateway.ts
├── repository/
│   ├── invoice.model.ts
│   ├── invoice-items.model.ts
│   ├── invoice.repository.ts
│   └── invoice.repository.spec.ts
├── usecase/
│   ├── find-invoice/
│   │   ├── find-invoice.dto.ts
│   │   ├── find-invoice.usecase.ts
│   │   └── find-invoice.usecase.spec.ts
│   └── generate-invoice/
│       ├── generate-invoice.dto.ts
│       ├── generate-invoice.usecase.ts
│       └── generate-invoice.usecase.spec.ts
├── facade/
│   ├── invoice.facade.interface.ts
│   ├── invoice.facade.ts
│   └── invoice.facade.spec.ts
└── factory/
    └── invoice.facade.factory.ts
```

## Entidades

### Invoice
- id: Id (gerado automaticamente)
- name: string
- document: string
- address: Address (value object do @shared)
- items: InvoiceItems[]
- createdAt: Date (gerado automaticamente)
- updatedAt: Date (gerado automaticamente)

Métodos:
- `total(): number` - Calcula o total da invoice somando o preço de todos os items

### InvoiceItems
- id: Id (gerado automaticamente)
- name: string
- price: number

## Use Cases

### FindInvoiceUseCase
Busca uma invoice por ID.

**Input:**
```typescript
{
  id: string;
}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  document: string;
  address: {
    street: string;
    number: string;
    complement: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
  }[];
  total: number;
  createdAt: Date;
}
```

### GenerateInvoiceUseCase
Gera uma nova invoice.

**Input:**
```typescript
{
  name: string;
  document: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  items: {
    id: string;
    name: string;
    price: number;
  }[];
}
```

**Output:**
```typescript
{
  id: string;
  name: string;
  document: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  items: {
    id: string;
    name: string;
    price: number;
  }[];
  total: number;
}
```

## Facade

A facade `InvoiceFacade` expõe os métodos:
- `find(input: FindInvoiceFacadeInputDto): Promise<FindInvoiceFacadeOutputDto>`
- `generate(input: GenerateInvoiceFacadeInputDto): Promise<GenerateInvoiceFacadeOutputDto>`

## Factory

`InvoiceFacadeFactory.create()` - Cria uma instância da facade com todas as dependências configuradas.

## Testes

Todos os componentes possuem testes unitários:
- ✅ InvoiceItems Entity
- ✅ Invoice Entity
- ✅ FindInvoiceUseCase
- ✅ GenerateInvoiceUseCase
- ✅ InvoiceRepository
- ✅ InvoiceFacade

Para executar os testes:
```bash
npm test -- --testPathPattern=invoice
```

## Uso

```typescript
import InvoiceFacadeFactory from "./modules/invoice/factory/invoice.facade.factory";

const invoiceFacade = InvoiceFacadeFactory.create();

// Gerar uma invoice
const invoice = await invoiceFacade.generate({
  name: "Cliente Teste",
  document: "123456789",
  street: "Rua Teste",
  number: "123",
  complement: "Apto 1",
  city: "São Paulo",
  state: "SP",
  zipCode: "12345-678",
  items: [
    { id: "1", name: "Produto 1", price: 100 },
    { id: "2", name: "Produto 2", price: 200 }
  ]
});

// Buscar uma invoice
const foundInvoice = await invoiceFacade.find({ id: invoice.id });
```
