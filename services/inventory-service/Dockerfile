FROM node:18-alpine

WORKDIR /app

COPY inventory-service/package*.json ./

RUN npm install

COPY inventory-service/src ./src

COPY shared ./shared

CMD ["node", "src/index.js"]
