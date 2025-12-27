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

Always search manufacturer sites (hoyt.com, mathewsinc.com, pse-archery.com, bowtech.com, elitearchery.com, etc.) for the exact model and all variants (e.g., standard, Ultra, SD, LD, 29.5", 31").

**IMPORTANT**: If the input is partial (e.g., "hoyt rx9", "mathews lift", "pse evo"), ALWAYS set ambiguous=true and list 2–5 matching variants (different years, trims, draw lengths, etc.). Do NOT default to one variant.

Return ONLY valid JSON. No text outside {}. No markdown, no intro/outro.

Structure:
{
  "ambiguous": boolean,
  "matches": [
    {
      "full_name": "2025 Hoyt RX-9 Ultra",
      "year": "2025",
      "type": "compound",
      "ibo": number or null,
      "brace": number or null,
      "cam": string or null
    }
  ],
  "clarification": short question if ambiguous (e.g., "Which variant do you have?")
}

Rules:
- If one clear match: ambiguous=false, matches=[one object]
- If ambiguous: ambiguous=true, matches=2–5 best options, clarification=question
- If no match: { "error": "not found" }
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