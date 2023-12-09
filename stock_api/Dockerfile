FROM node:20.9.0-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN command npm install

COPY .env ./
COPY index.js ./

ENTRYPOINT [ "npm", "start" ]