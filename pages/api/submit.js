import { google } from 'googleapis';

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method'});
  const body = req.body;
  if(!body.fullName || !body.cpf) return res.status(400).json({error:'nome e cpf obrigatorios'});

  const sheetId = process.env.SHEET_ID;
  const svcRaw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}';
  let svc;
  try { svc = JSON.parse(svcRaw); } catch { return res.status(500).json({error:'GOOGLE_SERVICE_ACCOUNT_JSON inválido'}); }
  if(!sheetId || !svc.client_email) return res.status(500).json({error:'server config missing'});

  try{
    const jwt = new google.auth.JWT(
      svc.client_email,
      null,
      svc.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    await jwt.authorize();
    const gs = google.sheets({version:'v4', auth: jwt});
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
      requestBody: { values: [row] }
    });
    return res.json({ok:true});
  }catch(err){
    console.error(err);
    return res.status(500).json({error: String(err)});
  }
}