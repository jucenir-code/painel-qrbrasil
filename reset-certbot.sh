#!/bin/bash

# Script para resetar Certbot e tentar novamente
# Uso: ./reset-certbot.sh

DOMAIN="painel.qrbrasil.com.br"
EMAIL="suporte@qrbrasil.com.br"

echo "🔄 Resetando Certbot para o domínio: $DOMAIN"
echo ""

# Parar containers
echo "🛑 Parando containers..."
docker-compose down

# Limpar certificados antigos
echo "🧹 Limpando certificados antigos..."
sudo rm -rf certbot/conf/live/$DOMAIN
sudo rm -rf certbot/conf/archive/$DOMAIN
sudo rm -rf certbot/conf/renewal/$DOMAIN.conf

# Limpar logs
echo "📋 Limpando logs..."
sudo rm -f certbot/conf/logs/*

# Recriar diretórios
echo "📁 Recriando diretórios..."
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p ssl

# Atualizar docker-compose.yml
echo "⚙️ Atualizando configuração..."
sed -i "s/seu-dominio.com/$DOMAIN/g" docker-compose.yml
sed -i "s/seu-email@exemplo.com/$EMAIL/g" docker-compose.yml

# Configurar nginx para validação
echo "🌐 Configurando Nginx para validação..."
cat > nginx-aws.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream painel-qrbrasil {
        server painel-qrbrasil:3000;
    }

    # Configuração para HTTP (validação Let's Encrypt)
    server {
        listen 80;
        server_name $DOMAIN;
        
        # Configuração para validação do Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Proxy para aplicação
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
    }
}
EOF

# Iniciar apenas nginx
echo "🚀 Iniciando Nginx..."
docker-compose up -d nginx

# Aguardar nginx estar pronto
echo "⏳ Aguardando Nginx estar pronto..."
sleep 10

# Tentar obter certificado
echo "🔐 Tentando obter certificado..."
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $EMAIL --agree-tos --no-eff-email -d $DOMAIN

# Se sucesso, configurar SSL completo
if [ $? -eq 0 ]; then
    echo "✅ Certificado obtido com sucesso!"
    echo "🔧 Configurando SSL completo..."
    
    # Configurar nginx com SSL
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

    # Reiniciar nginx
    docker-compose restart nginx
    
    # Iniciar aplicação
    docker-compose up -d
    
    echo "🎉 SSL configurado com sucesso!"
    echo "🌐 Acesse: https://$DOMAIN"
else
    echo "❌ Falha ao obter certificado"
    echo "🔍 Verifique se o domínio está apontando para esta VPS"
    echo "📋 Execute: ./check-domain.sh $DOMAIN"
fi 