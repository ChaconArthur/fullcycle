# Product Use Cases

Este módulo contém os casos de uso (use cases) para a entidade Product, implementados seguindo os princípios de Clean Architecture.

## 📋 Casos de Uso Disponíveis

### 1. Create Product
Cria um novo produto no sistema.

**Entrada:**
```typescript
{
  name: string;
  price: number;
}
```

**Saída:**
```typescript
{
  id: string;
  name: string;
  price: number;
}
```

### 2. Find Product
Busca um produto específico por ID.

**Entrada:**
```typescript
{
  id: string;
}
```

**Saída:**
```typescript
{
  id: string;
  name: string;
  price: number;
}
```

### 3. List Products
Lista todos os produtos cadastrados.

**Entrada:**
```typescript
{}
```

**Saída:**
```typescript
{
  products: [
    {
      id: string;
      name: string;
      price: number;
    }
  ]
}
```

### 4. Update Product
Atualiza os dados de um produto existente.

**Entrada:**
```typescript
{
  id: string;
  name: string;
  price: number;
}
```

**Saída:**
```typescript
{
  id: string;
  name: string;
  price: number;
}
```

## 🏗️ Estrutura

Cada caso de uso segue a mesma estrutura:

```
usecase/product/{operation}/
├── {operation}.product.dto.ts              # Definição dos DTOs de entrada e saída
├── {operation}.product.usecase.ts          # Implementação do caso de uso
├── {operation}.product.unit.spec.ts        # Testes unitários
└── {operation}.product.integration.spec.ts # Testes de integração
```

## 💡 Como Usar

### Exemplo: Criar um Produto

```typescript
import CreateProductUseCase from './create/create.product.usecase';
import ProductRepository from '../../infrastructure/product/repository/sequelize/product.repository';

// Instanciar o repositório
const productRepository = new ProductRepository();

// Instanciar o caso de uso
const createProduct = new CreateProductUseCase(productRepository);

// Executar
const input = {
  name: "Notebook",
  price: 2500.00
};

const output = await createProduct.execute(input);
console.log(output); // { id: "uuid-generated", name: "Notebook", price: 2500.00 }
```

### Exemplo: Buscar um Produto

```typescript
import FindProductUseCase from './find/find.product.usecase';
import ProductRepository from '../../infrastructure/product/repository/sequelize/product.repository';

const productRepository = new ProductRepository();
const findProduct = new FindProductUseCase(productRepository);

const input = { id: "123" };
const output = await findProduct.execute(input);
console.log(output); // { id: "123", name: "Notebook", price: 2500.00 }
```

### Exemplo: Listar Produtos

```typescript
import ListProductUseCase from './list/list.product.usecase';
import ProductRepository from '../../infrastructure/product/repository/sequelize/product.repository';

const productRepository = new ProductRepository();
const listProducts = new ListProductUseCase(productRepository);

const output = await listProducts.execute({});
console.log(output.products); // Array de produtos
```

### Exemplo: Atualizar um Produto

```typescript
import UpdateProductUseCase from './update/update.product.usecase';
import ProductRepository from '../../infrastructure/product/repository/sequelize/product.repository';

const productRepository = new ProductRepository();
const updateProduct = new UpdateProductUseCase(productRepository);

const input = {
  id: "123",
  name: "Notebook Gamer",
  price: 3500.00
};

const output = await updateProduct.execute(input);
console.log(output); // { id: "123", name: "Notebook Gamer", price: 3500.00 }
```

## 🧪 Executando os Testes

### Todos os testes de Product

```bash
npm test -- src/usecase/product
```

### Testes unitários apenas

```bash
npm test -- src/usecase/product --testPathPattern=unit
```

### Testes de integração apenas

```bash
npm test -- src/usecase/product --testPathPattern=integration
```

### Teste específico

```bash
npm test -- src/usecase/product/create/create.product.unit.spec.ts
```

## ✅ Validações

Os casos de uso implementam as seguintes validações através da entidade Product:

- **name**: Campo obrigatório (não pode ser vazio)
- **price**: Deve ser maior que zero

Exemplo de erro ao tentar criar produto com dados inválidos:

```typescript
// Erro: Name is required
const input = { name: "", price: 100 };
await createProduct.execute(input); // Throws Error

// Erro: Price must be greater than zero
const input = { name: "Product", price: -1 };
await createProduct.execute(input); // Throws Error
```

## 🔄 Fluxo de Execução

Todos os casos de uso seguem o mesmo fluxo básico:

1. **Recebimento do Input**: DTO tipado com os dados necessários
2. **Validação**: A entidade Product valida os dados automaticamente
3. **Operação no Repositório**: Interação com a camada de persistência
4. **Retorno do Output**: DTO tipado com o resultado da operação

## 🎯 Princípios Aplicados

- **Single Responsibility**: Cada caso de uso tem apenas uma responsabilidade
- **Dependency Inversion**: Dependência de abstrações (interfaces) e não de implementações concretas
- **Interface Segregation**: DTOs específicos para cada operação
- **Clean Architecture**: Separação clara entre camadas de domínio, aplicação e infraestrutura

## 📦 Dependências

- `uuid`: Geração de IDs únicos
- `sequelize-typescript`: ORM para testes de integração
- `jest`: Framework de testes

## 📚 Documentação Relacionada

- [Product Entity](../../domain/product/entity/product.ts)
- [Product Repository Interface](../../domain/product/repository/product-repository.interface.ts)
- [Product Repository Implementation](../../infrastructure/product/repository/sequelize/product.repository.ts)
