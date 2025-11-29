import { google } from 'googleapis';

export default async function handler(req, res) {
    const info = {
        mode: 'separate-envs-only',
        sheetIdOk: !!process.env.SHEET_ID,
        clientEmailOk: !!process.env.GOOGLE_CLIENT_EMAIL,
    };

    const pkRaw = process.env.GOOGLE_PRIVATE_KEY || '';
    const privateKey = pkRaw.replace(/\r/g, '\n');

    info.privateKeyLen = privateKey.length;
    info.privateKeyStartsWith = privateKey.slice(0, 27); // deve ser "-----BEGIN PRIVATE KEY-----"

    if (!info.sheetIdOk) return res.status(500).json({ ok: false, stage: 'env', error: 'SHEET_ID ausente', info });
    if (!info.clientEmailOk || !info.privateKeyLen) return res.status(500).json({ ok: false, stage: 'env', error: 'GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY ausentes', info });

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: process.env.GOOGLE_CLIENT_EMAIL, private_key: privateKey },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const gs = google.sheets({ version: 'v4', auth });
        await gs.spreadsheets.get({ spreadsheetId: process.env.SHEET_ID });
        info.auth = 'ok';
        info.sheetAccess = 'ok';
        return res.json({ ok: true, info });
    } catch (err) {
        return res.status(500).json({ ok: false, stage: 'catch', error: String(err?.message || err), info });
    }
}