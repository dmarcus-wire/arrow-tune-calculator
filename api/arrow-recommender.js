import OpenAI from 'openai';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const {
    appType = 'Hunting',
    bowModel = '',
    drawLen = 28,
    drawWt = 70
  } = req.query;

  if (!bowModel) return res.status(400).json({ error: 'Missing bowModel' });

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not loaded' });

  try {
    const openai = new OpenAI({ apiKey, baseURL: 'https://api.x.ai/v1' });

    const completion = await openai.chat.completions.create({
      model: 'grok-4-1-fast-reasoning',
      messages: [
        {
          role: 'system',
          content: `You are an archery arrow recommendation assistant.

Always return exactly 3 arrow recommendations for the user's bow setup, categorized as light/fast, balanced, and heavy.

User inputs: appType="${appType}", bowModel="${bowModel}", drawLen=${drawLen}, drawWt=${drawWt}.

Best practices:
- FOC: 12–18%
- GPP: 6.5–7.5
- GPI: 7–9.5
- FPS >= 270

Return ONLY valid JSON:
{
  "ambiguous": true,
  "matches": [
    {
      "full_name": "Light/Fast arrow name",
      "year": "Year",
      "type": "Hunting",
      "arrowLength": "Recommended cut length",
      "foc": "FOC %",
      "gpp": "GPP",
      "gpi": "GPI",
      "stiffness": "Spine",
      "why": "Reason why it fits"
    },
    {
      "full_name": "Balanced arrow name",
      "year": "Year",
      "type": "Hunting",
      "arrowLength": "Recommended cut length",
      "foc": "FOC %",
      "gpp": "GPP",
      "gpi": "GPI",
      "stiffness": "Spine",
      "why": "Reason why it fits"
    },
    {
      "full_name": "Heavy arrow name",
      "year": "Year",
      "type": "Hunting",
      "arrowLength": "Recommended cut length",
      "foc": "FOC %",
      "gpp": "GPP",
      "gpi": "GPI",
      "stiffness": "Spine",
      "why": "Reason why it fits"
    }
  ],
  "clarification": "Select an arrow to auto-fill"
}

- Use real arrows (Easton, Gold Tip, Victory, etc.).
- Ensure all meet best practices.
- arrowLength: drawLen + 0.5 to 1 inch.
- Output pure JSON only.`,
        },
        {
          role: 'user',
          content: `Recommend 3 arrows (light/fast, balanced, heavy) for ${bowModel}, ${drawWt} lb, ${drawLen} in, ${appType}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content.trim();
    const data = JSON.parse(content);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}