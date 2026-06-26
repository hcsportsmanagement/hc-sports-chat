export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://hcsportsmanagement.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Missing fields' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HC Sports Chat <onboarding@resend.dev>',
        to: 'chris@hcsportsmanagement.com',
        subject: `New lead from website chat: ${name}`,
        html: `
          <h2>New lead from your website chat widget</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}</p>
          <br>
          <a href="mailto:${email}">Reply to ${name}</a>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
