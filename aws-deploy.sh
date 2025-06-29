#!/bin/bash

# Script de Deploy para AWS VPS - Painel QR Brasil
# Uso: ./aws-deploy.sh [setup|deploy|ssl|monitor|backup]

set -e

PROJECT_NAME="painel-qrbrasil"
COMPOSE_FILE="docker-compose.yml"
DOMAIN="painel.qrbrasil.com.br"  # Altere para seu domínio

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERRO] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[AVISO] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Setup inicial da VPS
setup() {
    log "🚀 Configurando VPS AWS para deploy..."
    
    # Atualizar sistema
    log "Atualizando sistema..."
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependências
    log "Instalando dependências..."
    sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    # Instalar Docker
    log "Instalando Docker..."
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    # Instalar Docker Compose
    log "Instalando Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Instalar Portainer (opcional)
    read -p "Deseja instalar o Portainer? (y/n): " install_portainer
    if [[ $install_portainer == "y" ]]; then
        log "Instalando Portainer..."
        docker volume create portainer_data
        docker run -d -p 8000:8000 -p 9443:9443 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce:latest
        log "Portainer instalado! Acesse: https://$(curl -s ifconfig.me):9443"
    fi
    
    # Configurar firewall
    log "Configurando firewall..."
    sudo ufw allow ssh
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 3000
    sudo ufw --force enable
    
    log "✅ Setup da VPS concluído!"
    log "🔄 Reinicie a sessão SSH para aplicar as mudanças do grupo Docker"
}

# Deploy da aplicação
deploy() {
    log "🚀 Fazendo deploy da aplicação..."
    
    # Parar containers existentes
    docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    # Build e start
    docker-compose -f $COMPOSE_FILE up -d --build
    
    log "✅ Deploy concluído!"
    log "🌐 Acesse: http://$(curl -s ifconfig.me):3000"
    log "🔍 Health check: http://$(curl -s ifconfig.me):3000/api/health"
}

# Configurar SSL com Let's Encrypt
ssl() {
    log "🔒 Configurando SSL com Let's Encrypt..."
    
    # Instalar Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Obter certificado
    log "Obtendo certificado SSL..."
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Configurar renovação automática
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log "✅ SSL configurado!"
    log "🔒 Acesse: https://$DOMAIN"
}

# Monitoramento
monitor() {
    log "📊 Status dos containers:"
    docker-compose -f $COMPOSE_FILE ps
    
    log "📈 Uso de recursos:"
    docker stats --no-stream
    
    log "📋 Logs recentes:"
    docker-compose -f $COMPOSE_FILE logs --tail=20
}

# Backup
backup() {
    log "💾 Criando backup..."
    
    BACKUP_DIR="/backup/painel-qrbrasil"
    BACKUP_FILE="painel-qrbrasil-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    sudo mkdir -p $BACKUP_DIR
    
    # Backup do código
    tar czf $BACKUP_DIR/$BACKUP_FILE --exclude=node_modules --exclude=.next --exclude=.git .
    
    # Backup dos volumes (se houver)
    docker run --rm -v painel-qrbrasil_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/volumes-$BACKUP_FILE -C /data .
    
    log "✅ Backup criado: $BACKUP_DIR/$BACKUP_FILE"
}

# Mostrar ajuda
help() {
    echo "Script de Deploy para AWS VPS - Painel QR Brasil"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  setup     - Configurar VPS AWS (primeira vez)"
    echo "  deploy    - Fazer deploy da aplicação"
    echo "  ssl       - Configurar SSL com Let's Encrypt"
    echo "  monitor   - Monitorar aplicação"
    echo "  backup    - Criar backup"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 setup"
    echo "  $0 deploy"
    echo "  $0 ssl"
}

# Função principal
main() {
    case "${1:-help}" in
        setup)
            setup
            ;;
        deploy)
            deploy
            ;;
        ssl)
            ssl
            ;;
        monitor)
            monitor
            ;;
        backup)
            backup
            ;;
        help|--help|-h)
            help
            ;;
        *)
            error "Comando inválido: $1"
            help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@" 