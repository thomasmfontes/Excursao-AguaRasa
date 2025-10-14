import { google } from 'googleapis';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method' });

    const body = req.body || {};
    if (!body.fullName || !body.cpf) return res.status(400).json({ error: 'nome e cpf obrigatorios' });

    const sheetId = process.env.SHEET_ID;
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY; // multilinha

    if (!sheetId) return res.status(500).json({ error: 'SHEET_ID ausente' });
    if (!clientEmail || !privateKey) return res.status(500).json({ error: 'GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY ausentes' });

    try {
        const jwt = new google.auth.JWT(clientEmail, null, privateKey, [
            'https://www.googleapis.com/auth/spreadsheets'
        ]);
        await jwt.authorize();

        const gs = google.sheets({ version: 'v4', auth: jwt });
        await gs.spreadsheets.get({ spreadsheetId: sheetId }); // sanity check

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