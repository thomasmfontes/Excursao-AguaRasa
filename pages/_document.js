import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Meta Tags Básicas */}
        <meta charSet="utf-8" />
        <meta name="description" content="Formulário de inscrição para a Excursão Campinas. Preencha seus dados e garanta sua vaga no ônibus. Pagamento via Pix disponível." />
        <meta name="keywords" content="excursão, campinas, inscrição, formulário, ônibus, congregação, CCB" />
        <meta name="author" content="Congregação Água Rasa" />
        <meta name="theme-color" content="#2563eb" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://excursao-aguarasa.vercel.app/" />
        <meta property="og:title" content="Excursão Campinas - Inscrição" />
        <meta property="og:description" content="Formulário de inscrição para a Excursão Campinas. Preencha seus dados e garanta sua vaga no ônibus." />
        <meta property="og:image" content="https://excursao-aguarasa.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="pt_BR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://excursao-aguarasa.vercel.app/" />
        <meta name="twitter:title" content="Excursão Campinas - Inscrição" />
        <meta name="twitter:description" content="Formulário de inscrição para a Excursão Campinas. Preencha seus dados e garanta sua vaga no ônibus." />
        <meta name="twitter:image" content="https://excursao-aguarasa.vercel.app/og-image.png" />

        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.ico" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect para melhor performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
