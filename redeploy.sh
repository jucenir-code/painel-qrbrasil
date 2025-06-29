#!/bin/bash

# Script de Redeploy - Painel QR Brasil
# Uso: ./redeploy.sh [full|quick|logs|status]

set -e

PROJECT_NAME="painel-qrbrasil"
COMPOSE_FILE="docker-compose.yml"

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

# Redeploy completo (para e reconstrói tudo)
full() {
    log "🔄 Redeploy completo iniciado..."
    
    # Parar todos os containers
    log "Parando containers..."
    docker-compose -f $COMPOSE_FILE down
    
    # Limpar imagens antigas
    log "Limpando imagens antigas..."
    docker system prune -f
    
    # Rebuild completo
    log "Fazendo rebuild completo..."
    docker-compose -f $COMPOSE_FILE up -d --build --force-recreate
    
    log "✅ Redeploy completo concluído!"
    log "🌐 Acesse: http://$(curl -s ifconfig.me):3000"
    log "🔍 Health check: http://$(curl -s ifconfig.me):3000/api/health"
}

# Redeploy rápido (apenas reinicia)
quick() {
    log "⚡ Redeploy rápido iniciado..."
    
    # Restart dos containers
    log "Reiniciando containers..."
    docker-compose -f $COMPOSE_FILE restart
    
    log "✅ Redeploy rápido concluído!"
    log "🌐 Acesse: http://$(curl -s ifconfig.me):3000"
}

# Redeploy com pull (atualiza código)
update() {
    log "📥 Redeploy com atualização iniciado..."
    
    # Pull das mudanças (se usando git)
    if [ -d ".git" ]; then
        log "Atualizando código do repositório..."
        git pull origin main
    fi
    
    # Parar containers
    log "Parando containers..."
    docker-compose -f $COMPOSE_FILE down
    
    # Rebuild
    log "Fazendo rebuild..."
    docker-compose -f $COMPOSE_FILE up -d --build
    
    log "✅ Redeploy com atualização concluído!"
    log "🌐 Acesse: http://$(curl -s ifconfig.me):3000"
}

# Ver logs
logs() {
    log "📋 Exibindo logs..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# Ver status
status() {
    log "📊 Status dos containers:"
    docker-compose -f $COMPOSE_FILE ps
    
    log "📈 Uso de recursos:"
    docker stats --no-stream
    
    log "🔍 Health check:"
    curl -f http://localhost:3000/api/health 2>/dev/null && echo "✅ Aplicação saudável" || echo "❌ Aplicação com problemas"
}

# Rollback para versão anterior
rollback() {
    log "⏪ Iniciando rollback..."
    
    # Parar aplicação
    docker-compose -f $COMPOSE_FILE down
    
    # Voltar para commit anterior (se usando git)
    if [ -d ".git" ]; then
        log "Voltando para versão anterior..."
        git checkout HEAD~1
    fi
    
    # Redeploy
    docker-compose -f $COMPOSE_FILE up -d --build
    
    log "✅ Rollback concluído!"
    log "🌐 Acesse: http://$(curl -s ifconfig.me):3000"
}

# Limpar tudo
clean() {
    log "🧹 Limpeza completa iniciada..."
    
    # Parar e remover containers
    docker-compose -f $COMPOSE_FILE down -v
    
    # Remover imagens
    docker rmi $(docker images -q painel-qrbrasil*) 2>/dev/null || true
    
    # Limpar cache
    docker system prune -f
    
    log "✅ Limpeza concluída!"
}

# Mostrar ajuda
help() {
    echo "Script de Redeploy - Painel QR Brasil"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  full      - Redeploy completo (para tudo e reconstrói)"
    echo "  quick     - Redeploy rápido (apenas reinicia)"
    echo "  update    - Redeploy com atualização do código"
    echo "  rollback  - Voltar para versão anterior"
    echo "  logs      - Ver logs em tempo real"
    echo "  status    - Ver status dos containers"
    echo "  clean     - Limpar tudo (containers, imagens, cache)"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 full     # Redeploy completo"
    echo "  $0 quick    # Redeploy rápido"
    echo "  $0 update   # Atualizar e redeploy"
    echo "  $0 logs     # Ver logs"
}

# Função principal
main() {
    case "${1:-help}" in
        full)
            full
            ;;
        quick)
            quick
            ;;
        update)
            update
            ;;
        rollback)
            rollback
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        clean)
            clean
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