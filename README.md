# Excursão – Formulário (Next.js + Tailwind + Google Sheets)

## Instalar dependências
```bash
npm i
npm i googleapis
npm i -D tailwindcss postcss autoprefixer
```

## Inicializar Tailwind (se necessário)
```bash
npx tailwindcss init -p
```

## Variáveis de ambiente (Vercel)
- SHEET_ID = ID da planilha (URL: docs.google.com/spreadsheets/d/ID/edit)
- GOOGLE_SERVICE_ACCOUNT_JSON = conteúdo JSON completo da service account

## Permissões
- Ative a Google Sheets API no Google Cloud.
- Crie uma Service Account e baixe o JSON.
- Compartilhe a planilha com o e-mail da service account (Editor).

## Rodar local
```bash
npm run dev
```
Abrir http://localhost:3000
