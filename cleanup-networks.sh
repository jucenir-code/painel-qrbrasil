#!/bin/bash

echo "🧹 Limpando redes Docker conflitantes..."

# Parar e remover containers relacionados
docker stop painel-qrbrasil 2>/dev/null || true
docker rm painel-qrbrasil 2>/dev/null || true

# Remover redes conflitantes
docker network rm painel-qrbrasil_painel-network 2>/dev/null || true
docker network rm painel-network 2>/dev/null || true

# Limpar redes não utilizadas
docker network prune -f

echo "✅ Limpeza concluída!"
echo "🔄 Agora você pode fazer o deploy novamente no Portainer" 