# Dockerfile para produção Next.js
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Comando para iniciar (correto para standalone)
CMD ["node", ".next/standalone/server.js"] 