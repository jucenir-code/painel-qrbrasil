#!/bin/bash

# Script para configurar SSL com Let's Encrypt
# Uso: ./setup-ssl.sh seu-dominio.com seu-email@exemplo.com

if [ $# -ne 2 ]; then
    echo "Uso: $0 <dominio> <email>"
    echo "Exemplo: $0 painel.qrbrasil.com.br suporte@qrbrasil.com.br"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "Configurando SSL para o domínio: $DOMAIN"
echo "Email: $EMAIL"

# Criar diretórios necessários
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p ssl

# Atualizar docker-compose.yml com o domínio e email corretos
sed -i "s/painel.qrbrasil.com.br/$DOMAIN/g" docker-compose.yml
sed -i "s/suporte@painel.qrbrasil.com.br/$EMAIL/g" docker-compose.yml

# Atualizar nginx-aws.conf para habilitar SSL
echo "Atualizando configuração do Nginx..."

# Backup do arquivo original
cp nginx-aws.conf nginx-aws.conf.backup

# Criar nova configuração com SSL habilitado
cat > nginx-aws.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream painel-qrbrasil {
        server painel-qrbrasil:3000;
    }

    # Configuração para HTTP (redirecionar para HTTPS)
    server {
        listen 80;
        server_name $DOMAIN;
        
        # Configuração para validação do Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirecionar para HTTPS
        location / {
            return 301 https://\$host\$request_uri;
        }
    }

    # Configuração para HTTPS
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        # Configurações SSL
        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # Configurações de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Configurações de proxy
        location / {
            proxy_pass http://painel-qrbrasil;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 86400;
        }

        # Configurações para arquivos estáticos
        location /_next/static {
            proxy_pass http://painel-qrbrasil;
            proxy_cache_valid 200 1y;
            add_header Cache-Control "public, immutable";
        }

        # Configurações para API
        location /api {
            proxy_pass http://painel-qrbrasil;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOF

echo "Configuração concluída!"
echo ""
echo "Para aplicar as mudanças:"
echo "1. Certifique-se de que o domínio $DOMAIN aponta para este servidor"
echo "2. Execute: docker-compose down"
echo "3. Execute: docker-compose up -d"
echo "4. Para obter o certificado SSL: docker-compose run --rm certbot"
echo ""
echo "Para renovar certificados automaticamente, adicione ao crontab:"
echo "0 12 * * * docker-compose run --rm certbot renew && docker-compose exec nginx nginx -s reload" 