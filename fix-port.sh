#!/bin/bash

# Script para Corrigir Porta - Painel QR Brasil
# Uso: ./fix-port.sh

set -e

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

# Corrigir porta e redeploy
fix_port() {
    log "🔧 Corrigindo problema da porta..."
    
    # Parar containers
    log "Parando containers..."
    docker-compose down
    
    # Limpar imagens antigas
    log "Limpando imagens antigas..."
    docker system prune -f
    
    # Rebuild com correções
    log "Fazendo rebuild com correções..."
    docker-compose up -d --build --force-recreate
    
    log "✅ Redeploy concluído!"
    log "🌐 Aplicação agora deve estar na porta 3000"
    log "🔍 Health check: http://localhost:3000/api/health"
}

# Verificar status
check_status() {
    log "📊 Verificando status..."
    
    # Status dos containers
    docker-compose ps
    
    # Verificar portas
    log "🔍 Verificando portas..."
    netstat -tulpn | grep :3000 || echo "Porta 3000 não encontrada"
    netstat -tulpn | grep :3002 || echo "Porta 3002 não encontrada"
    
    # Testar health check
    log "🏥 Testando health check..."
    curl -f http://localhost:3000/api/health 2>/dev/null && echo "✅ Health check OK" || echo "❌ Health check falhou"
}

# Ver logs
show_logs() {
    log "📋 Exibindo logs..."
    docker-compose logs -f
}

# Mostrar ajuda
help() {
    echo "Script para Corrigir Porta - Painel QR Brasil"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  fix      - Corrigir porta e fazer redeploy"
    echo "  status   - Verificar status"
    echo "  logs     - Ver logs"
    echo "  help     - Mostrar esta ajuda"
    echo ""
    echo "Problema: Aplicação rodando na porta 3002 em vez de 3000"
    echo "Solução: Corrigir Dockerfile e fazer rebuild"
}

# Função principal
main() {
    case "${1:-help}" in
        fix)
            fix_port
            ;;
        status)
            check_status
            ;;
        logs)
            show_logs
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