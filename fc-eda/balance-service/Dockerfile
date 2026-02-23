FROM golang:1.21-alpine

WORKDIR /app

# kafka-go is pure Go – no CGO needed
COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o balance-service ./cmd/

CMD ["./balance-service"]
