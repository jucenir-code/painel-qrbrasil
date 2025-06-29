# Deploy no Portainer - Painel QR Brasil

## Pré-requisitos

1. Portainer instalado e configurado
2. Docker e Docker Compose instalados no servidor
3. Acesso SSH ao servidor (se necessário)

## Passos para Deploy

### 1. Preparar o Projeto

1. Faça upload do projeto para o servidor ou clone do repositório
2. Navegue até a pasta do projeto:
   ```bash
   cd painel-qrbrasil
   ```

### 2. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e configure:
   ```env
   JWT_SECRET=sua_chave_secreta_muito_segura_aqui
   NODE_ENV=production
   ```

### 3. Deploy via Portainer

#### Opção A: Usando Docker Compose (Recomendado)

1. Acesse o Portainer
2. Vá para "Stacks"
3. Clique em "Add stack"
4. Configure:
   - **Name**: `painel-qrbrasil`
   - **Build method**: `Web editor`
   - Cole o conteúdo do arquivo `docker-compose.yml`
5. Clique em "Deploy the stack"

#### Opção B: Usando Container Individual

1. Acesse o Portainer
2. Vá para "Containers"
3. Clique em "Add container"
4. Configure:
   - **Name**: `painel-qrbrasil`
   - **Image**: `painel-qrbrasil:latest` (após build)
   - **Ports**: `3000:3000`
   - **Environment variables**:
     - `NODE_ENV=production`
     - `JWT_SECRET=sua_chave_secreta`

### 4. Build da Imagem (se necessário)

Se você precisar fazer o build da imagem:

1. No Portainer, vá para "Images"
2. Clique em "Build a new image"
3. Configure:
   - **Name**: `painel-qrbrasil:latest`
   - **Platform**: `linux/amd64` (ou sua arquitetura)
   - **Dockerfile**: Selecione o arquivo `Dockerfile`
   - **Context**: Selecione a pasta do projeto

### 5. Verificar o Deploy

1. Acesse `http://seu-servidor:3000` para verificar se a aplicação está funcionando
2. Teste o endpoint de health: `http://seu-servidor:3000/api/health`

### 6. Configurar Proxy Reverso (Opcional)

Se você quiser usar o Nginx como proxy reverso:

1. Certifique-se de que o serviço `nginx` está incluído no `docker-compose.yml`
2. Configure certificados SSL se necessário
3. Acesse a aplicação pela porta 80 ou 443

## Configurações Avançadas

### SSL/HTTPS

1. Obtenha certificados SSL (Let's Encrypt, etc.)
2. Coloque os certificados na pasta `ssl/`
3. Descomente as linhas SSL no `nginx.conf`
4. Reinicie o container do Nginx

### Backup

Para fazer backup da aplicação:

```bash
# Backup dos volumes (se houver)
docker run --rm -v painel-qrbrasil_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Backup do código
tar czf painel-qrbrasil-backup-$(date +%Y%m%d).tar.gz --exclude=node_modules --exclude=.next .
```

### Monitoramento

1. Configure logs no Portainer
2. Use o endpoint `/api/health` para health checks
3. Configure alertas para downtime

## Troubleshooting

### Container não inicia

1. Verifique os logs: `docker logs painel-qrbrasil`
2. Verifique se as variáveis de ambiente estão corretas
3. Verifique se a porta 3000 está disponível

### Erro de build

1. Verifique se o Dockerfile está correto
2. Verifique se todas as dependências estão no `package.json`
3. Verifique se o `.dockerignore` não está excluindo arquivos necessários

### Problemas de conectividade

1. Verifique se as portas estão mapeadas corretamente
2. Verifique se o firewall está configurado
3. Verifique se a rede Docker está funcionando

## Comandos Úteis

```bash
# Ver logs do container
docker logs painel-qrbrasil

# Reiniciar container
docker restart painel-qrbrasil

# Parar e remover container
docker stop painel-qrbrasil && docker rm painel-qrbrasil

# Ver status dos containers
docker ps -a

# Acessar shell do container
docker exec -it painel-qrbrasil sh
```

## Suporte

Para problemas específicos, verifique:
1. Logs do container no Portainer
2. Logs do Docker: `docker logs painel-qrbrasil`
3. Status do sistema: `docker system df`
4. Uso de recursos: `docker stats` 