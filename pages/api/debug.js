import { google } from 'googleapis';

export default async function handler(req, res) {
    const info = {};

    // Mostra se ainda existe a env JSON (só informativo, não usamos)
    info.jsonEnvPresent = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    // Usaremos APENAS envs separadas
    const sheetId = process.env.SHEET_ID || null;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || null;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY || null;

    info.mode = 'separate-envs-only';
    info.sheetIdOk = !!sheetId;
    info.clientEmailOk = !!clientEmail;
    info.privateKeyStartsWith = privateKey ? privateKey.slice(0, 27) : null; // deve ser "-----BEGIN PRIVATE KEY-----"

    if (!sheetId) return res.status(500).json({ ok: false, stage: 'env', error: 'SHEET_ID ausente', info });
    if (!clientEmail || !privateKey) return res.status(500).json({ ok: false, stage: 'env', error: 'GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY ausentes', info });

    try {
        const jwt = new google.auth.JWT(clientEmail, null, privateKey, [
            'https://www.googleapis.com/auth/spreadsheets'
        ]);
        await jwt.authorize();
        info.auth = 'ok';

        const gs = google.sheets({ version: 'v4', auth: jwt });
        await gs.spreadsheets.get({ spreadsheetId: sheetId });
        info.sheetAccess = 'ok';

        return res.json({ ok: true, info });
    } catch (err) {
        return res.status(500).json({ ok: false, stage: 'catch', error: String(err?.message || err), info });
    }
}