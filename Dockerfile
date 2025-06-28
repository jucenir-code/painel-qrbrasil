# Dockerfile para Next.js
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Copia o .env se existir
COPY env.example .env

# Se usar Prisma, gere o client antes do build
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"] 