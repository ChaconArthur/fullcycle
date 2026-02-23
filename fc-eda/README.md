# Desafio Full Cycle — Microsserviços com EDA e Kafka

Este projeto implementa dois microsserviços integrados via Apache Kafka, demonstrando os princípios de **Event-Driven Architecture (EDA)** e comunicação assíncrona entre serviços.

## Visão geral

```
┌─────────────────┐    POST /transactions    ┌──────────┐    topic: balances    ┌─────────────────┐
│   Client (HTTP) │ ────────────────────────▶│  Wallet  │ ─────────────────────▶│    Balance      │
│                 │                          │   Core   │                        │    Service      │
│                 │◀── GET /balances/{id} ───│  :8080   │                        │     :3003       │
└─────────────────┘                          └──────────┘                        └────────┬────────┘
                                                  │                                       │
                                             MySQL :3306                            MySQL :3307
                                             (wallet DB)                           (balances DB)
```

### Wallet Core (porta 8080)
Gerencia clientes, contas e transações financeiras. Ao criar uma transação, publica o evento `BalanceUpdated` no Kafka com os saldos atualizados de ambas as contas.

### Balance Service (porta 3003)
Consome o tópico `balances` do Kafka e persiste o estado atual dos saldos em seu próprio banco de dados. Expõe um endpoint HTTP para consulta de saldo por conta.

---

## Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados
- Portas disponíveis: `3003`, `3306`, `3307`, `8080`, `9021`, `9092`, `2181`

---

## Como executar

```bash
# Clone o repositório (se ainda não tiver feito)
git clone https://github.com/ChaconArthur/fullcycle.git
cd fullcycle/fc-eda

# Sobe todos os serviços
docker-compose up -d
```

O Docker Compose irá:
1. Subir dois bancos MySQL com schema e dados fictícios já populados automaticamente
2. Subir o Zookeeper e o Kafka broker
3. Compilar e iniciar o **Wallet Core**
4. Compilar e iniciar o **Balance Service**
5. Subir o Confluent Control Center (UI do Kafka) em `http://localhost:9021`

> **Aguarde ~60 segundos** após o `docker-compose up` para que todos os serviços fiquem prontos, especialmente o Kafka.

---

## Dados iniciais (seed)

Ao subir os serviços, os bancos são populados automaticamente com:

| Recurso    | ID           | Detalhe                         |
|------------|--------------|---------------------------------|
| Cliente    | `client-001` | Alice Johnson — alice@example.com |
| Cliente    | `client-002` | Bob Smith — bob@example.com     |
| Conta      | `account-001`| Vinculada a Alice — saldo R$ 1.000,00 |
| Conta      | `account-002`| Vinculada a Bob — saldo R$ 500,00 |

---

## Endpoints

### Wallet Core — `http://localhost:8080`

| Método | Rota            | Descrição                    |
|--------|-----------------|------------------------------|
| POST   | `/clients`      | Cria um novo cliente         |
| POST   | `/accounts`     | Cria uma conta para um cliente |
| POST   | `/transactions` | Realiza uma transferência    |

### Balance Service — `http://localhost:3003`

| Método | Rota                        | Descrição                         |
|--------|-----------------------------|-----------------------------------|
| GET    | `/balances/{account_id}`    | Retorna o saldo atualizado da conta |

---

## Exemplos de uso

O arquivo [`api/balance.http`](api/balance.http) contém todas as chamadas prontas para uso em ferramentas como [REST Client (VS Code)](https://marketplace.visualstudio.com/items?itemName=humao.rest-client), [Insomnia](https://insomnia.rest/) ou [HTTPie](https://httpie.io/).

### Consultando saldos iniciais

```bash
curl http://localhost:3003/balances/account-001
# {"account_id":"account-001","balance":1000}

curl http://localhost:3003/balances/account-002
# {"account_id":"account-002","balance":500}
```

### Criando uma transação (Alice envia R$ 100 para Bob)

```bash
curl -X POST http://localhost:8080/transactions \
  -H "Content-Type: application/json" \
  -d '{"account_id_from": "account-001", "account_id_to": "account-002", "amount": 100}'
```

Após a transação, o Wallet Core publica o evento no Kafka. O Balance Service consome e atualiza os saldos:

```bash
curl http://localhost:3003/balances/account-001
# {"account_id":"account-001","balance":900}

curl http://localhost:3003/balances/account-002
# {"account_id":"account-002","balance":600}
```

---

## Estrutura do projeto

```
fc-eda/
├── api/
│   ├── client.http          # Chamadas HTTP para o Wallet Core
│   └── balance.http         # Chamadas HTTP para o Balance Service
├── balance-service/
│   ├── cmd/
│   │   └── main.go          # Balance Service (Go)
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── cmd/walletcore/
│   └── main.go              # Wallet Core (Go)
├── internal/                # Domínio do Wallet Core
├── .docker/
│   ├── walletcore/
│   │   └── init.sql         # Schema e seed do banco wallet
│   └── balance/
│       └── init.sql         # Schema e seed do banco balances
├── Dockerfile.walletcore    # Build do Wallet Core
└── docker-compose.yaml      # Orquestração completa
```

---

## Fluxo do evento

```
POST /transactions
      │
      ▼
CreateTransactionUseCase
      │  publica
      ▼
Kafka topic: "balances"
      │
      │  mensagem JSON:
      │  {
      │    "Name": "BalanceUpdated",
      │    "Payload": {
      │      "account_id_from": "...",
      │      "account_id_to":   "...",
      │      "balance_account_id_from": 900.00,
      │      "balance_account_id_to":   600.00
      │    }
      │  }
      │
      ▼
Balance Service (consumer group: balance-service)
      │  upsert atômico via
      │  INSERT ... ON DUPLICATE KEY UPDATE
      ▼
MySQL balances
      │
      ▼
GET /balances/{account_id} → saldo atualizado
```

---

## Parando os serviços

```bash
docker-compose down
```

Para remover também os dados dos volumes:

```bash
docker-compose down -v
```
