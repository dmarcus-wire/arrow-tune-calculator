import OpenAI from 'openai';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { appType, bowModel, drawLen, drawWt, totalWt = 0, pointWt = 125, arrowLen = 28.5, spine = 300, foc = 10 } = req.query;

  if (!appType || !bowModel) {
    return res.status(400).json({ error: 'Missing required inputs (appType, bowModel)' });
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
          content: `You are an archery arrow recommendation assistant.

User inputs: appType = "${appType}", bowModel = "${bowModel}", drawLen = ${drawLen}", drawWt = ${drawWt}, totalWt = ${totalWt}, pointWt = ${pointWt}, arrowLen = ${arrowLen}, spine = ${spine}, foc = ${foc}.

Thresholds for perfect arrow:
- FOC: Compound/Hunting 12–18%, Target 10–14%, Recurve/Longbow 15–22%
- GPP: Compound/Hunting 6.5–7.5, Target 6.0–8.0, Recurve/Longbow 7.5–9.5
- GPI: Compound/Hunting 7–9.5, Target 6–8.5, Recurve/Longbow 9–12
- Stiffness: Compound/Hunting ±60 spine, Target ±40 spine, Recurve/Longbow ±80 spine

Suggest 1–3 arrows that meet these thresholds based on user inputs. Use web_search/browse_page tools if needed.

Return ONLY valid JSON:
{
  "ambiguous": boolean,
  "matches": [
    {
      "full_name": "Arrow full name",
      "year": "Year",
      "type": "Type",
      "foc": "FOC %",
      "gpp": "GPP",
      "gpi": "GPI",
      "stiffness": "Spine",
      "why": "Short reason why it fits"
    }
  ],
  "clarification": string or null
}

- If one perfect match: ambiguous=false, matches=[single object]
- If multiple: ambiguous=true, matches=2–3 options, clarification="Choose the best one for your setup"
- If no match: { "error": "not found" }
- Output pure JSON only.`,
        },
        {
          role: 'user',
          content: `Suggest perfect arrow for: appType=${appType}, bowModel=${bowModel}, drawLen=${drawLen}, drawWt=${drawWt}, totalWt=${totalWt}, pointWt=${pointWt}, arrowLen=${arrowLen}, spine=${spine}, foc=${foc}`,
        },
      ],
      temperature: 0.0,
      max_tokens: 500,
      response_format: { type: "json_object" },
      tools: [ /* your tools array */ ]
    });

    const content = completion.choices[0].message.content.trim();

    let suggestions;
    try {
      suggestions = JSON.parse(content);
    } catch (e) {
      suggestions = { error: "Invalid JSON from model", raw: content };
    }

    return res.status(200).json(suggestions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}