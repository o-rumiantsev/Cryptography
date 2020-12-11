FROM node:latest

WORKDIR /app

COPY ./public public/
COPY ./src src/
COPY ./keys keys/
COPY ./data data/
COPY ./app.js app.js
COPY ./encryption-schema.yml encryption-schema.yml
COPY ./package.json package.json

RUN npm install

CMD ["node", "app.js"]
