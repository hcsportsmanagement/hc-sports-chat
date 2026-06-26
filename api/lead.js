export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hcsportsmanagement.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing fields' });

  // Split name into first/last
  const parts = name.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || 'Unknown';

  try {
    const params = new URLSearchParams({
      oid: '00Dfn00000BOwZB',
      retURL: 'https://hcsportsmanagement.com',
      first_name: firstName,
      last_name: lastName,
      email: email,
      lead_source: 'Web',
    });

    const response = await fetch('https://webto.salesforce.com/servlet/servlet.WebToLead?encoding=UTF-8', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    // Salesforce returns a redirect (302) on success
    if (response.ok || response.status === 302 || response.redirected) {
      return res.status(200).json({ success: true });
    }

    console.error('Salesforce error:', response.status);
    return res.status(500).json({ error: 'Salesforce submission failed' });

  } catch (err) {
    console.error('Lead handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
