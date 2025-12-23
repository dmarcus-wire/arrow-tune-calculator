export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { model: userModel } = req.query;

  if (!userModel) {
    return res.status(400).json({ error: 'Missing bow model' });
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not loaded' });
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'User-Agent': 'ArrowForge/1.0 (Vercel)',
      },
      body: JSON.stringify({
        model: 'grok-4-1-fast-reasoning',
        messages: [
          {
            role: 'system',
            content: `You are an archery bow spec lookup assistant.

You MUST return ONLY a valid JSON object with this exact structure. No markdown, no extra text, no explanations — just the JSON.

{
  "ambiguous": boolean,
  "matches": [
    {
      "full_name": string,
      "year": string or null,
      "type": string,
      "ibo": number or null,
      "brace": number or null,
      "cam": string or null
    }
  ],
  "clarification": string or null
}

- If one clear match: ambiguous = false, matches = [one object]
- If ambiguous: ambiguous = true, matches = array of 2–5 best matches, clarification = short question
- If no match: { "error": "not found" }

User query: "${userModel}"`,
          },
          {
            role: 'user',
            content: `Find specs for bow model: ${userModel}`,
          },
        ],
        temperature: 0.0,
        max_tokens: 500,
        response_format: { type: "json_object" },  // This forces JSON
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `xAI error: ${errorText}` });
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Parse and validate JSON
    let specs;
    try {
      specs = JSON.parse(content);
    } catch (e) {
      specs = { error: "Invalid JSON from model", raw: content };
    }

    return res.status(200).json(specs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}