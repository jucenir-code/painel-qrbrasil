# Dockerfile para produção Next.js Standalone
FROM node:18-alpine AS builder

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

# ---
# Imagem final
FROM node:18-alpine AS runner
WORKDIR /app

# Copiar build standalone e estáticos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"] 