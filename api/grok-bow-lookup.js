// api/grok-bow-lookup.js
export default async function handler(req, res) {
  const { model } = req.query;

  if (!model) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          {
            role: 'system',
            content: 'You are an archery bow specs database. Reply ONLY with valid JSON containing: type (string: compound/recurve/longbow), ibo (number), brace (number), cam (string). If not found, return {error: "not found"}. No explanations, no extra text.'
          },
          {
            role: 'user',
            content: `Find specs for bow model: ${model}`
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    try {
      const specs = JSON.parse(content);
      return res.status(200).json(specs);
    } catch (e) {
      return res.status(500).json({ error: 'Invalid response format' });
    }
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: 'Failed to fetch specs' });
  }
}