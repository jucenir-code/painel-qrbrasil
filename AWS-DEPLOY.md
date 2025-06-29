# 🚀 Deploy na AWS VPS - Painel QR Brasil

## 📋 Pré-requisitos

- VPS AWS (EC2) com Ubuntu 20.04+ ou Amazon Linux 2
- Acesso SSH à VPS
- Domínio configurado (opcional, para SSL)
- Porta 80, 443 e 3000 liberadas no Security Group

## 🎯 Deploy Rápido (3 Passos)

### 1. Conectar na VPS
```bash
ssh -i sua-chave.pem ubuntu@seu-ip-aws
```

### 2. Upload do Projeto
```bash
# Opção A: Git Clone
git clone <seu-repositorio>
cd painel-qrbrasil

# Opção B: Upload via SCP
scp -r -i sua-chave.pem ./painel-qrbrasil ubuntu@seu-ip-aws:~/
ssh -i sua-chave.pem ubuntu@seu-ip-aws
cd painel-qrbrasil
```

### 3. Deploy Automatizado
```bash
# Tornar script executável
chmod +x aws-deploy.sh

# Setup inicial (primeira vez)
./aws-deploy.sh setup

# Deploy da aplicação
./aws-deploy.sh deploy
```

## 🔧 Configurações AWS

### Security Group
Configure o Security Group da sua EC2:

| Porta | Protocolo | Origem | Descrição |
|-------|-----------|--------|-----------|
| 22 | SSH | 0.0.0.0/0 | SSH |
| 80 | HTTP | 0.0.0.0/0 | HTTP |
| 443 | HTTPS | 0.0.0.0/0 | HTTPS |
| 3000 | TCP | 0.0.0.0/0 | Aplicação |
| 9443 | HTTPS | 0.0.0.0/0 | Portainer (opcional) |

### Configuração de Domínio (Opcional)
1. Configure DNS para apontar para o IP da VPS
2. Execute: `./aws-deploy.sh ssl`

## 📁 Estrutura de Arquivos

```
painel-qrbrasil/
├── Dockerfile                 # Configuração do container
├── docker-compose.yml         # Deploy completo com Nginx
├── portainer-stack.yml        # Stack para Portainer
├── nginx.conf                 # Configuração do proxy reverso
├── aws-deploy.sh              # Script de deploy AWS
├── AWS-DEPLOY.md              # Este guia
└── src/                       # Código da aplicação
```

## 🛠️ Comandos do Script

### Setup Inicial
```bash
./aws-deploy.sh setup
```
- Instala Docker e Docker Compose
- Configura firewall
- Instala Portainer (opcional)
- Atualiza sistema

### Deploy da Aplicação
```bash
./aws-deploy.sh deploy
```
- Para containers existentes
- Faz build da aplicação
- Inicia containers
- Mostra URLs de acesso

### Configurar SSL
```bash
./aws-deploy.sh ssl
```
- Instala Certbot
- Obtém certificado Let's Encrypt
- Configura renovação automática

### Monitoramento
```bash
./aws-deploy.sh monitor
```
- Status dos containers
- Uso de recursos
- Logs recentes

### Backup
```bash
./aws-deploy.sh backup
```
- Backup do código
- Backup dos volumes
- Salva em `/backup/painel-qrbrasil/`

## 🌐 URLs de Acesso

Após o deploy:

- **Aplicação**: `http://seu-ip-aws:3000`
- **Health Check**: `http://seu-ip-aws:3000/api/health`
- **Portainer**: `https://seu-ip-aws:9443` (se instalado)
- **Com SSL**: `https://seu-dominio.com`

## 🔒 Segurança

### Firewall (UFW)
```bash
# Verificar status
sudo ufw status

# Regras configuradas automaticamente:
# - SSH (22)
# - HTTP (80)
# - HTTPS (443)
# - Aplicação (3000)
```

### SSL/HTTPS
- Certificado gratuito via Let's Encrypt
- Renovação automática
- Redirecionamento HTTP → HTTPS

### Variáveis de Ambiente
```env
NODE_ENV=production
JWT_SECRET=fvbsCq72kHnKWb1JpM5zgGS0wMN
```

## 📊 Monitoramento

### Logs
```bash
# Logs da aplicação
docker-compose logs -f painel-qrbrasil

# Logs do Nginx
docker-compose logs -f nginx

# Logs de todos os serviços
docker-compose logs -f
```

### Status
```bash
# Status dos containers
docker-compose ps

# Uso de recursos
docker stats

# Monitoramento via script
./aws-deploy.sh monitor
```

## 🔄 Atualizações

### Deploy de Nova Versão
```bash
# Pull das mudanças
git pull origin main

# Deploy
./aws-deploy.sh deploy
```

### Rollback
```bash
# Parar aplicação
docker-compose down

# Voltar para versão anterior
git checkout <commit-anterior>

# Deploy
./aws-deploy.sh deploy
```

## 🆘 Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs painel-qrbrasil

# Verificar status
docker-compose ps

# Rebuild
docker-compose up -d --build
```

### Erro de porta
```bash
# Verificar portas em uso
sudo netstat -tulpn | grep :3000

# Parar processo conflitante
sudo kill -9 <PID>
```

### Problemas de SSL
```bash
# Verificar certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Verificar logs do Nginx
docker-compose logs nginx
```

### Problemas de memória
```bash
# Verificar uso de memória
free -h

# Limpar cache Docker
docker system prune -f

# Reiniciar Docker
sudo systemctl restart docker
```

## 💰 Otimizações de Custo

### Instância EC2
- **t3.micro**: Para desenvolvimento/teste
- **t3.small**: Para produção com baixo tráfego
- **t3.medium**: Para produção com tráfego moderado

### Storage
- Use EBS gp3 para melhor performance/custo
- Configure snapshots automáticos
- Use S3 para backups

### Monitoramento
- Configure CloudWatch para alertas
- Use logs centralizados
- Configure auto-scaling se necessário

## 📞 Suporte

### Comandos Úteis
```bash
# Reiniciar aplicação
docker-compose restart

# Parar tudo
docker-compose down

# Verificar recursos
htop

# Verificar espaço em disco
df -h

# Verificar logs do sistema
sudo journalctl -f
```

### Contatos
- **Logs da aplicação**: `docker-compose logs -f`
- **Status do sistema**: `./aws-deploy.sh monitor`
- **Backup**: `./aws-deploy.sh backup`

---

**🎯 Deploy na AWS concluído!** Acesse `http://seu-ip-aws:3000` para verificar. 