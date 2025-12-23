import OpenAI from 'openai';

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
    const openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.x.ai/v1',
    });

    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: `You are an archery bow spec lookup assistant. User input: "${userModel}" (may be partial/ambiguous).

          Use web_search and browse_page tools to fetch accurate specs from manufacturer sites (hoyt.com, mathewsinc.com) or reliable sources.

          **STRICT RULES**:
          - Return ONLY valid JSON. No text outside {}. No markdown, no intro/outro, no explanations.
          - Do NOT assume trim levels (e.g., "Ultra") unless the user explicitly mentions them. Stick to the base model unless evidence shows otherwise.
          - Use this exact structure:
          {
            "ambiguous": boolean,
            "matches": array of objects like {
              "full_name": "2025 Hoyt Carbon RX-9",
              "year": "2025",
              "type": "compound",
              "ibo": number or null,
              "brace": number or null,
              "cam": string or null
            },
            "clarification": short string (max 100 chars, only if ambiguous) like "Which year/model?"
          }

          Rules:
          - If one clear match, ambiguous=false, matches=[single object]
          - If ambiguous, ambiguous=true, matches=2–5 best options, clarification=question
          - If nothing found, { "error": "not found" }
          - Output pure JSON only.`,

User query: "${userModel}"`,
        },
        {
          role: 'user',
          content: `Find specs for bow model: ${userModel}`,
        },
      ],
      temperature: 0.0,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content.trim();

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