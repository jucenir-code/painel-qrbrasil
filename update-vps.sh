#!/bin/bash

# Script para Atualizar VPS - Painel QR Brasil
# Uso: ./update-vps.sh [VPS_IP] [CHAVE_PEM] [METODO]

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

# Atualizar via SCP
update_scp() {
    local VPS_IP=$1
    local CHAVE_PEM=$2
    
    log "📤 Enviando arquivos via SCP..."
    
    # Enviar arquivos para VPS
    scp -r -i $CHAVE_PEM ./painel-qrbrasil ubuntu@$VPS_IP:~/
    
    log "🚀 Conectando na VPS para deploy..."
    
    # Conectar na VPS e fazer deploy
    ssh -i $CHAVE_PEM ubuntu@$VPS_IP << 'EOF'
        cd painel-qrbrasil
        chmod +x redeploy.sh
        ./redeploy.sh full
        echo "✅ Deploy concluído!"
EOF
}

# Atualizar via rsync
update_rsync() {
    local VPS_IP=$1
    local CHAVE_PEM=$2
    
    log "🔄 Sincronizando arquivos via rsync..."
    
    # Sincronizar arquivos
    rsync -avz -e "ssh -i $CHAVE_PEM" ./painel-qrbrasil/ ubuntu@$VPS_IP:~/painel-qrbrasil/
    
    log "🚀 Conectando na VPS para deploy..."
    
    # Conectar na VPS e fazer deploy
    ssh -i $CHAVE_PEM ubuntu@$VPS_IP << 'EOF'
        cd painel-qrbrasil
        chmod +x redeploy.sh
        ./redeploy.sh update
        echo "✅ Deploy concluído!"
EOF
}

# Atualizar via git (se o projeto está no repositório)
update_git() {
    local VPS_IP=$1
    local CHAVE_PEM=$2
    local REPO_URL=$3
    
    log "📥 Atualizando via Git..."
    
    # Conectar na VPS e atualizar via git
    ssh -i $CHAVE_PEM ubuntu@$VPS_IP << EOF
        if [ -d "painel-qrbrasil" ]; then
            cd painel-qrbrasil
            git pull origin main
        else
            git clone $REPO_URL painel-qrbrasil
            cd painel-qrbrasil
        fi
        
        chmod +x redeploy.sh
        ./redeploy.sh update
        echo "✅ Deploy concluído!"
EOF
}

# Atualizar via wget (download direto)
update_wget() {
    local VPS_IP=$1
    local CHAVE_PEM=$2
    local DOWNLOAD_URL=$3
    
    log "📥 Baixando via wget..."
    
    # Conectar na VPS e baixar
    ssh -i $CHAVE_PEM ubuntu@$VPS_IP << EOF
        # Baixar arquivo
        wget $DOWNLOAD_URL -O painel-qrbrasil.zip
        
        # Extrair
        unzip -o painel-qrbrasil.zip
        
        # Mover para pasta correta
        if [ -d "painel-qrbrasil-main" ]; then
            rm -rf painel-qrbrasil
            mv painel-qrbrasil-main painel-qrbrasil
        fi
        
        cd painel-qrbrasil
        chmod +x redeploy.sh
        ./redeploy.sh full
        echo "✅ Deploy concluído!"
EOF
}

# Mostrar ajuda
help() {
    echo "Script para Atualizar VPS - Painel QR Brasil"
    echo ""
    echo "Uso: $0 [VPS_IP] [CHAVE_PEM] [METODO] [OPCOES]"
    echo ""
    echo "Métodos disponíveis:"
    echo "  scp      - Enviar arquivos via SCP"
    echo "  rsync    - Sincronizar arquivos via rsync"
    echo "  git      - Atualizar via Git (repositório)"
    echo "  wget     - Baixar via wget (URL)"
    echo ""
    echo "Exemplos:"
    echo "  $0 1.2.3.4 chave.pem scp"
    echo "  $0 1.2.3.4 chave.pem rsync"
    echo "  $0 1.2.3.4 chave.pem git https://github.com/usuario/painel-qrbrasil.git"
    echo "  $0 1.2.3.4 chave.pem wget https://github.com/usuario/painel-qrbrasil/archive/main.zip"
    echo ""
    echo "Comandos manuais:"
    echo "  scp -r -i chave.pem ./painel-qrbrasil ubuntu@IP:~/"
    echo "  rsync -avz -e \"ssh -i chave.pem\" ./painel-qrbrasil/ ubuntu@IP:~/painel-qrbrasil/"
    echo "  ssh -i chave.pem ubuntu@IP 'cd painel-qrbrasil && git pull && ./redeploy.sh update'"
}

# Função principal
main() {
    if [ $# -lt 3 ]; then
        error "Parâmetros insuficientes"
        help
        exit 1
    fi
    
    VPS_IP=$1
    CHAVE_PEM=$2
    METODO=$3
    
    case $METODO in
        scp)
            update_scp $VPS_IP $CHAVE_PEM
            ;;
        rsync)
            update_rsync $VPS_IP $CHAVE_PEM
            ;;
        git)
            if [ -z "$4" ]; then
                error "URL do repositório é obrigatória para método git"
                exit 1
            fi
            update_git $VPS_IP $CHAVE_PEM $4
            ;;
        wget)
            if [ -z "$4" ]; then
                error "URL de download é obrigatória para método wget"
                exit 1
            fi
            update_wget $VPS_IP $CHAVE_PEM $4
            ;;
        help|--help|-h)
            help
            ;;
        *)
            error "Método inválido: $METODO"
            help
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@" 