const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = (process.env.PAYLOR_API_KEY || '').trim();
  const channelId = (process.env.PAYLOR_CHANNEL_ID || '').trim();

  if (!apiKey) return res.status(500).json({ error: 'Server misconfigured: PAYLOR_API_KEY missing' });
  if (!channelId) return res.status(500).json({ error: 'Server misconfigured: PAYLOR_CHANNEL_ID missing' });

  try {
    const { phone, amount, reference, description } = req.body || {};

    if (!phone || !amount || !reference) {
      return res.status(400).json({ error: 'Missing required fields: phone, amount, reference' });
    }

    const payload = {
      phone: String(phone),
      amount: Number(amount),
      reference: String(reference),
      channelId: channelId,
      description: description || 'TIMIZA Fund Payment'
    };

    const response = await fetch('https://api.paylorke.com/api/v1/merchants/payments/stk-push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.message || data.error || 'STK push failed'
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('STK Function error:', error);
    return res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};
