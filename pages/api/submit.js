import { google } from 'googleapis';

// Cache simples para detectar duplicatas (em produção, use Redis ou DB)
const recentSubmissions = new Map();
const DUPLICATE_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

export default async function handler(req, res) {
    // CORS/HEADERS básicos
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Garante JSON
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
        return res.status(400).json({ error: 'Content-Type deve ser application/json' });
    }

    // Body (protege contra body string)
    let body = req.body || {};
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({ error: 'JSON inválido' });
        }
    }

    // Validação de campos obrigatórios
    const missing = [];
    if (!body.fullName?.trim()) missing.push('nome');
    if (!body.cpf?.trim() && !body.rg?.trim()) missing.push('cpf/rg');
    if (!body.congregation?.trim()) missing.push('congregação');
    if (!body.maritalStatus?.trim()) missing.push('estado civil');
    if (!body.auxiliar?.trim()) missing.push('auxiliar');
    if (!body.age?.trim()) missing.push('idade');
    if (!body.phone?.trim()) missing.push('telefone');
    if (!body.instrument?.trim()) missing.push('instrumento');

    if (missing.length) {
        return res.status(400).json({
            error: `Campos obrigatórios faltando: ${missing.join(', ')}`
        });
    }

    // Detecção de duplicatas (mesmo CPF/RG nos últimos 5 minutos)
    const docKey = body.cpf || body.rg;
    const now = Date.now();

    if (docKey) {
        const lastSubmission = recentSubmissions.get(docKey);
        if (lastSubmission && (now - lastSubmission) < DUPLICATE_WINDOW_MS) {
            return res.status(429).json({
                error: 'Você já enviou uma inscrição recentemente. Aguarde alguns minutos.'
            });
        }
    }

    // Envs
    const sheetId = process.env.SHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || '';
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';

    // Normaliza chave
    privateKey = privateKey.replace(/\\r/g, '\\n');
    privateKey = privateKey.replace(/\\\\n/g, '\\n');

    if (!sheetId) {
        console.error('SHEET_ID não configurado');
        return res.status(500).json({ error: 'Configuração do servidor incompleta (SHEET_ID)' });
    }

    if (!clientEmail || !privateKey) {
        console.error('Credenciais do Google não configuradas');
        return res.status(500).json({
            error: 'Configuração do servidor incompleta (credenciais Google)'
        });
    }

    try {
        // Auth
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: clientEmail, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const gs = google.sheets({ version: 'v4', auth });

        // Checagem de acesso
        await gs.spreadsheets.get({ spreadsheetId: sheetId });

        // Formata data/hora em PT-BR
        const now = new Date();
        const dateStr = new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(now);

        // Monta a linha
        const cpfOrRg = body.cpf || body.rg || '';
        const row = [
            dateStr, // Data formatada
            body.fullName || '',
            cpfOrRg,
            body.instrument || '',
            body.congregation || '',
            body.maritalStatus || '',
            body.auxiliar || '',
            body.age || '',
            body.phone || '',
        ];

        // Append na planilha
        await gs.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'A2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });

        // Registra submissão para evitar duplicatas
        if (docKey) {
            recentSubmissions.set(docKey, now);

            // Limpa cache antigo
            setTimeout(() => {
                recentSubmissions.delete(docKey);
            }, DUPLICATE_WINDOW_MS);
        }

        console.log(`✅ Inscrição registrada: ${body.fullName} (${cpfOrRg})`);

        return res.status(200).json({
            ok: true,
            message: 'Cadastro confirmado com sucesso!'
        });

    } catch (err) {
        // Log do erro completo no servidor
        console.error('Erro ao processar inscrição:', err);

        // Mensagens mais claras para o usuário
        const msg = String(err?.message || err);

        if (/PERMISSION|insufficientPermissions/i.test(msg)) {
            return res.status(500).json({
                error: 'Sem permissão na planilha. Contate o administrador.'
            });
        }

        if (/invalid_grant|key.*invalid|private key/i.test(msg)) {
            return res.status(500).json({
                error: 'Erro de autenticação. Contate o administrador.'
            });
        }

        if (/notFound|Requested entity was not found/i.test(msg)) {
            return res.status(500).json({
                error: 'Planilha não encontrada. Contate o administrador.'
            });
        }

        return res.status(500).json({
            error: 'Erro ao processar inscrição. Tente novamente.'
        });
    }
}