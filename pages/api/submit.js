import { google } from 'googleapis';

export default async function handler(req, res) {
    // CORS/HEADERS básicos (se precisar chamar de outros domínios no futuro)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method' });
    }

    // Garante JSON
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
        return res.status(400).json({ error: 'content-type deve ser application/json' });
    }

    // Body (protege contra body string)
    let body = req.body || {};
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido' }); }
    }

    // Validação de campos obrigatórios (CPF OU RG)
    const missing = [];
    if (!body.fullName) missing.push('nome');
    if (!body.cpf && !body.rg) missing.push('cpf/rg');
    if (!body.congregation) missing.push('congregação');
    if (!body.maritalStatus) missing.push('estado civil');
    if (!body.age) missing.push('idade');
    if (!body.phone) missing.push('telefone');
    if (!body.instrument) missing.push('instrumento');
    if (missing.length) {
        return res.status(400).json({ error: `campos obrigatórios faltando: ${missing.join(', ')}` });
    }

    // Envs
    const sheetId = process.env.SHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';
    // Normaliza chave (aceita multilinha e também valores com \n escapado)
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    privateKey = privateKey.replace(/\r/g, '\n');      // Windows -> \n
    privateKey = privateKey.replace(/\\n/g, '\n');     // caso venha com "\n" literal

    if (!sheetId) return res.status(500).json({ error: 'SHEET_ID ausente' });
    if (!clientEmail || !privateKey) {
        return res.status(500).json({ error: 'GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY ausentes' });
    }

    try {
        // Auth com GoogleAuth (mais estável em edge/serverless)
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const gs = google.sheets({ version: 'v4', auth });

        // Checagem rápida de acesso
        await gs.spreadsheets.get({ spreadsheetId: sheetId });

        // Monta a linha
        const row = [
            new Date().toISOString(),
            body.fullName || '',
            body.cpf || '',
            body.rg || '',
            body.instrument || '',
            body.congregation || '',
            body.maritalStatus || '',
            body.age || '',
            body.phone || '',
        ];

        // Se tiver cabeçalho na primeira linha da planilha, use A2
        await gs.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        // Mensagens mais claras para causas comuns
        const msg = String(err?.message || err);
        if (/PERMISSION|insufficientPermissions/i.test(msg)) {
            return res.status(500).json({ error: 'Sem permissão na planilha: compartilhe com a service account (Editor).' });
        }
        if (/invalid_grant|key.*invalid|private key/i.test(msg)) {
            return res.status(500).json({ error: 'Chave inválida: verifique GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY.' });
        }
        if (/notFound|Requested entity was not found/i.test(msg)) {
            return res.status(500).json({ error: 'SHEET_ID incorreto.' });
        }
        return res.status(500).json({ error: msg });
    }
}