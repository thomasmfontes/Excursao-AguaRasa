# Excursão – Formulário (Next.js + Tailwind + Google Sheets)

Sistema moderno de inscrição para excursões com design premium, validação em tempo real e integração com Google Sheets.

## ✨ Funcionalidades

- 📝 **Formulário Completo**: Cadastro com validação em tempo real
- 💳 **Pagamento Pix**: QR Code e código copia-e-cola integrados
- 🎨 **Design Moderno**: Gradientes, glassmorphism e animações suaves
- 📱 **Mobile-First**: Totalmente responsivo e otimizado para dispositivos móveis
- 🌓 **Tema Claro/Escuro**: Alternância automática com persistência
- 📊 **Indicador de Progresso**: Acompanhamento visual do preenchimento
- ✅ **Validação Avançada**: CPF, RG, telefone e outros campos
- 💾 **Auto-Save**: Rascunho salvo automaticamente no navegador
- 🎉 **Página de Sucesso**: Confirmação visual com resumo da inscrição
- 🔒 **Detecção de Duplicatas**: Previne envios duplicados
- 🚀 **PWA Ready**: Instalável como aplicativo

## 🚀 Instalação

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# ID da planilha Google Sheets
SHEET_ID=seu_id_da_planilha

# Email da Service Account
GOOGLE_CLIENT_EMAIL=seu-email@projeto.iam.gserviceaccount.com

# Chave privada da Service Account (formato JSON)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END PRIVATE KEY-----\n"

# Código Pix (copia e cola)
NEXT_PUBLIC_PIX_COPIA_E_COLA=seu_codigo_pix_aqui
```

### Google Sheets API

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto
3. Ative a **Google Sheets API**
4. Crie uma **Service Account**
5. Baixe o arquivo JSON com as credenciais
6. Compartilhe sua planilha com o email da Service Account (permissão de Editor)

### Estrutura da Planilha

A primeira linha deve conter os cabeçalhos:

| Data | Nome completo | CPF ou RG | Instrumento | Comum congregação | Estado civil | Auxiliar | Idade | Telefone |
|------|---------------|-----------|-------------|-------------------|--------------|----------|-------|----------|

## 📦 Build e Deploy

```bash
# Build de produção
npm run build

# Iniciar servidor de produção
npm start

# Lint
npm run lint
```

### Deploy na Vercel

1. Conecte seu repositório no [Vercel](https://vercel.com)
2. Configure as variáveis de ambiente
3. Deploy automático!

## 🎨 Customização

### Cores e Temas

Edite `styles/globals.css` para personalizar:
- Cores primárias e secundárias
- Gradientes
- Sombras
- Animações

### Congregações e Instrumentos

Edite `pages/index.jsx` para modificar as listas de:
- Congregações disponíveis
- Instrumentos musicais
- Campos do formulário

## 📱 PWA

O projeto inclui suporte básico para PWA:
- `public/manifest.json` - Configuração do app
- Meta tags para instalação
- Ícones e cores temáticas

## 🛠️ Tecnologias

- **Next.js 15.5.4** - Framework React
- **React 19.1.0** - Biblioteca UI
- **Tailwind CSS 4.1.14** - Estilização
- **Google Sheets API** - Backend/Database
- **QRCode** - Geração de QR Code Pix
- **React Hot Toast** - Notificações

## 📄 Estrutura do Projeto

```
├── components/          # Componentes reutilizáveis
│   ├── FormField.jsx
│   ├── ProgressIndicator.jsx
│   └── SuccessAnimation.jsx
├── pages/              # Páginas Next.js
│   ├── api/           # API Routes
│   ├── index.jsx      # Página principal
│   ├── success.jsx    # Página de sucesso
│   ├── _app.js        # App wrapper
│   └── _document.js   # Document (SEO)
├── public/            # Arquivos estáticos
├── styles/            # Estilos globais
├── utils/             # Utilitários
│   ├── formatters.js  # Máscaras e formatação
│   └── validators.js  # Validações
└── package.json
```

## 🐛 Troubleshooting

### Erro de permissão na planilha
- Verifique se compartilhou a planilha com o email da Service Account
- Confirme que a permissão é de "Editor"

### QR Code não aparece
- Verifique se `NEXT_PUBLIC_PIX_COPIA_E_COLA` está configurado
- Confirme que o código Pix é válido

### Erro ao enviar formulário
- Verifique as credenciais do Google no `.env.local`
- Confirme que a Google Sheets API está ativada
- Verifique os logs do console

## 📝 Licença

Este projeto é de uso livre para fins educacionais e religiosos.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.
