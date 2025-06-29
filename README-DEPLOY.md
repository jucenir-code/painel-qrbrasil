# 🚀 Deploy Rápido - Painel QR Brasil

## ⚡ Deploy em 3 Passos

### 1. Preparar o Projeto
```bash
# Clone ou faça upload do projeto
git clone <seu-repositorio>
cd painel-qrbrasil

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 2. Deploy via Portainer

#### Opção A: Stack Simplificada (Recomendado)
1. Acesse o Portainer
2. Vá para **Stacks** → **Add stack**
3. **Name**: `painel-qrbrasil`
4. **Build method**: `Web editor`
5. Cole o conteúdo do arquivo `portainer-stack-simple.yml`
6. Clique em **Deploy the stack**

#### Opção B: Container Individual
1. Acesse o Portainer
2. Vá para **Containers** → **Add container**
3. Configure:
   - **Name**: `painel-qrbrasil`
   - **Image**: `painel-qrbrasil:latest`
   - **Ports**: `3000:3000`
   - **Environment variables**:
     - `NODE_ENV=production`
     - `JWT_SECRET=fvbsCq72kHnKWb1JpM5zgGS0wMN`

### 3. Verificar Deploy
- Acesse: `http://seu-servidor:3000`
- Health check: `http://seu-servidor:3000/api/health`

## 🔧 Solução de Problemas

### Conflito de Rede Docker
Se você encontrar erro de rede conflitante:

1. **Via Portainer:**
   - Vá para **Networks**
   - Remova as redes `painel-qrbrasil_painel-network` e `painel-network`
   - Tente o deploy novamente

2. **Via Script (Linux/Mac):**
   ```bash
   ./cleanup-networks.sh
   ```

3. **Via Comandos Docker:**
   ```bash
   docker network rm painel-qrbrasil_painel-network
   docker network rm painel-network
   docker network prune -f
   ```

## 📁 Arquivos de Deploy

| Arquivo | Descrição |
|---------|-----------|
| `Dockerfile` | Configuração do container |
| `portainer-stack-simple.yml` | Stack ultra-simplificada |
| `portainer-stack.yml` | Stack com health check |
| `docker-compose.yml` | Deploy completo com Nginx |
| `nginx.conf` | Configuração do proxy reverso |
| `deploy.sh` | Script automatizado |
| `cleanup-networks.sh` | Limpeza de redes conflitantes |
| `DEPLOY.md` | Instruções detalhadas |

## 🔧 Configurações Rápidas

### Variáveis de Ambiente (.env)
```env
JWT_SECRET=fvbsCq72kHnKWb1JpM5zgGS0wMN
NODE_ENV=production
PORT=3000
```

### Script de Deploy
```bash
# Tornar executável
chmod +x deploy.sh

# Comandos disponíveis
./deploy.sh build    # Build da aplicação
./deploy.sh start    # Iniciar aplicação
./deploy.sh stop     # Parar aplicação
./deploy.sh restart  # Reiniciar aplicação
./deploy.sh logs     # Ver logs
./deploy.sh status   # Status dos containers
```

## 🌐 Configuração de Domínio

### Com Traefik (Recomendado)
O arquivo `portainer-stack.yml` já inclui labels para Traefik:
- Domínio: `painel.qrbrasil.com`
- Porta: `80` (HTTP)

### Com Nginx
Use o arquivo `docker-compose.yml` que inclui Nginx como proxy reverso.

## 📊 Monitoramento

### Health Check
- Endpoint: `/api/health`
- Verifica status da aplicação
- Usado pelo Docker para health checks

### Logs
```bash
# Via Portainer
Containers → painel-qrbrasil → Logs

# Via CLI
docker logs painel-qrbrasil
```

## 🔒 Segurança

### SSL/HTTPS
1. Configure certificados SSL
2. Ative HTTPS no Nginx/Traefik
3. Redirecione HTTP para HTTPS

### Firewall
```bash
# Abrir porta 3000 (se necessário)
sudo ufw allow 3000
```

## 🆘 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker logs painel-qrbrasil

# Verificar status
docker ps -a

# Verificar recursos
docker stats
```

### Erro de build
```bash
# Limpar cache
docker system prune -f

# Rebuild sem cache
docker-compose build --no-cache
```

### Problemas de conectividade
1. Verificar se a porta 3000 está livre
2. Verificar firewall
3. Verificar rede Docker

## 📞 Suporte

- **Logs**: `docker logs painel-qrbrasil`
- **Status**: `docker ps -a`
- **Recursos**: `docker stats`
- **Documentação**: `DEPLOY.md`

---

**🎯 Deploy realizado com sucesso!** Acesse `http://seu-servidor:3000` para verificar. 