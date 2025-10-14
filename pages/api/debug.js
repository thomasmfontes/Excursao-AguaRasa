import crypto from 'crypto';
import { google } from 'googleapis';

export default async function handler(req, res) {
    try {
        const info = {};
        // 1) Envs presentes?
        info.hasSheetId = !!process.env.SHEET_ID;
        info.sheetIdLen = (process.env.SHEET_ID || '').length;

        const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
        info.hasJson = !!raw;
        info.jsonLen = raw.length;

        // 2) Parse seguro
        let svc = null;
        try { svc = JSON.parse(raw); } catch (e) {
            return res.status(500).json({ ok: false, stage: 'parse', error: 'GOOGLE_SERVICE_ACCOUNT_JSON inválido' });
        }
        info.clientEmail = svc?.client_email || null;
        const pk = (svc?.private_key || '').replace(/\\n/g, '\n');
        info.privateKeyPresent = !!pk;
        info.privateKeyHash = pk ? crypto.createHash('sha256').update(pk.slice(0, 80)).digest('hex') : null;

        if (!info.hasSheetId) return res.status(500).json({ ok: false, stage: 'env', error: 'SHEET_ID ausente', info });
        if (!info.hasJson) return res.status(500).json({ ok: false, stage: 'env', error: 'GOOGLE_SERVICE_ACCOUNT_JSON ausente', info });
        if (!info.clientEmail || !info.privateKeyPresent) {
            return res.status(500).json({ ok: false, stage: 'env', error: 'client_email ou private_key ausentes', info });
        }

        // 3) Auth
        const jwt = new google.auth.JWT(info.clientEmail, null, pk, [
            'https://www.googleapis.com/auth/spreadsheets'
        ]);
        await jwt.authorize();
        info.auth = 'ok';

        // 4) Teste acesso à planilha
        const gs = google.sheets({ version: 'v4', auth: jwt });
        await gs.spreadsheets.get({ spreadsheetId: process.env.SHEET_ID });
        info.sheetAccess = 'ok';

        return res.json({ ok: true, info });
    } catch (err) {
        return res.status(500).json({ ok: false, stage: 'catch', error: String(err?.message || err) });
    }
}