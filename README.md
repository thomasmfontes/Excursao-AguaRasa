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
- NEXT_PUBLIC_PIX_COPIA_E_COLA = código Pix (copia e cola) que será mostrado na aba Pix e usado para gerar o QR Code

## Permissões
- Ative a Google Sheets API no Google Cloud.
- Crie uma Service Account e baixe o JSON.
- Compartilhe a planilha com o e-mail da service account (Editor).

## Rodar local
```bash
npm run dev
```
Abrir http://localhost:3000

## Pagamento via Pix (nova aba)
- A página inicial agora tem duas abas: "Formulário" e "Pix".
- Para ativar o QR Code e o campo de copiar, defina a variável de ambiente `NEXT_PUBLIC_PIX_COPIA_E_COLA` com o seu código Pix (copia e cola). Em desenvolvimento, crie um arquivo `.env.local` na raiz do projeto com:

```
NEXT_PUBLIC_PIX_COPIA_E_COLA=SEU_CODIGO_PIX_AQUI
```

- Depois, reinicie o `npm run dev`.
- Na aba Pix, você pode escanear o QR gerado ou clicar em "Copiar código" para usar o Pix copia e cola no app do banco.
