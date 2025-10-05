# TripFarm Pesquisas - Sistema Refatorado

Sistema de formulários de pesquisa para o TripFarm, refatorado para envio de dados por email em formato ZIP, com arquitetura separada entre frontend e backend.

## 📋 Visão Geral

Este projeto foi completamente refatorado para remover a dependência do Supabase e implementar um sistema de envio de dados por email. O sistema agora está organizado em duas partes independentes:

- **Backend**: API Node.js que processa formulários e envia dados por email
- **Frontend**: Interface web estática que pode ser hospedada separadamente

## 🏗️ Arquitetura

### Backend (Node.js + Express)
- Recebe dados dos formulários via API REST
- Processa uploads de áudio usando Multer
- Compacta dados em arquivo ZIP (JSON + TXT + áudio)
- Envia ZIP por email usando Nodemailer
- Validação de campos obrigatórios

### Frontend (HTML + CSS + JavaScript)
- Interface responsiva para 3 tipos de formulários
- Gravação de áudio para cada pergunta
- Validação de campos no cliente
- Configuração flexível da URL da API

## 📁 Estrutura do Projeto

```
tripfarm-refatorado/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependências do backend
│   └── .env.example       # Exemplo de variáveis de ambiente
└── frontend/
    ├── index.html         # Interface principal
    ├── config.js          # Configuração da API
    ├── package.json       # Configuração do frontend
    └── js/                # Scripts JavaScript (se existirem)
```

## 🚀 Instalação e Configuração

### Backend

1. **Navegue para o diretório do backend:**
   ```bash
   cd backend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```

4. **Edite o arquivo `.env` com suas configurações:**
   ```env
   # Configurações de Email
   EMAIL_USER=seu_email@gmail.com
   EMAIL_PASS=sua_senha_do_app
   
   # Porta do servidor (opcional, padrão: 3001)
   PORT=3001
   ```

### Frontend

1. **Navegue para o diretório do frontend:**
   ```bash
   cd frontend
   ```

2. **Configure a URL da API no arquivo `config.js`:**
   ```javascript
   const API_CONFIG = {
       BASE_URL: 'http://localhost:3001', // Para desenvolvimento
       // BASE_URL: 'https://seu-backend.herokuapp.com', // Para produção
   };
   ```

## ⚙️ Configuração do Email

### Gmail (Recomendado)

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app:**
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "App" > "Outro (nome personalizado)"
   - Digite "TripFarm" e clique em "Gerar"
   - Use a senha gerada no arquivo `.env`

### Outros Provedores

O sistema suporta outros provedores de email. Edite a configuração no `server.js`:

```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.seuprovedoremail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

## 🏃‍♂️ Executando o Sistema

### Desenvolvimento Local

1. **Inicie o backend:**
   ```bash
   cd backend
   npm run dev
   ```
   O servidor estará disponível em: http://localhost:3001

2. **Inicie o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   O frontend estará disponível em: http://localhost:8080

### Produção

#### Backend (Railway, Render, Heroku)

1. **Faça deploy do diretório `backend/`**
2. **Configure as variáveis de ambiente no painel do provedor**
3. **O servidor iniciará automaticamente na porta definida pela variável `PORT`**

#### Frontend (Vercel, Netlify)

1. **Faça deploy do diretório `frontend/`**
2. **Atualize a URL da API no arquivo `config.js` para apontar para o backend em produção**

## 📝 Campos do Formulário

### Campos Obrigatórios (todos os formulários):
- **Nome**: Nome completo ou apelido
- **Cidade**: Cidade onde mora
- **Sexo**: Masculino, Feminino, Outro, Prefiro não informar
- **Ano de nascimento**: Ano de nascimento (1900-2024)

### Campos Opcionais:
- **Instagram**: Handle do Instagram
- **WhatsApp**: Número de telefone

## 🎯 Tipos de Formulário

### 1. Visitante (7 perguntas)
Pesquisa sobre experiências e interesses em turismo rural

### 2. Produtor Tradicional (8 perguntas)
Pesquisa sobre potencial e desafios do turismo rural

### 3. Produtor Digital (9 perguntas)
Pesquisa sobre gestão e plataformas de turismo rural

## 📧 Formato do Email

Quando um formulário é enviado, o sistema:

1. **Cria um arquivo ZIP** contendo:
   - `respostas.json`: Dados estruturados em JSON
   - `respostas.txt`: Dados em formato legível
   - `audio_[timestamp].webm`: Arquivo de áudio (se gravado)

2. **Envia email para** `tripfarm.oficial@gmail.com` com:
   - Assunto: "Nova resposta TripFarm - [tipo] - [nome]"
   - Resumo dos dados principais no corpo do email
   - Arquivo ZIP anexado

## 🔧 API Endpoints

### `GET /`
Retorna informações sobre a API

### `GET /api/health`
Endpoint de verificação de saúde do servidor

### `POST /api/salvar`
Processa e salva dados do formulário
- **Content-Type**: `application/json`
- **Body**: Dados do formulário + áudios em base64
- **Response**: Confirmação de envio

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **Multer**: Upload de arquivos
- **Nodemailer**: Envio de emails
- **Archiver**: Criação de arquivos ZIP
- **CORS**: Controle de acesso entre origens

### Frontend
- **HTML5**: Estrutura da página
- **CSS3**: Estilização responsiva
- **JavaScript ES6+**: Lógica do cliente
- **Web Audio API**: Gravação de áudio

## 🚨 Solução de Problemas

### Erro de Email
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solução**: Verifique se está usando uma senha de app (não a senha da conta)

### Erro de CORS
```
Access to fetch at 'http://localhost:3001/api/salvar' from origin 'http://localhost:8080' has been blocked by CORS policy
```
**Solução**: O backend já está configurado com CORS. Verifique se a URL da API está correta no `config.js`

### Erro de Áudio
```
NotAllowedError: Permission denied
```
**Solução**: O usuário precisa permitir acesso ao microfone no navegador

## 📊 Validações

### Campos Obrigatórios
- Nome: Não pode estar vazio
- Cidade: Não pode estar vazio
- Sexo: Deve ser selecionado
- Ano de nascimento: Deve estar entre 1900 e 2024

### Upload de Áudio
- Tamanho máximo: 10MB
- Formato: WebM (padrão dos navegadores)
- Opcional para todas as perguntas

## 🔒 Segurança

- Validação de dados no servidor e cliente
- Limite de tamanho para uploads
- Sanitização de dados antes do envio por email
- CORS configurado para aceitar requisições do frontend

## 📈 Monitoramento

### Logs do Servidor
O servidor registra:
- Início do servidor
- Status da configuração de email
- Processamento de formulários
- Erros de envio

### Exemplo de Log
```
🚀 Servidor TripFarm rodando na porta 3001
📧 Email configurado: SIM
Criando arquivo ZIP com os dados...
Enviando email...
Email enviado com sucesso!
```

## 🤝 Contribuição

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: tripfarm.oficial@gmail.com
- Documentação: Este README.md

---

**Desenvolvido por TripFarm** - Sistema de Pesquisas v1.0.0

