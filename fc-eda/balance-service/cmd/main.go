package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-chi/chi/v5"
	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	kafkago "github.com/segmentio/kafka-go"
)

// KafkaEvent matches the JSON envelope published by wallet core's EventDispatcher.
// Field names use PascalCase to match the Go struct serialization from the upstream producer.
type KafkaEvent struct {
	Name    string          `json:"Name"`
	Payload json.RawMessage `json:"Payload"`
}

// BalancePayload matches wallet core's BalanceUpdatedOutputDTO.
type BalancePayload struct {
	AccountIDFrom        string  `json:"account_id_from"`
	AccountIDTo          string  `json:"account_id_to"`
	BalanceAccountIDFrom float64 `json:"balance_account_id_from"`
	BalanceAccountIDTo   float64 `json:"balance_account_id_to"`
}

type BalanceResponse struct {
	AccountID string  `json:"account_id"`
	Balance   float64 `json:"balance"`
}

func main() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
		getEnv("DB_USER", "root"),
		getEnv("DB_PASSWORD", "root"),
		getEnv("DB_HOST", "mysql_balance"),
		getEnv("DB_PORT", "3306"),
		getEnv("DB_NAME", "balances"),
	)

	// Open once; connection pooling is handled internally by sql.DB.
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("sql.Open failed: %v", err)
	}
	defer db.Close()

	connected := false
	for i := 0; i < 30; i++ {
		if pingErr := db.Ping(); pingErr == nil {
			log.Println("Connected to MySQL")
			connected = true
			break
		}
		log.Printf("Waiting for MySQL... attempt %d/30", i+1)
		time.Sleep(2 * time.Second)
	}
	if !connected {
		log.Fatal("Could not connect to MySQL after 30 attempts")
	}

	go consumeKafka(db)

	r := chi.NewRouter()
	r.Get("/balances/{account_id}", getBalanceHandler(db))

	log.Println("Balance service running on :3003")
	if err := http.ListenAndServe(":3003", r); err != nil {
		log.Fatal(err)
	}
}

func consumeKafka(db *sql.DB) {
	broker := getEnv("KAFKA_BOOTSTRAP_SERVERS", "kafka:29092")

	kafkaReachable := false
	for i := 0; i < 40; i++ {
		conn, err := kafkago.Dial("tcp", broker)
		if err == nil {
			conn.Close()
			log.Println("Kafka is reachable")
			kafkaReachable = true
			break
		}
		log.Printf("Waiting for Kafka... attempt %d/40: %v", i+1, err)
		time.Sleep(3 * time.Second)
	}
	if !kafkaReachable {
		log.Fatal("Could not reach Kafka broker after 40 attempts")
	}

	reader := kafkago.NewReader(kafkago.ReaderConfig{
		Brokers:     []string{broker},
		Topic:       "balances",
		GroupID:     "balance-service",
		MinBytes:    1,
		MaxBytes:    10e6,
		StartOffset: kafkago.FirstOffset,
		MaxWait:     2 * time.Second,
	})

	log.Println("Kafka consumer started on topic 'balances'")

	for {
		msg, err := reader.ReadMessage(context.Background())
		if err != nil {
			log.Printf("Kafka read error: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		var event KafkaEvent
		if err := json.Unmarshal(msg.Value, &event); err != nil {
			log.Printf("Error unmarshaling event envelope: %v", err)
			continue
		}

		if event.Name != "BalanceUpdated" {
			log.Printf("Skipping unknown event: %q", event.Name)
			continue
		}

		var payload BalancePayload
		if err := json.Unmarshal(event.Payload, &payload); err != nil {
			log.Printf("Error unmarshaling BalancePayload: %v", err)
			continue
		}

		log.Printf("BalanceUpdated: from=%s (%.2f) -> to=%s (%.2f)",
			payload.AccountIDFrom, payload.BalanceAccountIDFrom,
			payload.AccountIDTo, payload.BalanceAccountIDTo)

		now := time.Now()
		if err := upsertBalance(db, payload.AccountIDFrom, payload.BalanceAccountIDFrom, now); err != nil {
			log.Printf("Error upserting balance for %s: %v", payload.AccountIDFrom, err)
		}
		if err := upsertBalance(db, payload.AccountIDTo, payload.BalanceAccountIDTo, now); err != nil {
			log.Printf("Error upserting balance for %s: %v", payload.AccountIDTo, err)
		}
	}
}

// upsertBalance inserts or updates a balance atomically using a single SQL statement.
// Relies on the UNIQUE index on account_id defined in the schema.
func upsertBalance(db *sql.DB, accountID string, balance float64, now time.Time) error {
	_, err := db.Exec(`
		INSERT INTO balances (id, account_id, balance, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE balance = VALUES(balance), updated_at = VALUES(updated_at)
	`, uuid.New().String(), accountID, balance, now, now)
	return err
}

func getBalanceHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		accountID := chi.URLParam(r, "account_id")

		var resp BalanceResponse
		err := db.QueryRow(
			"SELECT account_id, balance FROM balances WHERE account_id = ?",
			accountID,
		).Scan(&resp.AccountID, &resp.Balance)

		w.Header().Set("Content-Type", "application/json")

		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "account not found"})
			return
		}
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "internal server error"})
			return
		}

		json.NewEncoder(w).Encode(resp)
	}
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
