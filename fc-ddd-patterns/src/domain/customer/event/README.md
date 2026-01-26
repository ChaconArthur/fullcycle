# Customer Domain Events

Este diretório contém a implementação de Domain Events para o agregado Customer, seguindo os princípios de Domain-Driven Design (DDD).

## Eventos Implementados

### 1. CustomerCreatedEvent

Disparado quando um novo Customer é criado.

**Handlers:**
- `EnviaConsoleLog1Handler`: Exibe a mensagem "Esse é o primeiro console.log do evento: CustomerCreated"
- `EnviaConsoleLog2Handler`: Exibe a mensagem "Esse é o segundo console.log do evento: CustomerCreated"

### 2. CustomerAddressChangedEvent

Disparado quando o endereço do Customer é alterado através do método `changeAddress()`.

**Handler:**
- `EnviaConsoleLogHandler`: Exibe a mensagem "Endereço do cliente: {id}, {nome} alterado para: {endereco}"

## Exemplo de Uso

```typescript
import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import CustomerCreatedEvent from "./customer-created.event";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import EnviaConsoleLog1Handler from "./handler/envia-console-log-1.handler";
import EnviaConsoleLog2Handler from "./handler/envia-console-log-2.handler";
import EnviaConsoleLogHandler from "./handler/envia-console-log.handler";

// Criar o dispatcher
const eventDispatcher = new EventDispatcher();

// Registrar handlers para CustomerCreated
const createHandler1 = new EnviaConsoleLog1Handler();
const createHandler2 = new EnviaConsoleLog2Handler();
eventDispatcher.register("CustomerCreatedEvent", createHandler1);
eventDispatcher.register("CustomerCreatedEvent", createHandler2);

// Registrar handler para CustomerAddressChanged
const addressHandler = new EnviaConsoleLogHandler();
eventDispatcher.register("CustomerAddressChangedEvent", addressHandler);

// Criar um novo customer e disparar evento
const customer = new Customer("1", "John Doe");
const customerCreatedEvent = new CustomerCreatedEvent({
  id: customer.id,
  name: customer.name,
});
eventDispatcher.notify(customerCreatedEvent);

// Output:
// Esse é o primeiro console.log do evento: CustomerCreated
// Esse é o segundo console.log do evento: CustomerCreated

// Alterar endereço e disparar evento
const address = new Address("Main Street", 100, "12345", "New York");
customer.changeAddress(address);

const addressChangedEvent = new CustomerAddressChangedEvent({
  id: customer.id,
  name: customer.name,
  address: address.toString(),
});
eventDispatcher.notify(addressChangedEvent);

// Output:
// Endereço do cliente: 1, John Doe alterado para: Main Street, 100, 12345 New York
```

## Estrutura de Arquivos

```
event/
├── customer-created.event.ts                    # Evento de criação de customer
├── customer-created.event.spec.ts               # Testes do evento de criação
├── customer-address-changed.event.ts            # Evento de mudança de endereço
├── customer-address-changed.event.spec.ts       # Testes do evento de mudança
├── customer-events-integration.spec.ts          # Testes de integração
├── README.md                                     # Esta documentação
└── handler/
    ├── envia-console-log-1.handler.ts           # Handler 1 para CustomerCreated
    ├── envia-console-log-2.handler.ts           # Handler 2 para CustomerCreated
    └── envia-console-log.handler.ts             # Handler para CustomerAddressChanged
```

## Executar os Testes

Para executar todos os testes de eventos do Customer:

```bash
npm test -- customer-created.event.spec.ts
npm test -- customer-address-changed.event.spec.ts
npm test -- customer-events-integration.spec.ts
```

Ou executar todos os testes do projeto:

```bash
npm test
```

## Conceitos DDD Aplicados

- **Domain Events**: Representam algo que aconteceu no domínio
- **Event Handlers**: Reagem aos eventos do domínio
- **Event Dispatcher**: Gerencia o registro e notificação de eventos
- **Separation of Concerns**: Cada handler tem uma responsabilidade específica
