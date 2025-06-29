#!/bin/bash

# Script de Deploy para Painel QR Brasil
# Uso: ./deploy.sh [build|start|stop|restart|logs|status]

set -e

PROJECT_NAME="painel-qrbrasil"
COMPOSE_FILE="docker-compose.yml"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker não está instalado. Instale o Docker primeiro."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose não está instalado. Instale o Docker Compose primeiro."
        exit 1
    fi
}

# Verificar se arquivo .env existe
check_env() {
    if [ ! -f .env ]; then
        warning "Arquivo .env não encontrado. Criando arquivo .env.example..."
        cat > .env << EOF
# Configurações do JWT
JWT_SECRET=sua_chave_secreta_muito_segura_aqui

# Configurações do ambiente
NODE_ENV=production

# Configurações de porta (opcional)
PORT=3000
EOF
        warning "Arquivo .env criado. Edite-o com suas configurações antes de continuar."
        exit 1
    fi
}

# Build da aplicação
build() {
    log "Iniciando build da aplicação..."
    docker-compose -f $COMPOSE_FILE build --no-cache
    log "Build concluído com sucesso!"
}

# Iniciar aplicação
start() {
    log "Iniciando aplicação..."
    docker-compose -f $COMPOSE_FILE up -d
    log "Aplicação iniciada com sucesso!"
    log "Acesse: http://localhost:3000"
    log "Health check: http://localhost:3000/api/health"
}

# Parar aplicação
stop() {
    log "Parando aplicação..."
    docker-compose -f $COMPOSE_FILE down
    log "Aplicação parada com sucesso!"
}

# Reiniciar aplicação
restart() {
    log "Reiniciando aplicação..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up -d
    log "Aplicação reiniciada com sucesso!"
}

# Ver logs
logs() {
    log "Exibindo logs da aplicação..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# Status dos containers
status() {
    log "Status dos containers:"
    docker-compose -f $COMPOSE_FILE ps
}

# Limpar recursos não utilizados
cleanup() {
    log "Limpando recursos Docker não utilizados..."
    docker system prune -f
    log "Limpeza concluída!"
}

# Backup
backup() {
    log "Criando backup da aplicação..."
    BACKUP_FILE="painel-qrbrasil-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar czf $BACKUP_FILE --exclude=node_modules --exclude=.next --exclude=.git .
    log "Backup criado: $BACKUP_FILE"
}

# Mostrar ajuda
help() {
    echo "Script de Deploy para Painel QR Brasil"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build     - Fazer build da aplicação"
    echo "  start     - Iniciar aplicação"
    echo "  stop      - Parar aplicação"
    echo "  restart   - Reiniciar aplicação"
    echo "  logs      - Ver logs da aplicação"
    echo "  status    - Ver status dos containers"
    echo "  cleanup   - Limpar recursos Docker não utilizados"
    echo "  backup    - Criar backup da aplicação"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 build"
    echo "  $0 start"
    echo "  $0 logs"
}

# Função principal
main() {
    check_docker
    
    case "${1:-help}" in
        build)
            check_env
            build
            ;;
        start)
            check_env
            start
            ;;
        stop)
            stop
            ;;
        restart)
            check_env
            restart
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        cleanup)
            cleanup
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