FROM node:18-alpine

WORKDIR /app

# Copia los package.json y package-lock.json (ajusta si no usas package-lock.json)
COPY auth-service/package*.json ./

RUN npm install

# Copia el código fuente
COPY auth-service/src ./src

# Copia la carpeta shared completa o solo los archivos que necesites
COPY shared ./shared

CMD ["node", "src/index.js"]

