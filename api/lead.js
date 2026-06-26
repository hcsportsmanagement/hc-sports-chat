export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, transcript } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing fields' });

  const PA_URL = 'https://defaulta080c9a190764592b6bb46d84fcc71.fb.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/4af52230dd74435f8cd5448bbdb7f9ca/triggers/manual/paths/invoke?api-version=1';

  try {
    // Send to Power Automate → Excel
    const paRes = await fetch(PA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, transcript: transcript || '' }),
    });
    console.log('Power Automate status:', paRes.status);
  } catch (err) {
    console.error('Power Automate error:', err);
  }

  // Salesforce Web-to-Lead
  try {
    const parts = name.trim().split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || 'Unknown';
    const params = new URLSearchParams({
      oid: '00Dfn00000BOwZB',
      retURL: 'https://hcsportsmanagement.com',
      first_name: firstName,
      last_name: lastName,
      email: email,
      lead_source: 'Web',
    });
    await fetch('https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
  } catch (err) {
    console.error('Salesforce error:', err);
  }

  return res.status(200).json({ success: true });
}
