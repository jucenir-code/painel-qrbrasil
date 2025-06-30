# Configuração de SSL com Let's Encrypt

Este documento explica como configurar certificados SSL gratuitos usando Let's Encrypt para o painel QR Brasil.

## Pré-requisitos

1. Um domínio configurado e apontando para o servidor
2. Docker e Docker Compose instalados
3. Portas 80 e 443 liberadas no firewall

## Configuração Automática

### 1. Execute o script de configuração

```bash
./setup-ssl.sh seu-dominio.com seu-email@exemplo.com
```

Exemplo:
```bash
./setup-ssl.sh painel.qrbrasil.com admin@qrbrasil.com
```

### 2. Inicie os containers

```bash
docker-compose down
docker-compose up -d
```

### 3. Obtenha o certificado SSL

```bash
docker-compose run --rm certbot
```

## Configuração Manual

Se preferir configurar manualmente:

### 1. Edite o docker-compose.yml

Substitua `seu-dominio.com` e `seu-email@exemplo.com` pelos valores corretos.

### 2. Configure o Nginx

O arquivo `nginx-aws.conf` será atualizado automaticamente pelo script, mas você pode editá-lo manualmente se necessário.

### 3. Crie os diretórios necessários

```bash
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p ssl
```

## Renovação Automática

Para renovar certificados automaticamente, adicione ao crontab:

```bash
crontab -e
```

Adicione a linha:
```
0 12 * * * docker-compose run --rm certbot renew && docker-compose exec nginx nginx -s reload
```

## Verificação

Após a configuração, você pode verificar se o SSL está funcionando:

1. Acesse `https://seu-dominio.com`
2. Verifique se o certificado é válido no navegador
3. Teste o redirecionamento de HTTP para HTTPS

## Troubleshooting

### Certificado não é gerado

1. Verifique se o domínio está apontando para o servidor
2. Certifique-se de que as portas 80 e 443 estão liberadas
3. Verifique os logs: `docker-compose logs certbot`

### Nginx não carrega

1. Verifique se os certificados existem: `ls -la certbot/conf/live/seu-dominio.com/`
2. Verifique os logs: `docker-compose logs nginx`

### Erro de permissão

```bash
sudo chown -R $USER:$USER certbot/
```

## Estrutura de Arquivos

```
painel-qrbrasil/
├── docker-compose.yml
├── nginx-aws.conf
├── setup-ssl.sh
├── certbot/
│   ├── conf/          # Certificados SSL
│   └── www/           # Arquivos de validação
└── ssl/               # Certificados adicionais (se necessário)
```

## Segurança

- Os certificados são renovados automaticamente
- Configurações de segurança estão habilitadas no Nginx
- Headers de segurança são adicionados automaticamente
- Redirecionamento forçado de HTTP para HTTPS 