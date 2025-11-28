FROM node:18-alpine

# Instalação do dockerize e dependências de build
RUN apk add --no-cache curl     && curl -L https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz | tar xz     && mv dockerize /usr/local/bin

WORKDIR /usr/src/app

COPY app/package.json ./

RUN npm install

CMD [ "npm", "start" ]
