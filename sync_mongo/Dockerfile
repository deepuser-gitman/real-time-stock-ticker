FROM node:20.9.0-alpine3.18

WORKDIR /app

COPY package*.json ./
RUN command npm install

COPY models/ ./models
COPY mongo_*.js ./

ENTRYPOINT [ "npm", "start" ]