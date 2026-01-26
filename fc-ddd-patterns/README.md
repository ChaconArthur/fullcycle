# FC DDD Patterns

Projeto desenvolvido para aplicar padrões de Domain-Driven Design (DDD) utilizando TypeScript.

## Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente instalado junto com o Node.js)

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd fc-ddd-patterns
```

2. Instale as dependências do projeto:
```bash
npm install
```

## Como Executar o Projeto

### Executar os Testes

O projeto utiliza Jest para testes. Para executar todos os testes:

```bash
npm test
```

Este comando irá:
- Verificar a tipagem do TypeScript (compilação sem emitir arquivos)
- Executar todos os testes unitários e de integração

### Compilar o Projeto

Para compilar o código TypeScript:

```bash
npm run tsc
```

## Estrutura do Projeto

```
src/
├── domain/
│   ├── @shared/          # Recursos compartilhados entre domínios
│   │   ├── event/        # Event Dispatcher e interfaces de eventos
│   │   └── repository/   # Interfaces de repositório genéricas
│   ├── checkout/         # Domínio de pedidos/checkout
│   │   ├── entity/       # Entidades (Order, OrderItem)
│   │   ├── factory/      # Factories para criação de objetos
│   │   ├── repository/   # Interfaces de repositório
│   │   └── service/      # Serviços de domínio
│   ├── customer/         # Domínio de clientes
│   │   ├── entity/       # Entidades (Customer)
│   │   ├── factory/      # Factories
│   │   ├── repository/   # Interfaces de repositório
│   │   └── value-object/ # Value Objects (Address)
│   └── product/          # Domínio de produtos
│       ├── entity/       # Entidades (Product)
│       ├── factory/      # Factories
│       └── repository/   # Interfaces de repositório
└── infrastructure/       # Camada de infraestrutura
    ├── customer/         # Implementação de repositórios (Sequelize)
    ├── order/            # Implementação de repositórios (Sequelize)
    └── product/          # Implementação de repositórios (Sequelize)
```

## Tecnologias Utilizadas

- **TypeScript**: Linguagem principal do projeto
- **Jest**: Framework de testes
- **SWC**: Compilador rápido para JavaScript/TypeScript
- **Sequelize**: ORM para gerenciamento de banco de dados
- **SQLite**: Banco de dados utilizado nos testes
- **UUID**: Geração de identificadores únicos

## Conceitos DDD Implementados

- **Entities**: Objetos com identidade única (Customer, Product, Order)
- **Value Objects**: Objetos sem identidade, definidos por seus atributos (Address)
- **Aggregates**: Agrupamento de entidades relacionadas
- **Repositories**: Abstração para persistência de dados
- **Factories**: Criação de objetos complexos
- **Domain Services**: Lógica de negócio que não pertence a uma entidade específica
- **Domain Events**: Eventos de domínio e Event Dispatcher

## Scripts Disponíveis

- `npm test` - Executa verificação de tipos e todos os testes
- `npm run tsc` - Compila o código TypeScript

## Observações

- O projeto utiliza SQLite em memória para os testes
- Os arquivos de teste possuem a extensão `.spec.ts`
- A configuração do Jest está em `jest.config.ts`
- A configuração do TypeScript está em `tsconfig.json`
