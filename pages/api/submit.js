import { google } from 'googleapis';

function getServiceAccount() {
    // A) Envs separadas (preferido)
    const emailA = process.env.GOOGLE_CLIENT_EMAIL;
    let keyA = process.env.GOOGLE_PRIVATE_KEY;
    if (emailA && keyA) return { clientEmail: emailA, privateKey: keyA };

    // B) Envs separadas com base64
    const emailB = process.env.GOOGLE_CLIENT_EMAIL;
    const keyB64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;
    if (emailB && keyB64) {
        const key = Buffer.from(keyB64, 'base64').toString('utf8');
        return { clientEmail: emailB, privateKey: key };
    }

    // C) JSON inteiro em uma env
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
    if (raw) {
        try {
            const svc = JSON.parse(raw);
            const clientEmail = svc.client_email;
            // transforma \\n em \n
            const privateKey = (svc.private_key || '').replace(/\\n/g, '\n');
            if (clientEmail && privateKey) return { clientEmail, privateKey };
        } catch (_) { /* cai fora */ }
    }

    return { clientEmail: null, privateKey: null };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method' });

    const body = req.body || {};
    if (!body.fullName || !body.cpf) {
        return res.status(400).json({ error: 'nome e cpf obrigatorios' });
    }

    const sheetId = process.env.SHEET_ID;
    if (!sheetId) return res.status(500).json({ error: 'SHEET_ID ausente' });

    const { clientEmail, privateKey } = getServiceAccount();
    if (!clientEmail || !privateKey) {
        return res.status(500).json({ error: 'No key or keyFile set (client_email/private_key ausentes)' });
    }

    try {
        const jwt = new google.auth.JWT(
            clientEmail,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );
        await jwt.authorize();

        const gs = google.sheets({ version: 'v4', auth: jwt });
        // sanity check de acesso
        await gs.spreadsheets.get({ spreadsheetId: sheetId });

        const row = [
            new Date().toISOString(),
            body.fullName || '',
            body.cpf || '',
            body.rg || '',
            body.congregation || '',
            body.maritalStatus || '',
            body.age || '',
            body.phone || '',
        ];

        await gs.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });

        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: String(err?.message || err) });
    }
}