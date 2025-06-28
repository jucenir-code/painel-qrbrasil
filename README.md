# Painel QR Brasil

Sistema de gerenciamento de franquias com geração de QR Codes desenvolvido em Next.js.

## 🚀 Funcionalidades

- **Cadastro de Franquias**: Interface para cadastrar novas franquias com validação de formulários
- **Login de Franquias**: Sistema de autenticação para franquias cadastradas
- **Dashboard Moderno**: Interface responsiva com cards de estatísticas e tabela de placas
- **Gerenciamento de Placas**: Cadastro, edição e visualização de placas de empresas
- **Geração de QR Codes**: Criação de QR codes por placa e QR codes gerais
- **Interface Responsiva**: Design moderno e adaptável para desktop e mobile

## 🛠️ Tecnologias Utilizadas

- **Next.js 15**: Framework React com App Router
- **TypeScript**: Tipagem estática para JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **QRCode**: Biblioteca para geração de códigos QR
- **date-fns**: Biblioteca para manipulação de datas

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd painel-qrbrasil
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
```

4. Acesse o projeto em `http://localhost:3000`

## 🔧 Scripts Disponíveis

- `npm run dev`: Executa o projeto em modo de desenvolvimento
- `npm run build`: Gera a build de produção
- `npm run start`: Executa o projeto em modo de produção
- `npm run lint`: Executa o linter para verificar o código

## 📱 Funcionalidades do Sistema

### Página Inicial (/)
- Formulário de cadastro de franquias
- Validação de campos obrigatórios
- Máscaras para CNPJ e WhatsApp
- Feedback visual de sucesso/erro

### Página de Login (/login)
- Formulário de autenticação
- Validação de credenciais
- Redirecionamento para dashboard após login

### Dashboard (/dashboard)
- **Cards de Estatísticas**: Total de placas, QR codes gerados, última atividade
- **Tabela de Placas**: Lista todas as placas cadastradas com informações completas
- **Ações por Placa**: Editar dados e gerar QR codes
- **QR Code Geral**: Gerar QR codes independentes de placas
- **Notificações**: Sistema de toast para feedback de ações

### Funcionalidades de QR Code
- Geração de QR codes por placa específica
- QR codes gerais para URLs customizadas
- Download dos QR codes gerados
- Visualização em tempo real

## 🎨 Interface e UX

- **Design Moderno**: Interface limpa com gradientes e sombras
- **Responsividade**: Adaptável para diferentes tamanhos de tela
- **Feedback Visual**: Loading states, notificações e validações
- **Acessibilidade**: Labels adequados e navegação por teclado
- **Modais**: Interface modal para ações específicas

## 🔄 Integração com API REST

O projeto está preparado para integração com uma API REST externa. As seguintes funcionalidades estão implementadas com dados mockados e podem ser facilmente conectadas a endpoints reais:

### Endpoints Necessários

#### Autenticação
- `POST /api/auth/cadastro` - Cadastro de franquias
- `POST /api/auth/login` - Login de franquias
- `POST /api/auth/logout` - Logout

#### Placas
- `GET /api/placas` - Listar placas
- `POST /api/placas` - Criar nova placa
- `PUT /api/placas/:id` - Atualizar placa

#### QR Codes
- `POST /api/qrcode` - Gerar QR code

### Estrutura de Dados

#### Franquia
```typescript
interface Franquia {
  id: number
  nome: string
  cnpj: string
  endereco: string
  email: string
  senha: string
  whatsapp: string
}
```

#### Placa
```typescript
interface Placa {
  id: number
  nomeEmpresa: string
  cnpj: string
  endereco: string
  email: string
  whatsapp: string
  qrCodeUrl?: string
  qrCodeData?: string
  createdAt: string
}
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente necessárias
3. Deploy automático a cada push

### Docker
```bash
# Build da imagem
docker build -t painel-qrbrasil .

# Executar container
docker run -p 3000:3000 painel-qrbrasil
```

## 📝 Próximos Passos

1. **Integração com API REST**: Conectar com backend real
2. **Autenticação JWT**: Implementar sistema de tokens
3. **Upload de Imagens**: Permitir upload de logos das empresas
4. **Relatórios**: Gerar relatórios de QR codes gerados
5. **Notificações Push**: Sistema de notificações em tempo real

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através dos canais disponíveis no projeto.

---

**Desenvolvido com ❤️ para o Painel QR Brasil**
