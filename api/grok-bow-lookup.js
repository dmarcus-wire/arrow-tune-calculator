export default async function handler(req, res) {
  const { model: userModel } = req.query;

  if (!userModel) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;
  console.log('API Key exists:', !!apiKey); // Debug: check env var
  console.log('Bow model:', userModel);

  try {
    const response = await fetch('https://api.grok.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: `You are an archery bow spec lookup assistant. Return ONLY valid JSON for bow "${userModel}": {"ambiguous":false,"matches":[{"full_name":"${userModel}","type":"compound","ibo":340,"brace":6.125,"cam":"HBX Gen 4"}]}`
          },
          { role: 'user', content: `Find specs for: ${userModel}` }
        ],
        temperature: 0.1,
        max_tokens: 200
        // NO TOOLS for now - we'll add later
      })
    });

    console.log('xAI response status:', response.status); // Debug
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API error:', response.status, errorText);
      throw new Error(`xAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('xAI response structure:', JSON.stringify(data, null, 2)); // Debug full response
    
    const content = data.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No content in response');
    }
    
    console.log('Raw content:', content); // Debug
    
    try {
      const specs = JSON.parse(content);
      return res.status(200).json(specs);
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message);
      console.error('Failed content:', content);
      return res.status(500).json({ error: 'Invalid JSON from model' });
    }
  } catch (e) {
    console.error('FULL ERROR:', e.message);
    console.error('Stack:', e.stack);
    return res.status(500).json({ error: 'Failed to fetch specs: ' + e.message });
  }
}