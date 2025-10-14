import { google } from 'googleapis';

export default async function handler(req, res) {
    const info = {};

    info.sheetId = process.env.SHEET_ID || null;

    const emailA = process.env.GOOGLE_CLIENT_EMAIL;
    const keyA = process.env.GOOGLE_PRIVATE_KEY;
    const keyB64 = process.env.GOOGLE_PRIVATE_KEY_BASE64;
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';

    info.mode =
        emailA && keyA ? 'separate-envs' :
            (emailA && keyB64) ? 'separate-envs-base64' :
                raw ? 'json-env' : 'none';

    try {
        let clientEmail, privateKey;

        if (info.mode === 'separate-envs') {
            clientEmail = emailA;
            privateKey = keyA;
        } else if (info.mode === 'separate-envs-base64') {
            clientEmail = emailA;
            privateKey = Buffer.from(keyB64, 'base64').toString('utf8');
        } else if (info.mode === 'json-env') {
            const svc = JSON.parse(raw);
            clientEmail = svc.client_email;
            privateKey = (svc.private_key || '').replace(/\\n/g, '\n');
        }

        info.clientEmailOk = !!clientEmail;
        info.privateKeyLen = privateKey ? privateKey.length : 0;
        info.privateKeyStartsWith = privateKey ? privateKey.slice(0, 27) : null; // deve começar com "-----BEGIN PRIVATE KEY-----"

        if (!info.sheetId) return res.status(500).json({ ok: false, stage: 'env', error: 'SHEET_ID ausente', info });
        if (!info.clientEmailOk || !info.privateKeyLen) {
            return res.status(500).json({ ok: false, stage: 'env', error: 'client_email/private_key ausentes', info });
        }

        const jwt = new google.auth.JWT(clientEmail, null, privateKey, [
            'https://www.googleapis.com/auth/spreadsheets'
        ]);
        await jwt.authorize();
        info.auth = 'ok';

        const gs = google.sheets({ version: 'v4', auth: jwt });
        await gs.spreadsheets.get({ spreadsheetId: info.sheetId });
        info.sheetAccess = 'ok';

        return res.json({ ok: true, info });
    } catch (err) {
        return res.status(500).json({ ok: false, stage: 'catch', error: String(err?.message || err), info });
    }
}