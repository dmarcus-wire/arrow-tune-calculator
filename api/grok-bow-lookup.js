export default async function handler(req, res) {
  const { model } = req.query;

  if (!model) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;

  // Debug logs
  console.log('DEBUG: XAI_API_KEY exists:', !!apiKey);
  console.log('DEBUG: XAI_API_KEY length:', apiKey ? apiKey.length : 'UNDEFINED');
  console.log('DEBUG: Node version:', process.version);

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not available at runtime' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [{ role: 'user', content: 'Test bow lookup: hoyt rx' }],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI error:', response.status, errorText);
      return res.status(500).json({ error: `xAI API ${response.status}: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      modelResponse: data.choices[0].message.content
    });
  } catch (e) {
    console.error('Fetch error:', e.message);
    return res.status(500).json({ error: 'Fetch failed: ' + e.message });
  }
}