# Painel QR Brasil - Sistema de Gerenciamento de Franquias

Sistema completo para gerenciamento de múltiplas franquias com funcionalidade de geração de QR Codes, desenvolvido com Next.js 15, TypeScript, Tailwind CSS e MySQL.

## 🚀 Funcionalidades

### Para Franquias:
- **Cadastro de Franquia**: Formulário completo com validação
- **Login Seguro**: Autenticação com JWT e bcrypt
- **Dashboard**: Interface moderna e responsiva

### Para Placas:
- **Cadastro de Placas**: Gerenciamento de empresas associadas
- **Geração de QR Codes**: Criação de QR codes para URLs personalizadas
- **Visualização**: Lista organizada de todas as placas cadastradas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Banco de Dados**: MySQL com Prisma ORM
- **Autenticação**: JWT + bcrypt
- **QR Code**: Biblioteca qrcode

## 📋 Pré-requisitos

- Node.js 18+ 
- MySQL 8.0+
- npm ou yarn

## 🔧 Instalação e Configuração

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd painel-qrbrasil
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/painel_qrbrasil"
JWT_SECRET="sua_chave_secreta_muito_segura_aqui_2024"
```

**Substitua:**
- `usuario`: seu usuário MySQL
- `senha`: sua senha MySQL
- `localhost:3306`: host e porta do seu MySQL
- `painel_qrbrasil`: nome do banco de dados
- `sua_chave_secreta_muito_segura_aqui_2024`: uma chave secreta forte para JWT

### 4. Configure o banco de dados

```bash
# Gere o cliente Prisma
npx prisma generate

# Execute as migrações
npx prisma migrate dev --name init

# (Opcional) Visualize o banco com Prisma Studio
npx prisma studio
```

### 5. Execute o projeto

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

O sistema estará disponível em `http://localhost:3000`

## 📱 Como Usar

### 1. Cadastro de Franquia
- Acesse a página inicial
- Preencha todos os campos obrigatórios:
  - Nome da Franquia
  - CNPJ
  - Endereço
  - Email
  - Senha
  - WhatsApp
- Clique em "Cadastrar Franquia"

### 2. Login
- Acesse `/login`
- Digite email e senha
- Após login bem-sucedido, será redirecionado para o dashboard

### 3. Dashboard
No dashboard você encontrará:

#### Cadastrar Placa
- Clique em "Cadastrar Nova Placa"
- Preencha os dados da empresa:
  - Nome da Empresa
  - CNPJ
  - Endereço
  - Email
  - WhatsApp

#### Gerar QR Code
- Clique em "Gerar QR Code"
- Selecione uma placa cadastrada
- Digite a URL desejada
- O QR Code será gerado e salvo

### 4. Visualização
- Todas as placas cadastradas aparecem na lista
- QR Codes gerados são exibidos ao lado das placas
- Informações completas de cada empresa são mostradas

## 🔒 Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT com cookies httpOnly
- Middleware protege rotas autenticadas
- Validação de dados em todas as APIs
- Relacionamentos seguros entre franquias e placas

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── cadastro/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── placas/route.ts
│   │   └── qrcode/route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── auth.ts
│   └── db.ts
└── middleware.ts
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outros provedores
- Configure as variáveis de ambiente
- Execute `npm run build`
- Configure o servidor para servir os arquivos estáticos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para o Painel QR Brasil**
