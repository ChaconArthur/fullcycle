# STAGE 1: COMPILAÇÃO
FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY main.go .

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o /app/fullcycle -ldflags='-s -w' ./main.go

# ----------------------------------------------------

# STAGE 2: IMAGEM FINAL DE PRODUÇÃO
FROM scratch

COPY --from=builder /app/fullcycle /fullcycle

ENTRYPOINT ["/fullcycle"]