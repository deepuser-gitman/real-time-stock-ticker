FROM node:20.9.0-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN command npm install

COPY index.js ./
COPY routes ./routes
COPY models ./models
COPY controllers ./controllers

ENTRYPOINT [ "npm", "start" ]