FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

RUN npm install

# Copiar código fuente
COPY src ./src

CMD ["node", "src/index.js"]