#!/bin/bash

# Script para verificar configuração do domínio
# Uso: ./check-domain.sh

DOMAIN="painel.qrbrasil.com.br"

echo "🔍 Verificando configuração do domínio: $DOMAIN"
echo ""

# Verificar DNS
echo "📡 Verificando DNS..."
nslookup $DOMAIN
echo ""

# Verificar se porta 80 está acessível
echo "🌐 Testando porta 80..."
curl -I http://$DOMAIN 2>/dev/null | head -5
echo ""

# Verificar se porta 443 está acessível
echo "🔒 Testando porta 443..."
curl -I https://$DOMAIN 2>/dev/null | head -5
echo ""

# Verificar IP do domínio
echo "📍 IP do domínio:"
dig +short $DOMAIN
echo ""

# Verificar IP da VPS
echo "📍 IP da VPS:"
curl -s ifconfig.me
echo ""

echo "✅ Verificação concluída!"
echo ""
echo "Se os IPs não coincidem, configure o DNS do domínio para apontar para a VPS." 