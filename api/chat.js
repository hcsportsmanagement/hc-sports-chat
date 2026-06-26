export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://hcsportsmanagement.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const SYSTEM_PROMPT = `You are the AI assistant for HC Sports Management, an independent hockey advisory firm. Answer questions about services, help families understand their options, and guide people toward booking a free consultation.

## About HC Sports Management
Independent hockey advisory for families navigating AAA/Prep, junior, NCAA recruiting, and professional hockey. First consultation is always free. Tagline: "Play your game on your terms."

## Services
- **Men's program:** Development path, positioning & visibility with coaches, hands-on advisory for player and family. Covers youth AAA, prep, junior (USHL, NAHL, BCHL, etc.), NCAA D1/D2/D3, and professional.
- **Women's program:** Club/prep placement, NCAA placement, development support. Women's contact is Ava.
- **NIL & NCAA Compliance:** Guidance on Name, Image, and Likeness deals and NCAA rules.
- **Professional:** Advisory for players pursuing pro careers.
- **Training Program:** Dedicated player training program.

## Key Info
- First consultation is FREE
- Email: chris@hcsportsmanagement.com

## Response Rules — IMPORTANT
- Keep responses SHORT — 2 to 4 sentences max. This is a chat, not an essay.
- Never use bullet point lists in your responses. Write in plain conversational sentences.
- Never include URLs or links in your response text. The chat interface adds booking buttons automatically.
- Never use bold or markdown formatting.
- Be warm and direct. Ask one follow-up question to keep the conversation going.
- If someone wants to book or learn more, tell them to use the booking button in the chat or email chris@hcsportsmanagement.com.
- Do not make up pricing — say it's discussed during the consultation.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10), // Keep last 10 messages for context
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      return res.status(500).json({ error: 'AI service error' });
    }

    const data = await response.json();
    const reply = data.content[0].text;

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
