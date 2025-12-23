export default async function handler(req, res) {
  const { model: userModel } = req.query;

  if (!userModel) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;

  // Debug logs
  console.log('XAI_API_KEY exists:', !!apiKey);
  console.log('XAI_API_KEY length:', apiKey ? apiKey.length : 'undefined');

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not set in environment variables' });
  }

  try {
    const fetchUrl = 'https://api.x.ai/v1/chat/completions';
    console.log('Fetching from:', fetchUrl);

    const body = JSON.stringify({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        { role: 'user', content: `Test: bow model ${userModel}` }
      ],
      temperature: 0.1
    });
    console.log('Request body:', body);

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}` // trim to be safe
      },
      body
    });

    console.log('xAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI full response error:', errorText);
      return res.status(500).json({ error: `xAI API failed: ${response.status} - ${errorText}` });
    }

    const data = await response.json();
    console.log('xAI response:', JSON.stringify(data, null, 2));

    // For now, just echo a simple response
    return res.status(200).json({ success: true, modelResponse: data.choices[0].message.content });
  } catch (e) {
    console.error('Proxy error:', e.message, e.stack);
    return res.status(500).json({ error: 'Internal error: ' + e.message });
  }
}