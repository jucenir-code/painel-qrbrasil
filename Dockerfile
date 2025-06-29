# Dockerfile para produção
FROM node:18-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
# Verificar https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine para entender por que libc6-compat pode ser necessário.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências baseadas no arquivo package-lock.json preferido
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Reconstruir o código fonte quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Próxima etapa reutiliza a cache da camada anterior quando possível
# https://nextjs.org/docs/advanced-features/output-file-tracing
RUN npm run build

# Imagem de produção, copiar todos os arquivos e executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Descomente a linha abaixo se você não quiser usar o usuário root
# https://nextjs.org/docs/advanced-features/output-file-tracing#caveats
# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Definir a variável de ambiente correta para o arquivo de rastreamento
# https://nextjs.org/docs/advanced-features/output-file-tracing#caveats

# Copiar automaticamente o arquivo de rastreamento gerado
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

# server.js é criado pelo next build usando a configuração standalone
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"] 