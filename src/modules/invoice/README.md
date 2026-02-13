# Módulo Invoice

Módulo completo de gerenciamento de Notas Fiscais (Invoice) implementado seguindo os padrões de arquitetura do monolito.

## 📋 Visão Geral

Este módulo fornece funcionalidades completas para geração e consulta de notas fiscais, incluindo:
- Geração de novas invoices com múltiplos itens
- Busca de invoices por ID
- Cálculo automático do total
- Persistência em banco de dados com Sequelize

## 🏗️ Arquitetura

O módulo segue os princípios de Clean Architecture e DDD (Domain-Driven Design).

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

## 🧪 Testes

O módulo possui cobertura completa de testes unitários e de integração.

### Componentes Testados
- ✅ InvoiceItems Entity (2 testes)
- ✅ Invoice Entity (2 testes)
- ✅ FindInvoiceUseCase (1 teste)
- ✅ GenerateInvoiceUseCase (1 teste)
- ✅ InvoiceRepository (3 testes)
- ✅ InvoiceFacade (2 testes)

### Executar Testes
```bash
npm test -- --testPathPattern=invoice
```

**Resultado:**
```
Test Suites: 6 passed, 6 total
Tests:       11 passed, 11 total
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

## 🗄️ Banco de Dados

### Tabela: invoices

| Campo      | Tipo   | Descrição                    |
|------------|--------|------------------------------|
| id         | string | Chave primária (UUID)        |
| name       | string | Nome do cliente              |
| document   | string | CPF/CNPJ do cliente          |
| street     | string | Rua do endereço              |
| number     | string | Número do endereço           |
| complement | string | Complemento do endereço      |
| city       | string | Cidade                       |
| state      | string | Estado (UF)                  |
| zip_code   | string | CEP                          |
| createdAt  | Date   | Data de criação              |
| updatedAt  | Date   | Data de atualização          |

### Tabela: invoice_items

| Campo      | Tipo   | Descrição                    |
|------------|--------|------------------------------|
| id         | string | Chave primária (UUID)        |
| invoice_id | string | Chave estrangeira (Invoice)  |
| name       | string | Nome do produto/serviço      |
| price      | number | Preço do item                |

**Relacionamento:** Invoice 1:N InvoiceItems

## 🔍 Detalhes de Implementação

### Value Objects Compartilhados

O módulo reutiliza Value Objects do módulo `@shared`:
- **Id**: Geração automática de UUIDs (v4)
- **Address**: Representação de endereço completo
- **BaseEntity**: Classe base com id, createdAt e updatedAt

### Cálculo do Total

O total é calculado dinamicamente somando o preço de todos os itens:

```typescript
total(): number {
  return this._items.reduce((total, item) => total + item.price, 0);
}
```

### Geração Automática

- **IDs**: Gerados automaticamente usando UUID v4
- **Timestamps**: createdAt e updatedAt gerenciados automaticamente pela BaseEntity

## 📌 Conformidade

A implementação está 100% conforme com os requisitos:
- ✅ Use cases Find e Generate
- ✅ DTOs exatamente como especificado
- ✅ Entidade Invoice com todos os campos requeridos
- ✅ Entidade InvoiceItems com todos os campos requeridos
- ✅ Facade, Factory, Domain, Gateway, Repository e UseCase implementados
- ✅ Testes cobrindo toda a implementação
- ✅ TypeScript com tipagem forte
